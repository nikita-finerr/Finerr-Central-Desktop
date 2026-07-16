import * as JsSIP from "jssip";
import type { RTCSession } from "jssip/lib/RTCSession";
import type { RTCSessionEvent } from "jssip/lib/UA";
import { PermissionsAndroid, Platform } from "react-native";
import { mediaDevices, registerGlobals } from "react-native-webrtc";

import type { ExtensionCredentials } from "../utils/extensionCredentials";
import { extensionCredentialsKey } from "../utils/extensionCredentials";
import {
  configureExtensionCallAudio,
  releaseExtensionCallAudio,
} from "../utils/finerrCallBridge";
import { formatExtensionDialNumber } from "../utils/phoneUtils";

export type ExtensionRegistrationState =
  | "idle"
  | "connecting"
  | "registered"
  | "unregistered"
  | "failed";

export type ExtensionIncomingCall = {
  callerNumber: string;
  displayName: string;
};

type StateListener = (state: ExtensionRegistrationState) => void;
type IncomingCallListener = (
  call: ExtensionIncomingCall,
  session: RTCSession,
) => void;
type OutgoingCallListener = (destination: string, session: RTCSession) => void;
type CallTerminatedListener = (details: ExtensionCallTermination) => void;
type MediaStateListener = (state: ExtensionMediaState) => void;
type CallAudioConfiguredListener = () => void;

export type ExtensionMediaState = {
  muted: boolean;
  held: boolean;
};

export type ExtensionCallTermination = {
  session: RTCSession;
  reason: "ended" | "failed";
  cause?: string;
  statusCode?: number;
  originator?: string;
};

let webRtcGlobalsRegistered = false;

const WEBRTC_PC_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ensureWebRtcGlobals = (): void => {
  if (webRtcGlobalsRegistered) {
    return;
  }

  registerGlobals();
  webRtcGlobalsRegistered = true;
};

class ExtensionSipClient {
  private ua: InstanceType<typeof JsSIP.UA> | null = null;
  private activeCredentialsKey: string | null = null;
  private wsCandidateIndex = 0;
  private baseConfig: ExtensionCredentials | null = null;
  private registrationState: ExtensionRegistrationState = "idle";
  private activeSession: RTCSession | null = null;
  private suppressDisconnectHandler = false;
  private connectionExhausted = false;
  private connectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionGeneration = 0;
  private localMediaStream: Awaited<
    ReturnType<typeof mediaDevices.getUserMedia>
  > | null = null;
  private stateListeners = new Set<StateListener>();
  private incomingCallListeners = new Set<IncomingCallListener>();
  private outgoingCallListeners = new Set<OutgoingCallListener>();
  private callTerminatedListeners = new Set<CallTerminatedListener>();
  private mediaStateListeners = new Set<MediaStateListener>();
  private callAudioConfiguredListeners = new Set<CallAudioConfiguredListener>();

  get state(): ExtensionRegistrationState {
    return this.registrationState;
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.registrationState);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onIncomingCall(listener: IncomingCallListener): () => void {
    this.incomingCallListeners.add(listener);
    return () => {
      this.incomingCallListeners.delete(listener);
    };
  }

  onOutgoingCall(listener: OutgoingCallListener): () => void {
    this.outgoingCallListeners.add(listener);
    return () => {
      this.outgoingCallListeners.delete(listener);
    };
  }

  onCallTerminated(listener: CallTerminatedListener): () => void {
    this.callTerminatedListeners.add(listener);
    return () => {
      this.callTerminatedListeners.delete(listener);
    };
  }

  onMediaStateChange(listener: MediaStateListener): () => void {
    this.mediaStateListeners.add(listener);
    listener(this.getMediaState());
    return () => {
      this.mediaStateListeners.delete(listener);
    };
  }

  onCallAudioConfigured(listener: CallAudioConfiguredListener): () => void {
    this.callAudioConfiguredListeners.add(listener);
    return () => {
      this.callAudioConfiguredListeners.delete(listener);
    };
  }

  isCallMediaReady(): boolean {
    const session = this.activeSession;
    return Boolean(session?.isEstablished());
  }

  getMediaState(): ExtensionMediaState {
    const session = this.activeSession;
    if (!session) {
      return { muted: false, held: false };
    }

    return {
      muted: Boolean(session.isMuted().audio),
      held: Boolean(session.isOnHold().local),
    };
  }

