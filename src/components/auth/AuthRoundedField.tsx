import type { LucideIcon } from "lucide-react-native";
import { Eye, EyeOff } from "lucide-react-native";
import {
  KeyboardType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { memo } from "react";
import { Colors, Fonts, FontSizes, Radius, Spacing } from "../../constants";
import { globalStyleDefinitions } from "../../constants/globalStyleDefinitions";

// react-native-macos crashes in NSSecureTextView setDelegate: when focusing
// a secure TextInput (see RCTUISecureTextFieldCell selectWithFrame:).
const supportsSecureTextEntry = Platform.OS !== "macos";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  Icon: LucideIcon;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
  keyboardType?: KeyboardType;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  textContentType?: "emailAddress" | "password" | "newPassword" | "oneTimeCode";
  autoComplete?: "email" | "password" | "password-new" | "off";
};

const AuthRoundedField = ({
  label,
  value,
  onChangeText,
  placeholder,
  Icon,
  secureTextEntry,
  showPasswordToggle,
  isPasswordVisible,
  onTogglePasswordVisibility,
  keyboardType = "default",
  autoCapitalize = "none",
  textContentType,
  autoComplete,
}: Props) => {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.shell}>
        <Icon size={18} color={Colors.textSecondary} strokeWidth={2} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={
            supportsSecureTextEntry && secureTextEntry && !isPasswordVisible
          }
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          textContentType={textContentType}
          autoComplete={autoComplete}
          style={styles.input}
        />
        {showPasswordToggle && supportsSecureTextEntry ? (
          <Pressable
            onPress={onTogglePasswordVisibility}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? "Hide password" : "Show password"
            }
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={Colors.textSecondary} strokeWidth={2} />
            ) : (
              <Eye size={18} color={Colors.textSecondary} strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  shell: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
});

export default memo(AuthRoundedField);
