import LinearGradient from "react-native-linear-gradient";
import type { LucideIcon } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { memo } from "react";
import {
  BrandGradient,
  Colors,
  Fonts,
  FontSizes,
  Radius,
} from "../../constants";
import { globalStyleDefinitions } from "../../constants/globalStyleDefinitions";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  Icon?: LucideIcon;
};

const AuthPrimaryButton = ({
  label,
  onPress,
  disabled,
  loading = false,
  Icon,
}: Props) => {
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.shadowWrap]}>
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.buttonDisabled,
          pressed && !isDisabled && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        <LinearGradient
          colors={[...BrandGradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <View style={styles.labelRow}>
              <Text style={[styles.label, isDisabled && styles.labelDisabled]}>
                {label}
              </Text>
              {Icon ? (
                <Icon size={18} color={Colors.white} strokeWidth={2.25} />
              ) : null}
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: Radius.full,
    marginTop: globalStyleDefinitions.commonItemMargin.margin,
  },
  button: {
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  gradient: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
  labelDisabled: {
    color: Colors.textSecondary,
  },
});

export default memo(AuthPrimaryButton);
