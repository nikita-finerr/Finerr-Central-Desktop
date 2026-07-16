import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Haptics } from "../../utils/haptics";
import { ArrowLeft, Mail, Send } from "lucide-react-native";
import {useCallback, useState, memo } from "react";
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
  Spacing,
} from "../../constants";
import { APP_VERSION } from "../../constants/dimensions";
import { getApiErrorMessage } from "../../utils/apiError";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { validateForgotPassword } from "../../utils/validation";

const ForgotPassword = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleBackToSignIn = useCallback(() => {
    void Haptics.selectionAsync();
    navigation.goBack();
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

  const handleSubmit = async () => {
    const validationError = validateForgotPassword(email);
    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email: email.trim() });
      if (!response?.success) {
        showErrorToast(getApiErrorMessage(response, "Something went wrong"));
        return;
      }
      showSuccessToast(`Reset link sent to ${email.trim()}`);
      navigation.goBack();
    } catch (err) {
      showErrorToast(getApiErrorMessage(err, "Something went wrong"));
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
        Forgot Password
      </Text>
      <Text style={styles.description}>
        Enter the email associated with your account. We'll send you a secure
        password reset link.
      </Text>

      <View style={styles.fields}>
        <AuthRoundedField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          Icon={Mail}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />
      </View>

      <AuthPrimaryButton
        label="Send Reset Link"
        onPress={handleSubmit}
        loading={loading}
        Icon={Send}
      />
    </AuthWaveLayout>
  );
}

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
  fields: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  signInPrompt: {
    alignItems: "center",
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  signInPromptText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  signInLinkWrap: {
    paddingVertical: Spacing.xs,
  },
  signInLink: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.secondary,
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

export default ForgotPassword;
