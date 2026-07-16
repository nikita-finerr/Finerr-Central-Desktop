import type { PharmacyDetails } from "../types/auth";

export type PharmacyPbxConfig = {
  baseUrl: string;
  apiKey: string;
};

export const getPharmacyPbxConfig = (
  pharmacy: PharmacyDetails | null | undefined,
): PharmacyPbxConfig | null => {
  const baseUrl = pharmacy?.domainName?.trim();
  const apiKey = pharmacy?.apiKey?.trim();

  if (!baseUrl || !apiKey) {
    return null;
  }

  return { baseUrl, apiKey };
};
