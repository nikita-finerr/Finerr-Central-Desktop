import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  type PressableProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Colors, Fonts, FontSizes, Radius } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { memo } from "react";

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const Button = ({
  title,
  loading = false,
  disabled,
  containerStyle,
  textStyle,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        containerStyle,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2 * globalStyleDefinitions.cardInnerPadding.padding,
    backgroundColor: Colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
});

export default memo(Button);