  connect(config: ExtensionCredentials): void {
    ensureWebRtcGlobals();

    if (this.activeSession) {
      return;
    }

    const nextKey = extensionCredentialsKey(config);

    if (this.activeCredentialsKey === nextKey) {
      if (
        this.registrationState === "registered" ||
        this.registrationState === "connecting"
      ) {
        return;
      }

      if (this.registrationState === "failed" || this.connectionExhausted) {
        return;
      }
    }

    this.connectionExhausted = false;
    this.stopUa();
    this.baseConfig = config;
    this.activeCredentialsKey = nextKey;
    this.wsCandidateIndex = 0;
    this.startWithCurrentWsUrl();
  }

  disconnect(): void {
    this.activeCredentialsKey = null;
    this.baseConfig = null;
    this.connectionExhausted = false;
    this.stopUa();
    this.setState("idle");
  }

  async answerIncoming(): Promise<void> {
    const session = this.activeSession;
    if (!session) {
      return;
    }

    await this.ensureMicrophonePermission();

    session.answer({
      mediaConstraints: { audio: true, video: false },
      pcConfig: WEBRTC_PC_CONFIG,
    });
  }

  hangupActive(): void {
    const session = this.activeSession;
    if (!session) {
      return;
    }

    if (session.isEstablished()) {
      session.terminate();
    } else {
      session.terminate({ status_code: 486, reason_phrase: "Busy Here" });
    }
    this.activeSession = null;
    this.releaseLocalMediaStream();
  }

  /** @deprecated Use hangupActive — kept for existing call sites. */
  hangupIncoming(): void {
    this.hangupActive();
  }

  async makeCall(phoneNumber: string): Promise<string> {
    if (!this.ua || this.registrationState !== "registered") {
      throw new Error("Extension SIP is not registered.");
    }

    if (this.activeSession) {
      throw new Error("Already on a call.");
    }

    if (!this.baseConfig) {
      throw new Error("Extension SIP is not configured.");
    }

    const dialNumber = formatExtensionDialNumber(phoneNumber);
    if (dialNumber.length < 3) {
      throw new Error("Enter a valid phone number.");
    }

    await this.ensureMicrophonePermission();
    this.releaseLocalMediaStream();
    this.localMediaStream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const target = `sip:${dialNumber}@${this.baseConfig.host}`;
    console.log("Extension SIP placing call:", { dialNumber, target });

    const session = this.ua.call(target, {
      mediaStream: (this.localMediaStream ?? undefined) as never,
      mediaConstraints: { audio: true, video: false },
      pcConfig: WEBRTC_PC_CONFIG,
      rtcOfferConstraints: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      },
    });

