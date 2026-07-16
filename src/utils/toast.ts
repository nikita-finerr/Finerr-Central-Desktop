import Toast from "react-native-toast-message";
import { Colors, Typography } from "../constants";

const multilineText2Style = {
  ...Typography.caption,
  color: Colors.textSecondary,
};

export const showErrorToast = (message: string) => {
  Toast.show({
    type: "error",
    text1: "Error",
    text2: message,
    position: "bottom",
    visibilityTime: Math.max(2600, message.length * 45),
    text1Style: {
      ...Typography.body,
      color: Colors.textPrimary,
    },
    text2Style: multilineText2Style,
  });
};

export const showSuccessToast = (message: string) => {
  Toast.show({
    type: "success",
    text1: "Success",
    text2: message,
    position: "bottom",
    visibilityTime: Math.max(2600, message.length * 45),
    text1Style: {
      ...Typography.body,
      color: Colors.textPrimary,
    },
    text2Style: multilineText2Style,
  });
};
