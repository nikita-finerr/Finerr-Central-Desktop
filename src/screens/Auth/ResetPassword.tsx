import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Haptics } from "../../utils/haptics";
import { ArrowLeft, CheckCircle2, Circle, Lock, ShieldCheck } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authApi } from "../../api/authApi";
import {
  AuthPrimaryButton,
  AuthRoundedField,
  AuthWaveLayout,
} from "../../components/auth";
import {
  AuthRoutes,
  Colors,
  Env,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../constants";
import { APP_VERSION } from "../../constants/dimensions";
import { getApiErrorMessage } from "../../utils/apiError";
import { getPasswordRequirementResults } from "../../utils/passwordRequirements";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import {
  clearPendingAuthDeepLink,
  peekPendingAuthDeepLink,
} from "../../services/appsflyer/pendingAuthDeepLink";
import { validateResetPassword } from "../../utils/validation";

type ResetPasswordRouteParams = {
  ResetPassword: {
    token?: string;
    email?: string;
  };
};

const ResetPassword = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<ResetPasswordRouteParams, "ResetPassword">>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    const fromRoute = route.params?.token?.trim();
    if (fromRoute) {
      return fromRoute;
    }

    return peekPendingAuthDeepLink()?.params.token.trim() ?? "";
  }, [route.params?.token]);
  const email = route.params?.email?.trim();

  useEffect(() => {
    if (token) {
      clearPendingAuthDeepLink();
    }
  }, [token]);

  const requirements = useMemo(
    () => getPasswordRequirementResults(newPassword),
    [newPassword],
  );

  const handleBackToSignIn = useCallback(() => {
    void Haptics.selectionAsync();
    navigation.navigate(AuthRoutes.Login);
  }, [navigation]);

  const openPrivacyPolicy = useCallback(() => {
    if (!Env.PRIVACY_URL) {
      return;
    }

    navigation.navigate(AuthRoutes.Web, {
      url: Env.PRIVACY_URL,
      title: "Privacy Policy",
    });
  }, [navigation]);

  const openTermsOfService = useCallback(() => {
    if (!Env.TERMS_URL) {
      return;
    }

    navigation.navigate(AuthRoutes.Web, {
      url: Env.TERMS_URL,
      title: "Terms of Service",
    });
  }, [navigation]);

  const handleSubmit = async () => {
    const validationError = validateResetPassword(
      token,
      newPassword,
      confirmPassword,
    );

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const response = await authApi.resetPassword({
        token,
        newPassword,
      });

      if (!response?.success) {
        showErrorToast(
          getApiErrorMessage(response, "Unable to reset password."),
        );
        return;
      }

      showSuccessToast(response.message ?? "Password reset successfully.");
      navigation.navigate(AuthRoutes.Login);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Unable to reset password."));
    } finally {
      setLoading(false);
    }
  };

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
      <Pressable
        onPress={handleBackToSignIn}
        style={styles.backLink}
        accessibilityRole="link"
      >
        <ArrowLeft size={16} color={Colors.secondary} strokeWidth={2.25} />
        <Text style={styles.backLinkText}>Back to Login</Text>
      </Pressable>

      <Text style={styles.heading} accessibilityRole="header">
        Reset Password
      </Text>
      <Text style={styles.description}>
        {email
          ? `Create a new password for ${email}.`
          : "Create a new password for your account."}
      </Text>

      {!token ? (
        <View style={styles.invalidCard}>
          <ShieldCheck size={20} color={Colors.error} strokeWidth={2} />
          <Text style={styles.invalidText}>
            This reset link is invalid or expired. Request a new link from the
            login screen.
          </Text>
        </View>
      ) : null}

      <View style={styles.fields}>
        <AuthRoundedField
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          Icon={Lock}
          secureTextEntry
          showPasswordToggle
          isPasswordVisible={isPasswordVisible}
          onTogglePasswordVisibility={() => {
            setIsPasswordVisible((value) => !value);
          }}
          textContentType="newPassword"
          autoComplete="password-new"
        />
        <AuthRoundedField
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          Icon={Lock}
          secureTextEntry
          showPasswordToggle
          isPasswordVisible={isConfirmPasswordVisible}
          onTogglePasswordVisibility={() => {
            setIsConfirmPasswordVisible((value) => !value);
          }}
          textContentType="newPassword"
          autoComplete="password-new"
        />
      </View>

      <View style={styles.requirementsCard}>
        <Text style={styles.requirementsTitle}>Password Requirements</Text>
        {requirements.map((requirement) => (
          <View key={requirement.id} style={styles.requirementRow}>
            {requirement.met ? (
              <CheckCircle2 size={18} color={Colors.success} strokeWidth={2} />
            ) : (
              <Circle size={18} color={Colors.textLight} strokeWidth={2} />
            )}
            <Text
              style={[
                styles.requirementText,
                requirement.met && styles.requirementTextMet,
              ]}
            >
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>

      <AuthPrimaryButton
        label="Reset Password"
        onPress={handleSubmit}
        loading={loading}
        disabled={!token}
        Icon={ShieldCheck}
      />
    </AuthWaveLayout>
  );
};

const styles = StyleSheet.create({
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backLinkText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.secondary,
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
  invalidCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.error}12`,
  },
  invalidText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.error,
    lineHeight: FontSizes.sm * 1.4,
  },
  fields: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.lg,
  },
  requirementsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  requirementsTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  requirementText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  requirementTextMet: {
    color: Colors.textPrimary,
  },
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
});

export default ResetPassword;
