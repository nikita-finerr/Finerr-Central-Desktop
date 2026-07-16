import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export const checkBiometricAvailability = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const getBiometricLabel = (): string => {
  return Platform.OS === "ios" ? "Face ID" : "Fingerprint";
};

export const authenticateWithBiometric = async (
  promptMessage?: string,
): Promise<boolean> => {
  const available = await checkBiometricAvailability();
  if (!available) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage:
      promptMessage ??
      (Platform.OS === "ios"
        ? "Authenticate with Face ID to continue"
        : "Authenticate with Fingerprint to continue"),
    cancelLabel: "Cancel",
    fallbackLabel: "Use Password",
  });

  return result.success;
};
