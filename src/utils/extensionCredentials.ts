import type { PharmacyDetails } from "../types/auth";

export type ExtensionCredentials = {
  extension: string;
  password: string;
  host: string;
  wsUrls: string[];
};

const normalizeHost = (value: string | undefined | null): string | null => {
  if (!value?.trim()) {
    return null;
  }

  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
};

const uniqueUrls = (urls: string[]): string[] =>
  urls.filter((url, index) => url.length > 0 && urls.indexOf(url) === index);

const getWsUrlsFromPharmacy = (
  pharmacy: PharmacyDetails,
  host: string,
): string[] => {
  const fromApi = uniqueUrls([
    pharmacy.sipWsUrl?.trim() ?? "",
    pharmacy.sipWssUrl?.trim() ?? "",
  ]);

  if (fromApi.length > 0) {
    return fromApi;
  }

  // Fallback only when API omits WebSocket URLs — derived from sipHost.
  return uniqueUrls([`ws://${host}:5066`, `wss://${host}:7443`]);
};

/** FusionPBX extension credentials from pharmacy profile (auth/me). */
export const getExtensionCredentials = (
  pharmacy: PharmacyDetails | null | undefined,
): ExtensionCredentials | null => {
  const extension = pharmacy?.sipExtension?.trim();
  const password = pharmacy?.sipExtensionPassword?.trim();
  const host =
    normalizeHost(pharmacy?.sipHost) ?? normalizeHost(pharmacy?.domainName);

  if (!extension || !password || !host || !pharmacy) {
    return null;
  }

  return {
    extension,
    password,
    host,
    wsUrls: getWsUrlsFromPharmacy(pharmacy, host),
  };
};

export const extensionCredentialsKey = (
  credentials: ExtensionCredentials,
): string =>
  `${credentials.extension}@${credentials.host}|${credentials.password}|${credentials.wsUrls.join(",")}`;
