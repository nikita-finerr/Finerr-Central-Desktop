import type { PharmacyDetails } from "../types/auth";

export type PharmacyCallContext = {
  pharmacyId: number;
  fromNumber?: string;
};

export type PharmacySipCredentials = {
  username: string;
  password: string;
};

export const getPharmacySipCredentials = (
  pharmacy: PharmacyDetails | null | undefined,
): PharmacySipCredentials | null => {
  const username = pharmacy?.sipUsername?.trim();
  const password = pharmacy?.sipPassword?.trim();

  if (!username || !password) {
    return null;
  }

  return { username, password };
};

export const getPharmacyCallContext = (
  pharmacy: PharmacyDetails | null | undefined,
): PharmacyCallContext | null => {
  if (!pharmacy?.pharmacyId) {
    return null;
  }

  const fromNumber =
    pharmacy.twilioNumber ??
    pharmacy.phoneNumber ??
    pharmacy.pharmacyNumber ??
    undefined;

  return {
    pharmacyId: 24,
    fromNumber: "+19105021156",
  };
};
