import LinearGradient from "react-native-linear-gradient";
import { Fingerprint, ScanFace } from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";

import {
  BrandGradient,
  Colors,
  Fonts,
  FontSizes,
  Spacing,
} from "../../constants";
import { clearAuth } from "../../redux/auth/authSlice";
import type { AppDispatch } from "../../redux/store";
import { unregisterPushNotifications } from "../../services/pushNotifications";
import {
  authenticateWithBiometric,
  getBiometricLabel,
} from "../../utils/biometric";
import { authStorage } from "../../utils/storage";
import FinerrLogoMark from "./FinerrLogoMark";

type Props = {
  onUnlocked: () => void;
  onLogout: () => void;
};

const BiometricUnlock = ({ onUnlocked, onLogout }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const hasAutoPrompted = useRef(false);
  const BiometricIcon = Platform.OS === "ios" ? ScanFace : Fingerprint;

  const authenticate = useCallback(async () => {
    if (isAuthenticating) {
      return;
    }

    setIsAuthenticating(true);
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        onUnlocked();
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, onUnlocked]);

  const handleLogout = useCallback(async () => {
    await unregisterPushNotifications();
    await authStorage.clearAuth();
    dispatch(clearAuth());
    onLogout();
  }, [dispatch, onLogout]);

  useEffect(() => {
    if (hasAutoPrompted.current) {
      return;
    }
    hasAutoPrompted.current = true;
    void authenticate();
  }, [authenticate]);

  return (
    <LinearGradient colors={[...BrandGradient]} style={styles.root}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.xxxl }]}>
        <FinerrLogoMark width={180} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Use {getBiometricLabel()} to continue
        </Text>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.md },
        ]}
      >
        <Pressable
          onPress={authenticate}
          style={styles.unlockButton}
          disabled={isAuthenticating}
          accessibilityRole="button"
        >
          {isAuthenticating ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <BiometricIcon size={22} color={Colors.white} strokeWidth={2} />
              <Text style={styles.unlockButtonText}>
                Unlock with {getBiometricLabel()}
              </Text>
            </>
          )}
        </Pressable>
        <Pressable
          onPress={handleLogout}
          style={styles.logoutButton}
          disabled={isAuthenticating}
          accessibilityRole="button"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxl,
    color: Colors.white,
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: "rgba(255,255,255,0.88)",
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.xxxl,
  },
  unlockButton: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  unlockButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  logoutButton: {
    marginTop: Spacing.md,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: "rgba(255,255,255,0.75)",
  },
});

export default memo(BiometricUnlock);