    this.activeSession = session;
    return session.id ?? `extension-out-${Date.now()}`;
  }

  toggleMute(): boolean {
    const session = this.activeSession;
    if (!session?.isEstablished()) {
      throw new Error("Mute is available once the call is connected.");
    }

    const isMuted = Boolean(session.isMuted().audio);
    if (isMuted) {
      session.unmute({ audio: true });
    } else {
      session.mute({ audio: true });
    }

    const nextState = this.getMediaState();
    this.notifyMediaState(nextState);
    return nextState.muted;
  }

  toggleHold(): boolean {
    const session = this.activeSession;
    if (!session?.isEstablished()) {
      throw new Error("Hold is available once the call is connected.");
    }

    const isHeld = Boolean(session.isOnHold().local);
    if (isHeld) {
      session.unhold();
    } else {
      session.hold();
    }

    return !isHeld;
  }

  sendDtmf(digit: string): void {
    const session = this.activeSession;
    if (!session?.isEstablished()) {
      throw new Error("Dialpad is available once the call is connected.");
    }

    session.sendDTMF(digit);
  }

  private async ensureMicrophonePermission(): Promise<void> {
    if (Platform.OS !== "android") {
      return;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error("Microphone permission is required to place calls.");
    }
  }

  private releaseLocalMediaStream(): void {
    if (!this.localMediaStream) {
      return;
    }

    this.localMediaStream.getTracks().forEach((track) => track.stop());
    this.localMediaStream = null;
  }

  private logSessionEvent(
    label: string,
    session: RTCSession,
    extra?: Record<string, unknown>,
  ): void {
    console.log(`Extension SIP session ${label}:`, {
      id: session.id,
      direction: session.direction,
      ...extra,
    });
  }

  private getSipStatusCode(message: unknown): number | undefined {
    if (
      message &&
      typeof message === "object" &&
      "status_code" in message &&
      typeof message.status_code === "number"
    ) {
      return message.status_code;
    }

    return undefined;
  }

  private getSipReasonPhrase(message: unknown): string | undefined {
    if (
      message &&
      typeof message === "object" &&
      "reason_phrase" in message &&
      typeof message.reason_phrase === "string"
    ) {
      return message.reason_phrase;
    }

    return undefined;
  }

  private attachSessionLifecycle(session: RTCSession): void {
    session.on("progress", (event: { response?: { status_code?: number } }) => {
      this.logSessionEvent("progress", session, {
        statusCode: event.response?.status_code,
      });
    });

    session.on("accepted", () => {
      this.logSessionEvent("accepted", session);
      void this.configureCallAudio();
    });

    session.on("confirmed", () => {
      this.logSessionEvent("confirmed", session);
      void this.configureCallAudio();
      this.notifyMediaState(this.getMediaState());
    });

    session.on("muted", () => {
      this.notifyMediaState(this.getMediaState());
    });

    session.on("unmuted", () => {
      this.notifyMediaState(this.getMediaState());
    });

    session.on("hold", () => {
      this.notifyMediaState(this.getMediaState());
    });

    session.on("unhold", () => {
      this.notifyMediaState(this.getMediaState());
    });

    session.on("ended", (event) => {
      const cause = "cause" in event ? String(event.cause) : undefined;
      const originator =
        "originator" in event ? String(event.originator) : undefined;
      this.logSessionEvent("ended", session, { cause, originator });
      if (this.activeSession === session) {
        this.activeSession = null;
      }
      this.releaseLocalMediaStream();
      void releaseExtensionCallAudio();
      this.notifyCallTerminated({
        session,
        reason: "ended",
        cause,
        originator,
      });
    });

    session.on("failed", (event) => {
      const statusCode = this.getSipStatusCode(
        "message" in event ? event.message : undefined,
      );
      const cause = "cause" in event ? String(event.cause) : undefined;
      const originator =
        "originator" in event ? String(event.originator) : undefined;
      this.logSessionEvent("failed", session, {
        cause,
        originator,
        statusCode,
        reason: this.getSipReasonPhrase(
          "message" in event ? event.message : undefined,
        ),
      });
      if (this.activeSession === session) {
        this.activeSession = null;
      }
      this.releaseLocalMediaStream();
      void releaseExtensionCallAudio();
      this.notifyCallTerminated({
        session,
        reason: "failed",
        cause,
        statusCode,
        originator,
      });
    });
  }

  private notifyMediaState(state: ExtensionMediaState): void {
    this.mediaStateListeners.forEach((listener) => listener(state));
  }

  private notifyCallAudioConfigured(): void {
    this.callAudioConfiguredListeners.forEach((listener) => listener());
  }

  private async configureCallAudio(): Promise<void> {
    await configureExtensionCallAudio();
    this.notifyCallAudioConfigured();
  }

  private notifyCallTerminated(details: ExtensionCallTermination): void {
    this.callTerminatedListeners.forEach((listener) => listener(details));
  }

  private setState(state: ExtensionRegistrationState): void {
    this.registrationState = state;
    this.stateListeners.forEach((listener) => listener(state));
  }

  private stopUa(): void {
    if (this.activeSession) {
      return;
    }

    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    if (!this.ua) {
      return;
    }

    this.suppressDisconnectHandler = true;
    try {
      this.ua.stop();
    } catch {
      // UA may already be stopped.
    }
    this.ua = null;
    this.activeSession = null;
    this.suppressDisconnectHandler = false;
  }

  private startWithCurrentWsUrl(): void {
    if (!this.baseConfig) {
      return;
    }

    const wsUrl = this.baseConfig.wsUrls[this.wsCandidateIndex];
    if (!wsUrl) {
      this.setState("failed");
      return;
    }

    this.setState("connecting");

    const { extension, host, password } = this.baseConfig;
    const connectionGeneration = ++this.connectionGeneration;

    console.log("Extension SIP connecting:", {
      extension,
      host,
      wsUrl,
    });

    const socket = new JsSIP.WebSocketInterface(wsUrl);
    const uri = `sip:${extension}@${host}`;

    this.ua = new JsSIP.UA({
      sockets: [socket],
      uri,
      password,
      register: true,
      register_expires: 300,
      session_timers: false,
    });

    const isCurrentConnection = (): boolean =>
      this.connectionGeneration === connectionGeneration;

    this.ua.on("connected", () => {
      if (!isCurrentConnection()) {
        return;
      }

      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }
      console.log("Extension SIP WebSocket connected:", wsUrl);
    });

    this.connectTimeout = setTimeout(() => {
      if (
        !isCurrentConnection() ||
        this.suppressDisconnectHandler ||
        this.connectionExhausted
      ) {
        return;
      }

      console.warn("Extension SIP WebSocket timeout:", wsUrl);
      this.tryNextWsUrl();
    }, 12_000);

    this.ua.on("disconnected", (event) => {
      if (!isCurrentConnection()) {
        return;
      }

      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }

      if (this.suppressDisconnectHandler || this.connectionExhausted) {
        return;
      }

      if (this.registrationState === "registered") {
        console.warn("Extension SIP WebSocket closed after registration");
        this.setState("unregistered");
        return;
      }

      const code = "code" in event ? String(event.code) : "unknown";
      const reason = "reason" in event ? String(event.reason) : "";
      console.warn("Extension SIP WebSocket error:", code, reason);

      this.tryNextWsUrl();
    });

    this.ua.on("registered", () => {
      if (!isCurrentConnection()) {
        return;
      }

      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }

      console.log("Extension SIP registered:", extension);
      this.setState("registered");
    });

    this.ua.on("unregistered", () => {
      if (!isCurrentConnection() || this.suppressDisconnectHandler) {
        return;
      }
      this.setState("unregistered");
    });

    this.ua.on("registrationFailed", (event) => {
      if (!isCurrentConnection()) {
        return;
      }

      const cause =
        "cause" in event.response ? String(event.response.cause) : "unknown";
      console.warn("Extension SIP registration failed:", cause);
      this.setState("failed");
    });

    this.ua.on("newRTCSession", (event: RTCSessionEvent) => {
      if (!isCurrentConnection()) {
        return;
      }

      const session = event.session;

      if (event.originator === "local") {
        if (this.activeSession && this.activeSession !== session) {
          session.terminate({
            status_code: 486,
            reason_phrase: "Busy Here",
          });
          return;
        }

        this.activeSession = session;
        const remoteIdentity = session.remote_identity;
        const destination =
          remoteIdentity?.uri?.user ??
          remoteIdentity?.display_name ??
          "Unknown";

        console.log("Extension SIP outgoing call:", destination);
        this.outgoingCallListeners.forEach((listener) =>
          listener(destination, session),
        );
        this.attachSessionLifecycle(session);
        return;
      }

      if (event.originator !== "remote") {
        return;
      }

      if (this.activeSession) {
        session.terminate({
          status_code: 486,
          reason_phrase: "Busy Here",
        });
        return;
      }

      this.activeSession = session;

      const remoteIdentity = session.remote_identity;
      const callerNumber =
        remoteIdentity?.uri?.user ?? remoteIdentity?.display_name ?? "Unknown";
      const displayName = remoteIdentity?.display_name ?? callerNumber;

      const incomingCall: ExtensionIncomingCall = {
        callerNumber,
        displayName,
      };

      console.log("Extension SIP incoming call:", incomingCall);
      this.incomingCallListeners.forEach((listener) =>
        listener(incomingCall, session),
      );

      this.attachSessionLifecycle(session);
    });

    this.ua.start();
  }

  private tryNextWsUrl(): void {
    if (!this.baseConfig || this.connectionExhausted) {
      return;
    }

    const nextIndex = this.wsCandidateIndex + 1;
    if (nextIndex >= this.baseConfig.wsUrls.length) {
      this.connectionExhausted = true;
      console.warn(
        "Extension SIP: all WebSocket endpoints failed for",
        this.baseConfig.host,
        "(tried WebSocket ports 5066, 7443, 5080, 5060)",
      );
      this.stopUa();
      this.setState("failed");
      return;
    }

    this.wsCandidateIndex = nextIndex;
    this.stopUa();
    this.startWithCurrentWsUrl();
  }
}

export const extensionSipClient = new ExtensionSipClient();
