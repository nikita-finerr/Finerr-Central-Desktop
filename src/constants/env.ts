import Constants from "expo-constants";
import { Platform } from "react-native";

const getEnv = (value: string | undefined): string => value ?? "";

const resolveDevBaseUrl = (): string => {
  const host = getEnv(process.env.EXPO_PUBLIC_DEV_HOST);
  const port = getEnv(process.env.EXPO_PUBLIC_DEV_PORT) || "5280";
  // Physical device — needs the Mac's LAN IP
  return `http://${host}:${port}`;
};

const resolveBaseUrl = (): string => {
  if (__DEV__) {
    return resolveDevBaseUrl();
  }
  return getEnv(process.env.EXPO_PUBLIC_BASE_URL);
};

export const Env = {
  BASE_URL: resolveBaseUrl(),
  PRIVACY_URL: getEnv(process.env.EXPO_PUBLIC_PRIVACY_URL),
  TERMS_URL: getEnv(process.env.EXPO_PUBLIC_TERMS_URL),
  APP_SCHEME: getEnv(process.env.EXPO_PUBLIC_APP_SCHEME) || "finerrcentral",
  ONELINK_HOST:
    getEnv(process.env.EXPO_PUBLIC_ONELINK_HOST) || "finerrcentral.onelink.me",
  ONELINK_PATH_PREFIX: getEnv(process.env.EXPO_PUBLIC_ONELINK_PATH_PREFIX),
  APPSFLYER_DEV_KEY: getEnv(process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY),
  APPSFLYER_APP_ID: getEnv(process.env.EXPO_PUBLIC_APPSFLYER_APP_ID),
  /** Telnyx push environment — use "production" for store/TestFlight builds */
  TELNYX_PUSH_ENV:
    getEnv(process.env.EXPO_PUBLIC_TELNYX_PUSH_ENV) ||
    (__DEV__ ? "debug" : "production"),
} as const;
