import { NavigationProp, useNavigation } from "@react-navigation/native";

import { Haptics } from "../../utils/haptics";
import {
  Fingerprint,
  Lock,
  Mail,
  ScanFace,
  UserCheck,
} from "lucide-react-native";
import { useCallback, useEffect, useState, memo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";

import { authApi } from "../../api/authApi";
import { profileApi } from "../../api/profileApi";
import {
  AuthPrimaryButton,
  AuthRoundedField,
  AuthSettingSwitch,
  AuthWaveLayout,
} from "../../components/auth";
import {
  AuthRoutes,
  Colors,
  Env,
  Fonts,
  FontSizes,
  Spacing,
} from "../../constants";
import { APP_VERSION } from "../../constants/dimensions";
import { setUserData } from "../../redux/auth/authSlice";
import type { AppDispatch } from "../../redux/store";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  authenticateWithBiometric,
  checkBiometricAvailability,
  getBiometricLabel,
} from "../../utils/biometric";
import { authStorage } from "../../utils/storage";
import { showErrorToast } from "../../utils/toast";
import { validateLogin } from "../../utils/validation";

const Login = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isBiometricAvailable, setIsBiometricAvailable] =
    useState<boolean>(false);

  useEffect(() => {
    void (async () => {
      const [available, storedBiometricEnabled] = await Promise.all([
        checkBiometricAvailability(),
        authStorage.getBiometricEnabled(),
      ]);

      setIsBiometricAvailable(available);
      setIsBiometricEnabled(Boolean(storedBiometricEnabled) && available);
    })();
  }, []);

  const toggleKeepMeSignedIn = async (value: boolean) => {
    setKeepMeSignedIn(value);
    await authStorage.setKeepMeSignedIn(value);

    if (!value) {
      setIsBiometricEnabled(false);
      await authStorage.setBiometricEnabled(false);
    }
  };

  const toggleBiometric = async (value: boolean) => {
    if (!value) {
      setIsBiometricEnabled(false);
      await authStorage.setBiometricEnabled(false);
      return;
    }

    setIsBiometricEnabled(true);
    setKeepMeSignedIn(true);
    await authStorage.setKeepMeSignedIn(true);

    try {
      const success = await authenticateWithBiometric(
        Platform.OS === "ios"
          ? "Authenticate with Face ID"
          : "Authenticate with Fingerprint",
      );
      if (!success) {
        setIsBiometricEnabled(false);
      }
    } catch {
      setIsBiometricEnabled(false);
    }
  };

  const handleSignIn = async () => {
    const validationError = validateLogin(email, password);
    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    console.log("[AuthLogin] Base URL:", Env.BASE_URL);
    console.log(
      "[AuthLogin] Full URL:",
      `${Env.BASE_URL}/api/auth/login`,
    );

    try {
      const response = await authApi.login({ email, password });
      if (!response?.success || !response?.data?.token) {
        showErrorToast(getApiErrorMessage(response, "Something went wrong"));
        return;
      }

      await authStorage.setAccessToken(response.data.token);
      await authStorage.setKeepMeSignedIn(keepMeSignedIn);
      await authStorage.setBiometricEnabled(
        keepMeSignedIn && isBiometricEnabled,
      );

      const profile = await profileApi.getProfile();
      if (!profile?.success || !profile?.data) {
        await authStorage.clearSession();
        showErrorToast(getApiErrorMessage(profile, "Something went wrong"));
        return;
      }

      await authStorage.setUserData(profile.data);
      dispatch(setUserData(profile.data));
    } catch (err) {
      showErrorToast(getApiErrorMessage(err, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = useCallback(() => {
    void Haptics.selectionAsync();
    navigation.navigate(AuthRoutes.ForgotPassword);
  }, [navigation]);

  const openPrivacyPolicy = useCallback(() => {
    if (!Env.PRIVACY_URL) return;
    navigation.navigate(AuthRoutes.Web, {
      url: Env.PRIVACY_URL,
      title: "Privacy Policy",
    });
  }, [navigation]);

  const openTermsOfService = useCallback(() => {
    if (!Env.TERMS_URL) return;
    navigation.navigate(AuthRoutes.Web, {
      url: Env.TERMS_URL,
      title: "Terms of Service",
    });
  }, [navigation]);

  const onTogglePasswordVisibility = () => {
    setShowPassword((current) => !current);
  };

  const BiometricIcon = Platform.OS === "ios" ? ScanFace : Fingerprint;

  return (
    <AuthWaveLayout
      footer={
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          <View style={styles.legalRow}>
            <Pressable onPress={openPrivacyPolicy} accessibilityRole="link">
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable onPress={openTermsOfService} accessibilityRole="link">
              <Text style={styles.legalLink}>Terms of Service</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <Text style={styles.heading} accessibilityRole="header">
        Welcome Back
      </Text>
      <Text style={styles.description}>Sign in to your Finerr account</Text>

      <View style={styles.fields}>
        <AuthRoundedField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          Icon={Mail}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />

        <AuthRoundedField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          Icon={Lock}
          secureTextEntry
          showPasswordToggle
          isPasswordVisible={showPassword}
          onTogglePasswordVisibility={onTogglePasswordVisibility}
          textContentType="password"
          autoComplete="password"
        />
      </View>

      <View style={styles.preferences}>
        <AuthSettingSwitch
          label="Keep Me Signed In"
          value={keepMeSignedIn}
          onValueChange={toggleKeepMeSignedIn}
          icon={
            <UserCheck size={18} color={Colors.textSecondary} strokeWidth={2} />
          }
        />

        {isBiometricAvailable ? (
          <AuthSettingSwitch
            label={`Enable ${getBiometricLabel()}`}
            value={isBiometricEnabled}
            onValueChange={toggleBiometric}
            icon={
              <BiometricIcon
                size={18}
                color={Colors.textSecondary}
                strokeWidth={2}
              />
            }
          />
        ) : null}
      </View>

      <Pressable
        onPress={handleForgotPassword}
        style={styles.forgotPassword}
        accessibilityRole="link"
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </Pressable>

      <AuthPrimaryButton
        label="Sign In"
        onPress={handleSignIn}
        loading={loading}
      />
    </AuthWaveLayout>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  versionText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legalLink: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  legalDot: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  heading: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  fields: {
    gap: Spacing.xl,
    marginTop: Spacing.xl,
  },
  preferences: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.secondary,
  },
});

export default Login;
