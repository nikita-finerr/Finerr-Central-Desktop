import { Platform } from "react-native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

export const checkBiometricAvailability = async (): Promise<boolean> => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return (
      available &&
      (biometryType === BiometryTypes.TouchID ||
        biometryType === BiometryTypes.FaceID ||
        biometryType === BiometryTypes.Biometrics)
    );
  } catch {
    return false;
  }
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

  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage:
        promptMessage ??
        (Platform.OS === "ios"
          ? "Authenticate with Face ID to continue"
          : "Authenticate with Fingerprint to continue"),
      cancelButtonText: "Cancel",
    });
    return success;
  } catch {
    return false;
  }
};
