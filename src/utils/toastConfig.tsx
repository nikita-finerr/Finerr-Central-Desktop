import { memo } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  View,
} from "react-native";
import type { ToastConfig } from "react-native-toast-message";

import { Colors, Fonts, FontSizes, Radius } from "../constants";

const TOAST_WIDTH = Dimensions.get("window").width - 32;

type AppToastProps = {
  text1?: string;
  text2?: string;
  text1Style?: StyleProp<TextStyle>;
  text2Style?: StyleProp<TextStyle>;
  borderColor: string;
  onPress?: () => void;
};

const AppToast = memo(({
  text1,
  text2,
  text1Style,
  text2Style,
  borderColor,
  onPress,
}: AppToastProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toast, { borderLeftColor: borderColor }]}
    >
      <View style={styles.content}>
        {text1 ? <Text style={[styles.text1, text1Style]}>{text1}</Text> : null}
        {text2 ? (
          <Text style={[styles.text2, text2Style]}>{text2}</Text>
        ) : null}
      </View>
    </Pressable>
  );
});

export const toastConfig: ToastConfig = {
  success: ({ text1, text2, text1Style, text2Style, onPress }) => (
    <AppToast
      text1={text1}
      text2={text2}
      text1Style={text1Style}
      text2Style={text2Style}
      borderColor={Colors.success}
      onPress={onPress}
    />
  ),
  error: ({ text1, text2, text1Style, text2Style, onPress }) => (
    <AppToast
      text1={text1}
      text2={text2}
      text1Style={text1Style}
      text2Style={text2Style}
      borderColor={Colors.warning}
      onPress={onPress}
    />
  ),
  info: ({ text1, text2, text1Style, text2Style, onPress }) => (
    <AppToast
      text1={text1}
      text2={text2}
      text1Style={text1Style}
      text2Style={text2Style}
      borderColor={Colors.secondary}
      onPress={onPress}
    />
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: TOAST_WIDTH,
    maxWidth: 360,
    minHeight: 58,
    borderRadius: Radius.sm,
    borderLeftWidth: 5,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  text1: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  text2: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * 1.45,
    flexShrink: 1,
  },
});
