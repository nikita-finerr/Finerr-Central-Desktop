import { Share } from "react-native";

import { showErrorToast, showSuccessToast } from "./toast";

export const copyToClipboard = async (
  text: string,
  successMessage = "Copied to clipboard",
): Promise<void> => {
  try {
    const Clipboard = await import("expo-clipboard");
    await Clipboard.setStringAsync(text);
    showSuccessToast(successMessage);
    return;
  } catch {
    // expo-clipboard native module missing until dev client rebuild
  }

  try {
    const result = await Share.share({ message: text });
    if (result.action === Share.dismissedAction) return;
    showSuccessToast(successMessage);
  } catch {
    showErrorToast("Unable to copy to clipboard");
  }
};
