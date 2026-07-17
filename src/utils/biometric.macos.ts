export const checkBiometricAvailability = async (): Promise<boolean> => false;

export const getBiometricLabel = (): string => "Biometrics";

export const authenticateWithBiometric = async (
  _promptMessage?: string,
): Promise<boolean> => false;
