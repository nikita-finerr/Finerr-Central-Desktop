export type ResetPasswordDeepLinkParams = {
  token: string;
  email?: string;
};

const ONELINK_HOST = "finerrcentral.onelink.me";
const ONELINK_TEMPLATE_PREFIX = "/jDC6";

const getStringParam = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseQueryParams = (url: string): Record<string, string> => {
  const queryIndex = url.indexOf("?");
  if (queryIndex < 0) {
    return {};
  }

  const params: Record<string, string> = {};
  const search = url.slice(queryIndex + 1);

  for (const part of search.split("&")) {
    const [rawKey, rawValue = ""] = part.split("=");
    if (!rawKey) {
      continue;
    }

    try {
      params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
    } catch {
      params[rawKey] = rawValue;
    }
  }

  return params;
};

const extractResetPasswordParams = (
  data: Record<string, unknown>,
): ResetPasswordDeepLinkParams | null => {
  const token =
    getStringParam(data.token) ??
    getStringParam(data.deep_link_sub1) ??
    getStringParam(data.reset_token);

  if (!token) {
    return null;
  }

  return { token };
};

export const parseResetPasswordDeepLinkFromUrl = (
  url: string,
): ResetPasswordDeepLinkParams | null => {
  if (!url.trim()) {
    return null;
  }

  const normalized = url.trim();
  const params = parseQueryParams(normalized);
  const isResetLink = Boolean(params.token);

  if (!isResetLink) {
    return null;
  }

  return extractResetPasswordParams(params);
};
