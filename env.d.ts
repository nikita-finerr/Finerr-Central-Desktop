declare module "react-native-config" {
  export interface NativeConfig {
    DEV_HOST?: string;
    DEV_PORT?: string;
    BASE_URL?: string;
    PRIVACY_URL?: string;
    TERMS_URL?: string;
    APP_SCHEME?: string;
    ONELINK_HOST?: string;
    ONELINK_PATH_PREFIX?: string;
    APPSFLYER_DEV_KEY?: string;
    APPSFLYER_APP_ID?: string;
    TELNYX_PUSH_ENV?: "production" | "debug";
    EXPO_PUBLIC_DEV_HOST?: string;
    EXPO_PUBLIC_DEV_PORT?: string;
    EXPO_PUBLIC_BASE_URL?: string;
    EXPO_PUBLIC_PRIVACY_URL?: string;
    EXPO_PUBLIC_TERMS_URL?: string;
    EXPO_PUBLIC_APP_SCHEME?: string;
    EXPO_PUBLIC_ONELINK_HOST?: string;
    EXPO_PUBLIC_ONELINK_PATH_PREFIX?: string;
    EXPO_PUBLIC_APPSFLYER_DEV_KEY?: string;
    EXPO_PUBLIC_APPSFLYER_APP_ID?: string;
    EXPO_PUBLIC_TELNYX_PUSH_ENV?: "production" | "debug";
  }

  export const Config: NativeConfig;
  export default Config;
}
