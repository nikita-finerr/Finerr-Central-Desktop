import Ionicons from "react-native-vector-icons/Ionicons";
import { VoiceCallState } from "../../types/voiceCallState";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts, FontSizes, Spacing } from "../../constants";
import { useOutboundCall } from "../../hooks/useOutboundCall";
import { navigationRef } from "../../navigation/navigationRef";
import { isActiveCallRouteFocused } from "../../utils/isActiveCallRoute";
import {
  formatCallDuration,
  formatPhoneDisplay,
} from "../../utils/formatPhoneNumber";

const CallBanner = () => {
  const insets = useSafeAreaInsets();
  const {
    activeCall,
    callState,
    durationSeconds,
    isHeld,
    isIncomingRinging,
    restoreCallScreen,
  } = useOutboundCall();

  const [isOnActiveCallScreen, setIsOnActiveCallScreen] = useState(
    isActiveCallRouteFocused,
  );

  useEffect(() => {
    if (!navigationRef.isReady()) {
      return;
    }

    const updateRoute = () => {
      setIsOnActiveCallScreen(isActiveCallRouteFocused());
    };

    updateRoute();
    return navigationRef.addListener("state", updateRoute);
  }, []);

  if (!activeCall || isOnActiveCallScreen) {
    return null;
  }

  const isInbound = activeCall.direction === "inbound";
  const remoteNumber = isInbound
    ? activeCall.callerNumber
    : activeCall.calleeNumber;
  const phoneNumber = formatPhoneDisplay(remoteNumber);
  const displayName = activeCall.contactName ?? phoneNumber;

  const isActiveCall =
    callState === VoiceCallState.ACTIVE ||
    callState === VoiceCallState.HELD ||
    callState === VoiceCallState.CONNECTING;

  const durationLabel = formatCallDuration(durationSeconds);

  const subtitle = isIncomingRinging
    ? "Tap to answer or decline"
    : isHeld
      ? `On hold`
      : isActiveCall
        ? durationLabel
        : isInbound
          ? "Incoming call"
          : "Calling…";

  return (
    <Pressable
      onPress={restoreCallScreen}
      style={[styles.banner, { paddingTop: insets.top + Spacing.sm }]}
      accessibilityRole="button"
      accessibilityLabel={`Return to call with ${displayName}`}
    >
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="call" size={18} color={Colors.white} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-up" size={20} color={Colors.white} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: Colors.success,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
});

export default CallBanner;
