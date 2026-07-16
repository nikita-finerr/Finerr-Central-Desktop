import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import { useSelector } from "react-redux";

import { AppRoutes } from "../constants";
import { navigationRef } from "../navigation/navigationRef";
import { extensionSipClient } from "../services/extensionSipClient";
import { findContactNameByPhone } from "../screens/App/Calls/data/contacts";
import type { RootState } from "../redux/store";
import type { CallDirection, CallDto } from "../types/call";
import { VoiceCallState } from "../types/voiceCallState";
import { getExtensionCredentials } from "../utils/extensionCredentials";
import {
  dismissIncomingCallAlert,
  isExtensionSpeakerEnabled,
  releaseExtensionCallAudio,
  setExtensionSpeakerEnabled,
} from "../utils/finerrCallBridge";
import { getPharmacyCallContext } from "../utils/pharmacyCallContext";
import { normalizeToE164 } from "../utils/phoneUtils";
import { navigateToActiveCall } from "../utils/navigateToActiveCall";
import { isActiveCallRouteFocused } from "../utils/isActiveCallRoute";
import { showErrorToast } from "../utils/toast";

export type DialOptions = {
  contactName?: string;
};

type OutboundCallContextValue = {
  dial: (phoneNumber: string, options?: DialOptions) => Promise<CallDto | null>;
  answer: () => Promise<void>;
  decline: () => Promise<void>;
  hangup: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleHold: () => Promise<void>;
  toggleSpeaker: () => Promise<void>;
  sendDtmf: (digit: string) => Promise<void>;
  transfer: (phoneNumber: string) => Promise<void>;
  loading: boolean;
  activeCall: CallDto | null;
  error: string | null;
  isVoiceReady: boolean;
  hasVoiceCredentials: boolean;
  isMuted: boolean;
  isHeld: boolean;
  isSpeakerOn: boolean;
  durationSeconds: number;
  callState: VoiceCallState | null;
  isIncomingRinging: boolean;
  isExtensionCall: boolean;
  isCallMinimized: boolean;
  minimizeCallScreen: () => void;
  restoreCallScreen: () => void;
  consumeMinimizeNavigationGuard: () => boolean;
  consumeCallClearingGuard: () => boolean;
};

const OutboundCallContext = createContext<OutboundCallContextValue | null>(null);

const leaveActiveCallScreen = () => {
  if (!navigationRef.isReady()) {
    return;
  }

  const currentRoute = navigationRef.getCurrentRoute();
  if (currentRoute?.name === AppRoutes.ActiveCall) {
    navigationRef.goBack();
  }
};

type Props = {
  children: ReactNode;
};

