import type { RTCSession } from "jssip/lib/RTCSession";

import type { ExtensionCredentials } from "../utils/extensionCredentials";

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

export type ExtensionMediaState = {
  muted: boolean;
  held: boolean;
};

export type ExtensionCallTermination = {
  cause?: string;
  statusCode?: number;
  originator?: string;
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

const noopUnsubscribe = () => {};

class ExtensionSipClientStub {
  get state(): ExtensionRegistrationState {
    return "idle";
  }

  onStateChange(_listener: StateListener): () => void {
    return noopUnsubscribe;
  }

  onIncomingCall(_listener: IncomingCallListener): () => void {
    return noopUnsubscribe;
  }

  onOutgoingCall(_listener: OutgoingCallListener): () => void {
    return noopUnsubscribe;
  }

  onCallTerminated(_listener: CallTerminatedListener): () => void {
    return noopUnsubscribe;
  }

  onMediaStateChange(_listener: MediaStateListener): () => void {
    return noopUnsubscribe;
  }

  onCallAudioConfigured(_listener: CallAudioConfiguredListener): () => void {
    return noopUnsubscribe;
  }

  connect(_credentials: ExtensionCredentials): void {}

  disconnect(): void {}

  async makeCall(_destination: string): Promise<string | null> {
    return null;
  }

  async answerIncoming(): Promise<void> {}

  hangupActive(): void {}

  isCallMediaReady(): boolean {
    return false;
  }

  toggleMute(): boolean {
    return false;
  }

  toggleHold(): boolean {
    return false;
  }

  sendDtmf(_digit: string): void {}
}

export const extensionSipClient = new ExtensionSipClientStub();
