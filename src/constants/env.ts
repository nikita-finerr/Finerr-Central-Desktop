const getEnv = (value: string | undefined): string => value ?? "";

const readEnv = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    const resolved = getEnv(value);
    if (resolved) return resolved;
  }
  return "";
};

const resolveDevBaseUrl = (): string => {
  const host = readEnv(
    process.env.EXPO_PUBLIC_DEV_HOST,
    process.env.DEV_HOST,
  );
  const port =
    readEnv(process.env.EXPO_PUBLIC_DEV_PORT, process.env.DEV_PORT) || "5280";
  return `http://${host}:${port}`;
};

const resolveBaseUrl = (): string => {
  if (!__DEV__) {
    return resolveDevBaseUrl();
  }
  return readEnv(process.env.EXPO_PUBLIC_BASE_URL, process.env.BASE_URL);
};

export const Env = {
  BASE_URL: resolveBaseUrl(),
  PRIVACY_URL: readEnv(
    process.env.EXPO_PUBLIC_PRIVACY_URL,
    process.env.PRIVACY_URL,
  ),
  TERMS_URL: readEnv(
    process.env.EXPO_PUBLIC_TERMS_URL,
    process.env.TERMS_URL,
  ),
  APP_SCHEME:
    readEnv(process.env.EXPO_PUBLIC_APP_SCHEME, process.env.APP_SCHEME) ||
    "finerrcentral",
  ONELINK_HOST:
    readEnv(
      process.env.EXPO_PUBLIC_ONELINK_HOST,
      process.env.ONELINK_HOST,
    ) || "finerrcentral.onelink.me",
  ONELINK_PATH_PREFIX: readEnv(
    process.env.EXPO_PUBLIC_ONELINK_PATH_PREFIX,
    process.env.ONELINK_PATH_PREFIX,
  ),
  APPSFLYER_DEV_KEY: readEnv(
    process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY,
    process.env.APPSFLYER_DEV_KEY,
  ),
  APPSFLYER_APP_ID: readEnv(
    process.env.EXPO_PUBLIC_APPSFLYER_APP_ID,
    process.env.APPSFLYER_APP_ID,
  ),
  /** Telnyx push environment — use "production" for store/TestFlight builds */
  TELNYX_PUSH_ENV:
    readEnv(
      process.env.EXPO_PUBLIC_TELNYX_PUSH_ENV,
      process.env.TELNYX_PUSH_ENV,
    ) || (__DEV__ ? "debug" : "production"),
} as const;
