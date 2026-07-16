import Ionicons from "react-native-vector-icons/Ionicons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { VoiceCallState } from "../../../types/voiceCallState";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BackHandler,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Avatar from "../../../components/common/Avatar";
import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Spacing,
} from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { useOutboundCall } from "../../../hooks/useOutboundCall";
import {
  formatCallDuration,
  formatPhoneDisplay,
} from "../../../utils/formatPhoneNumber";
import CallActionButton from "./components/CallActionButton";
import InCallDialpad from "./components/InCallDialpad";
import TransferModal from "./components/TransferModal";

const getStatusLabel = (
  state: VoiceCallState | null,
  isIncoming: boolean,
): string => {
  switch (state) {
    case VoiceCallState.RINGING:
      return isIncoming ? "Incoming call…" : "Ringing…";
    case VoiceCallState.CONNECTING:
      return "Connecting…";
    case VoiceCallState.HELD:
    case VoiceCallState.ACTIVE:
      return "";
    case VoiceCallState.FAILED:
      return "Call failed";
    default:
      return isIncoming ? "Incoming call…" : "Calling…";
  }
};

const SWIPE_DOWN_THRESHOLD = 72;
const SWIPE_DOWN_VELOCITY = 0.45;

const ActiveCallScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const [dialpadVisible, setDialpadVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);

  const {
    activeCall,
    answer,
    decline,
    hangup,
    toggleMute,
    toggleHold,
    toggleSpeaker,
    sendDtmf,
    transfer,
    loading,
    isMuted,
    isHeld,
    isSpeakerOn,
    durationSeconds,
    callState,
    isIncomingRinging,
    isExtensionCall,
    minimizeCallScreen,
    consumeMinimizeNavigationGuard,
    consumeCallClearingGuard,
  } = useOutboundCall();

  const handleMinimize = useCallback(() => {
    minimizeCallScreen();
  }, [minimizeCallScreen]);

  const swipeDownPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 12 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderRelease: (_, gestureState) => {
          if (
            gestureState.dy > SWIPE_DOWN_THRESHOLD ||
            gestureState.vy > SWIPE_DOWN_VELOCITY
          ) {
            handleMinimize();
          }
        },
      }),
    [handleMinimize],
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!activeCall) {
          return false;
        }

        if (dialpadVisible) {
          setDialpadVisible(false);
          return true;
        }

        handleMinimize();
        return true;
      },
    );

    return () => subscription.remove();
  }, [activeCall, dialpadVisible, handleMinimize]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (
        !activeCall ||
        consumeMinimizeNavigationGuard() ||
        consumeCallClearingGuard()
      ) {
        return;
      }

      event.preventDefault();
      handleMinimize();
    });

    return unsubscribe;
  }, [
    activeCall,
    consumeCallClearingGuard,
    consumeMinimizeNavigationGuard,
    handleMinimize,
    navigation,
  ]);

  useEffect(() => {
    if (activeCall || loading) {
      return;
    }

    navigation.goBack();
  }, [activeCall, loading, navigation]);

  useEffect(() => {
    if (activeCall || loading) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!isExtensionCall) {
        navigation.goBack();
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [activeCall, isExtensionCall, loading, navigation]);

  const isInbound = activeCall?.direction === "inbound";

  const remoteNumber = useMemo(() => {
    if (!activeCall) {
      return "";
    }

    return isInbound ? activeCall.callerNumber : activeCall.calleeNumber;
  }, [activeCall, isInbound]);

  const phoneNumber = useMemo(
    () => formatPhoneDisplay(remoteNumber),
    [remoteNumber],
  );

  const statusLabel = useMemo(
    () => getStatusLabel(callState, isInbound),
    [callState, isInbound],
  );

  const isCallConnected =
    callState === VoiceCallState.ACTIVE ||
    callState === VoiceCallState.HELD ||
    isHeld;

  const isOnHold = isHeld || callState === VoiceCallState.HELD;

  const showInCallControls = !isIncomingRinging;

  const canMuteOrHold =
    callState === VoiceCallState.ACTIVE ||
    callState === VoiceCallState.HELD ||
    isHeld;

  const canUseDialpad = canMuteOrHold;

  const handleAnswer = useCallback(() => {
    void answer();
  }, [answer]);

  const handleDecline = useCallback(() => {
    void decline();
  }, [decline]);

  const handleHangup = useCallback(() => {
    void hangup();
  }, [hangup]);

  const handleDtmf = useCallback(
    (digit: string) => {
      void sendDtmf(digit);
    },
    [sendDtmf],
  );

  const handleTransfer = useCallback(
    (transferNumber: string) => {
      void transfer(transferNumber);
    },
    [transfer],
  );

  if (!activeCall) {
    return null;
  }

  return (
    <View
      style={[styles.root, { paddingTop: insets.top + Spacing.xl }]}
      {...swipeDownPanResponder.panHandlers}
    >
      <Pressable
        onPress={handleMinimize}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Minimize call"
      >
        <Ionicons name="chevron-down" size={28} color={Colors.textSecondary} />
      </Pressable>

      <View style={styles.header}>
        <Avatar
          name={activeCall.contactName ?? "Unknown"}
          size={100}
          fontSize={FontSizes.xxxl}
          backgroundColor={Colors.surface}
          textColor={Colors.secondary}
        />
        <Text
          style={[
            styles.phoneNumber,
            !activeCall.contactName && styles.phoneNumberPrimary,
          ]}
        >
          {activeCall?.contactName ?? phoneNumber ?? ""}
        </Text>
        {isCallConnected ? (
          <View style={styles.timerBlock}>
            {isOnHold ? (
              <Text style={styles.holdStatus}>On hold</Text>
            ) : (
              <Text style={styles.timer}>
                {formatCallDuration(durationSeconds)}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.status}>{statusLabel}</Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        {showInCallControls ? (
          <View style={styles.actionsGrid}>
            <View style={styles.actionRow}>
              <CallActionButton
                label="MUTE"
                iconName={isMuted ? "mic-off" : "mic"}
                active={isMuted}
                disabled={!canMuteOrHold}
                onPress={() => void toggleMute()}
              />
              <CallActionButton
                label={isHeld ? "UNHOLD" : "HOLD"}
                iconName="pause"
                active={isHeld}
                disabled={!canMuteOrHold}
                onPress={() => void toggleHold()}
              />
              <CallActionButton
                label="SPEAKER"
                iconName={isSpeakerOn ? "volume-high" : "volume-medium"}
                active={isSpeakerOn}
                onPress={() => void toggleSpeaker()}
              />
            </View>
            <View style={[styles.actionRow, styles.actionRowCentered]}>
              <CallActionButton
                label="KEYPAD"
                iconName="keypad"
                active={dialpadVisible}
                disabled={!canUseDialpad}
                onPress={() => setDialpadVisible((visible) => !visible)}
              />
            </View>
          </View>
        ) : null}

        <View
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
        >
          {isIncomingRinging ? (
            <View style={styles.incomingActions}>
              <Pressable onPress={handleDecline} style={styles.declineBtn}>
                <Ionicons name="call" size={32} color={Colors.white} />
              </Pressable>
              <Pressable onPress={handleAnswer} style={styles.answerBtn}>
                <Ionicons name="call" size={32} color={Colors.white} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={handleHangup} style={styles.hangupBtn}>
              <Ionicons name="call" size={32} color={Colors.white} />
            </Pressable>
          )}
        </View>
      </View>

      <InCallDialpad
        visible={dialpadVisible}
        onClose={() => setDialpadVisible(false)}
        onDigit={handleDtmf}
      />

      <TransferModal
        visible={transferVisible}
        onClose={() => setTransferVisible(false)}
        onTransfer={handleTransfer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: globalStyleDefinitions.screenPadding.padding,
    justifyContent: "space-evenly",
  },
  backButton: {
    alignSelf: "center",
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  contactName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xxxl,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: Spacing.xxxl,
  },
  phoneNumber: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  phoneNumberPrimary: {
    fontSize: FontSizes.xxxl,
    color: Colors.textPrimary,
    marginTop: Spacing.xxxl,
  },
  timerBlock: {
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  holdStatus: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  timer: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.lg,
    color: Colors.secondary,
    textAlign: "center",
  },
  status: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.secondary,
    textAlign: "center",
  },
  actionsContainer: {
    justifyContent: "flex-end",
    flex: 1,
  },
  actionsGrid: {
    justifyContent: "center",
    gap: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.xxxl,
  },
  actionRowCentered: {
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: Dimensions.height * 0.1,
  },
  incomingActions: {
    width: Dimensions.width - 4 * globalStyleDefinitions.screenPadding.padding,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  hangupBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "135deg" }],
  },
  declineBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "135deg" }],
  },
  answerBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ActiveCallScreen;
