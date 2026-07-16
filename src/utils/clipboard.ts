import Clipboard from "@react-native-clipboard/clipboard";
import { Share } from "react-native";

import { showErrorToast, showSuccessToast } from "./toast";

export const copyToClipboard = async (
  text: string,
  successMessage = "Copied to clipboard",
): Promise<void> => {
  try {
    Clipboard.setString(text);
    showSuccessToast(successMessage);
    return;
  } catch {
    // Fall through to Share sheet.
  }

  try {
    const result = await Share.share({ message: text });
    if (result.action === Share.dismissedAction) return;
    showSuccessToast(successMessage);
  } catch {
    showErrorToast("Unable to copy to clipboard");
  }
};
