import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Haptics } from "../../../utils/haptics";
import { CheckCircle2, Circle, Lock, ShieldCheck } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { profileApi } from "../../../api/profileApi";
import { AuthRoundedField } from "../../../components/auth";
import CreateHeader from "../../../components/common/Header/CreateHeader";
import { Colors, Fonts, FontSizes, Radius, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { clearAuth } from "../../../redux/auth/authSlice";
import { unregisterPushNotifications } from "../../../services/pushNotifications";
import { getApiErrorMessage } from "../../../utils/apiError";
import { getPasswordRequirementResults } from "../../../utils/passwordRequirements";
import { authStorage } from "../../../utils/storage";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import { validateChangePassword } from "../../../utils/validation";

const ChangePassword = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const requirements = useMemo(
    () => getPasswordRequirementResults(newPassword),
    [newPassword],
  );

  const canSave =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    !loading;

  const handleSave = async () => {
    const validationError = validateChangePassword(
      currentPassword,
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
      const response = await profileApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (!response?.success) {
        showErrorToast(
          getApiErrorMessage(response, "Unable to change password"),
        );
        return;
      }

      showSuccessToast(response.message ?? "Password updated successfully");
      await unregisterPushNotifications();
      authStorage.clearAuth();
      dispatch(clearAuth());
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Unable to change password"));
    } finally {
      setLoading(false);
    }
  };

  const onToggleCurrentPasswordVisibility = () => {
    setIsCurrentPasswordVisible((value) => !value);
  };

  const onTogglePasswordVisibility = () => {
    setIsPasswordVisible((value) => !value);
  };

  const onToggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((value) => !value);
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <CreateHeader
        title="Change Password"
        onSave={handleSave}
        canSave={canSave}
        loading={loading}
      />

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={insets.bottom}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <ShieldCheck size={35} color={Colors.secondary} strokeWidth={2} />
          </View>
          <View style={styles.securityCopy}>
            <Text style={styles.securityTitle}>Security</Text>
            <Text style={styles.securityText}>
              Choose a strong password to keep your account secure.
            </Text>
          </View>
        </View>

        <View style={styles.fields}>
          <AuthRoundedField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            Icon={Lock}
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={isCurrentPasswordVisible}
            onTogglePasswordVisibility={onToggleCurrentPasswordVisibility}
            textContentType="password"
            autoComplete="password"
          />
          <AuthRoundedField
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            Icon={Lock}
            secureTextEntry
            showPasswordToggle
            isPasswordVisible={isPasswordVisible}
            onTogglePasswordVisibility={onTogglePasswordVisibility}
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
            onTogglePasswordVisibility={onToggleConfirmPasswordVisibility}
            textContentType="newPassword"
            autoComplete="password-new"
          />
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Password Requirements</Text>
          {requirements.map((requirement) => (
            <View key={requirement.id} style={styles.requirementRow}>
              {requirement.met ? (
                <CheckCircle2
                  size={18}
                  color={Colors.success}
                  strokeWidth={2}
                />
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
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  securityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
  },
  securityIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  securityCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  securityTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  securityText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * 1.25,
  },
  fields: {
    gap: Spacing.xl,
  },
  requirementsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.md,
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
});

export default ChangePassword;