export const OutboundCallProvider = ({ children }: Props) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.userData != null,
  );
  const pharmacy = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy,
  );
  const extensionCredentials = getExtensionCredentials(pharmacy);
  const hasVoiceCredentials = Boolean(extensionCredentials);
  const [extensionRegistrationState, setExtensionRegistrationState] = useState(
    extensionSipClient.state,
  );
  const isVoiceReady = extensionRegistrationState === "registered";

  const [loading, setLoading] = useState(false);
  const [activeCall, setActiveCall] = useState<CallDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [callState, setCallState] = useState<VoiceCallState | null>(null);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isExtensionCall, setIsExtensionCall] = useState(false);

  const minimizedCallIdRef = useRef<string | null>(null);
  const isMinimizingCallScreenRef = useRef(false);
  const isExtensionCallRef = useRef(false);
  const isClearingCallRef = useRef(false);
  const speakerPreferenceRef = useRef(false);

  const applySpeakerPreference = useCallback(async () => {
    if (!isExtensionCallRef.current) {
      return;
    }

    const actual = await setExtensionSpeakerEnabled(
      speakerPreferenceRef.current,
    );
    speakerPreferenceRef.current = actual;
    setIsSpeakerOn(actual);
  }, []);

  const syncExtensionSpeakerState = useCallback(async () => {
    if (!isExtensionCallRef.current) {
      return;
    }

    const actual = await isExtensionSpeakerEnabled();
    speakerPreferenceRef.current = actual;
    setIsSpeakerOn(actual);
  }, []);

  const clearActiveCall = useCallback(() => {
    isClearingCallRef.current = true;
    isExtensionCallRef.current = false;
    setIsExtensionCall(false);
    minimizedCallIdRef.current = null;
    setIsCallMinimized(false);
    setActiveCall(null);
    setIsMuted(false);
    setIsHeld(false);
    setDurationSeconds(0);
    setCallState(null);
    if (Platform.OS === "android") {
      void dismissIncomingCallAlert();
    }
    void releaseExtensionCallAudio();
    speakerPreferenceRef.current = false;
    setIsSpeakerOn(false);
    leaveActiveCallScreen();
  }, []);

  const minimizeCallScreen = useCallback(() => {
    if (!activeCall) {
      return;
    }

    minimizedCallIdRef.current = activeCall.id;
    setIsCallMinimized(true);

    if (!isActiveCallRouteFocused()) {
      return;
    }

    if (navigationRef.isReady()) {
      isMinimizingCallScreenRef.current = true;
      navigationRef.goBack();
    }
  }, [activeCall]);

  const restoreCallScreen = useCallback(() => {
    minimizedCallIdRef.current = null;
    setIsCallMinimized(false);
    navigateToActiveCall();
  }, []);

  const consumeMinimizeNavigationGuard = useCallback(() => {
    if (!isMinimizingCallScreenRef.current) {
      return false;
    }

    isMinimizingCallScreenRef.current = false;
    return true;
  }, []);

  const consumeCallClearingGuard = useCallback(() => {
    if (!isClearingCallRef.current) {
      return false;
    }

    isClearingCallRef.current = false;
    return true;
  }, []);

  const openCallScreenIfNeeded = useCallback(
    (callId: string) => {
      if (!isAuthenticated) {
        return;
      }

      if (minimizedCallIdRef.current === callId) {
        return;
      }

      minimizedCallIdRef.current = null;
      setIsCallMinimized(false);

      if (!isActiveCallRouteFocused()) {
        navigateToActiveCall();
      }

      if (Platform.OS === "android") {
        void dismissIncomingCallAlert();
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    return extensionSipClient.onCallTerminated(() => {
      if (!isExtensionCallRef.current) {
        return;
      }

      clearActiveCall();
    });
  }, [clearActiveCall]);

  useEffect(() => {
    return extensionSipClient.onStateChange(setExtensionRegistrationState);
  }, []);

  useEffect(() => {
    return extensionSipClient.onCallAudioConfigured(() => {
      if (!isExtensionCallRef.current) {
        return;
      }

      void applySpeakerPreference();
    });
  }, [applySpeakerPreference]);

  useEffect(() => {
    return extensionSipClient.onMediaStateChange(({ muted, held }) => {
      if (!isExtensionCallRef.current) {
        return;
      }

      setIsMuted(muted);
      setIsHeld(held);
      if (held) {
        setCallState(VoiceCallState.HELD);
      } else if (extensionSipClient.isCallMediaReady()) {
        setCallState(VoiceCallState.ACTIVE);
      }

      void applySpeakerPreference();
    });
  }, [applySpeakerPreference]);

  useEffect(() => {
    return extensionSipClient.onIncomingCall((incoming, session) => {
      if (isExtensionCallRef.current) {
        return;
      }

      const credentials = getExtensionCredentials(pharmacy);
      const context = getPharmacyCallContext(pharmacy);
      const callId = session.id ?? `extension-${Date.now()}`;
      const contactName =
        incoming.displayName !== incoming.callerNumber
          ? incoming.displayName
          : findContactNameByPhone(incoming.callerNumber);

      isExtensionCallRef.current = true;
      setIsExtensionCall(true);
      setActiveCall({
        id: callId,
        telnyxCallControlId: callId,
        direction: "inbound",
        callerNumber: incoming.callerNumber,
        calleeNumber: credentials?.extension ?? context?.fromNumber ?? "",
        contactName,
        status: "ringing",
        pharmacyId: context?.pharmacyId,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setCallState(VoiceCallState.RINGING);
      setIsMuted(false);
      setIsHeld(false);
      speakerPreferenceRef.current = false;
      setIsSpeakerOn(false);
      setDurationSeconds(0);
      openCallScreenIfNeeded(callId);

      const markActive = () => {
        setCallState(VoiceCallState.ACTIVE);
        setActiveCall((current) =>
          current ? { ...current, status: "answered" } : current,
        );
        void syncExtensionSpeakerState();
      };

      session.on("accepted", markActive);
      session.on("confirmed", markActive);
    });
  }, [openCallScreenIfNeeded, pharmacy, syncExtensionSpeakerState]);

  useEffect(() => {
    return extensionSipClient.onOutgoingCall((destination, session) => {
      if (isExtensionCallRef.current) {
        return;
      }

      const context = getPharmacyCallContext(pharmacy);
      const credentials = getExtensionCredentials(pharmacy);
      const callId = session.id ?? `extension-out-${Date.now()}`;
      const contactName = findContactNameByPhone(destination);

      isExtensionCallRef.current = true;
      setIsExtensionCall(true);
      setActiveCall({
        id: callId,
        telnyxCallControlId: callId,
        direction: "outbound",
        callerNumber: credentials?.extension ?? context?.fromNumber ?? "",
        calleeNumber: destination,
        contactName,
        status: "initiated",
        pharmacyId: context?.pharmacyId,
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setCallState(VoiceCallState.CONNECTING);
      setIsMuted(false);
      setIsHeld(false);
      speakerPreferenceRef.current = false;
      setIsSpeakerOn(false);
      setDurationSeconds(0);
      openCallScreenIfNeeded(callId);

      const markActive = () => {
        setCallState(VoiceCallState.ACTIVE);
        setActiveCall((current) =>
          current ? { ...current, status: "answered" } : current,
        );
        void syncExtensionSpeakerState();
      };

      session.on("progress", () => {
        setCallState(VoiceCallState.RINGING);
      });
      session.on("accepted", markActive);
      session.on("confirmed", markActive);
    });
  }, [openCallScreenIfNeeded, pharmacy, syncExtensionSpeakerState]);

  useEffect(() => {
    const isActiveExtensionCall =
      isExtensionCall &&
      (callState === VoiceCallState.ACTIVE ||
        callState === VoiceCallState.HELD);

    if (!isActiveExtensionCall) {
      return;
    }

    const interval = setInterval(() => {
      setDurationSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState, isExtensionCall]);

  const dial = useCallback(
    async (phoneNumber: string, options?: DialOptions) => {
      const context = getPharmacyCallContext(pharmacy);
      if (!context) {
        const message = "Pharmacy information is not available.";
        setError(message);
        showErrorToast(message);
        return null;
      }

      const credentials = getExtensionCredentials(pharmacy);
      if (!credentials) {
        const message =
          "Extension calling is not configured. Add SIP extension credentials to your pharmacy profile.";
        setError(message);
        showErrorToast(message);
        return null;
      }

      if (extensionSipClient.state === "connecting") {
        const message = "Connecting extension. Please try again in a moment.";
        setError(message);
        showErrorToast(message);
        return null;
      }

      if (extensionSipClient.state !== "registered") {
        const message =
          "Extension is not registered. Check your SIP extension credentials.";
        setError(message);
        showErrorToast(message);
        return null;
      }

      const normalizedPhone = phoneNumber.replace(/\D/g, "");
      if (normalizedPhone.length < 3) {
        const message = "Enter a valid phone number.";
        setError(message);
        showErrorToast(message);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const destination = normalizeToE164(phoneNumber);
        const contactName =
          options?.contactName ?? findContactNameByPhone(phoneNumber);
        const callId = await extensionSipClient.makeCall(destination);

        isExtensionCallRef.current = true;
        setIsExtensionCall(true);
        minimizedCallIdRef.current = null;
        setIsCallMinimized(false);

        const activeCallDto: CallDto = {
          id: callId,
          telnyxCallControlId: callId,
          direction: "outbound",
          callerNumber: credentials.extension,
          calleeNumber: destination,
          contactName,
          status: "initiated",
          pharmacyId: context.pharmacyId,
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        setActiveCall(activeCallDto);
        setCallState(VoiceCallState.CONNECTING);
        setIsMuted(false);
        setIsHeld(false);
        setDurationSeconds(0);
        navigateToActiveCall();

        return activeCallDto;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to start call.";
        setError(message);
        showErrorToast(message);
        clearActiveCall();
        return null;
      } finally {
        setLoading(false);
      }
    },
    [clearActiveCall, pharmacy],
  );

  const answer = useCallback(async () => {
    try {
      await extensionSipClient.answerIncoming();
      setCallState(VoiceCallState.CONNECTING);
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Failed to answer call.",
      );
    }
  }, []);

  const hangup = useCallback(async () => {
    extensionSipClient.hangupActive();
    clearActiveCall();
  }, [clearActiveCall]);

  const decline = useCallback(async () => {
    await hangup();
  }, [hangup]);

  const toggleMute = useCallback(async () => {
    if (!extensionSipClient.isCallMediaReady()) {
      showErrorToast("Mute is available once the call is connected.");
      return;
    }

    try {
      setIsMuted(extensionSipClient.toggleMute());
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Failed to update mute.",
      );
    }
  }, []);

  const toggleHold = useCallback(async () => {
    if (!extensionSipClient.isCallMediaReady()) {
      showErrorToast("Hold is available once the call is connected.");
      return;
    }

    try {
      extensionSipClient.toggleHold();
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Failed to update hold.",
      );
    }
  }, []);

  const toggleSpeaker = useCallback(async () => {
    try {
      const next = !speakerPreferenceRef.current;
      speakerPreferenceRef.current = next;
      setIsSpeakerOn(next);
      const actual = await setExtensionSpeakerEnabled(next);
      speakerPreferenceRef.current = actual;
      setIsSpeakerOn(actual);
    } catch (err) {
      void syncExtensionSpeakerState();
      showErrorToast(
        err instanceof Error ? err.message : "Failed to update speaker.",
      );
    }
  }, [syncExtensionSpeakerState]);

  const sendDtmf = useCallback(async (digit: string) => {
    try {
      extensionSipClient.sendDtmf(digit);
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Failed to send tone.",
      );
    }
  }, []);

  const transfer = useCallback(async (_phoneNumber: string) => {
    showErrorToast("Transfer is not available for extension calls yet.");
  }, []);

  const isIncomingRinging =
    activeCall?.direction === "inbound" &&
    callState === VoiceCallState.RINGING;

  const value = useMemo(
    () => ({
      dial,
      answer,
      decline,
      hangup,
      toggleMute,
      toggleHold,
      toggleSpeaker,
      sendDtmf,
      transfer,
      loading,
      activeCall,
      error,
      isVoiceReady,
      hasVoiceCredentials,
      isMuted,
      isHeld,
      isSpeakerOn,
      durationSeconds,
      callState,
      isIncomingRinging,
      isExtensionCall,
      isCallMinimized,
      minimizeCallScreen,
      restoreCallScreen,
      consumeMinimizeNavigationGuard,
      consumeCallClearingGuard,
    }),
    [
      activeCall,
      answer,
      callState,
      consumeCallClearingGuard,
      consumeMinimizeNavigationGuard,
      decline,
      dial,
      durationSeconds,
      error,
      hangup,
      hasVoiceCredentials,
      isCallMinimized,
      isExtensionCall,
      isHeld,
      isIncomingRinging,
      isMuted,
      isSpeakerOn,
      isVoiceReady,
      loading,
      minimizeCallScreen,
      restoreCallScreen,
      sendDtmf,
      transfer,
      toggleHold,
      toggleMute,
      toggleSpeaker,
    ],
  );

  return (
    <OutboundCallContext.Provider value={value}>
      {children}
    </OutboundCallContext.Provider>
  );
};

export const useOutboundCall = (): OutboundCallContextValue => {
  const context = useContext(OutboundCallContext);
  if (!context) {
    throw new Error("useOutboundCall must be used within OutboundCallProvider");
  }

  return context;
};
