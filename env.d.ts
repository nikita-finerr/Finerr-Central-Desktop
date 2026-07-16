declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_BASE_URL?: string;
    EXPO_PUBLIC_DEV_HOST?: string;
    EXPO_PUBLIC_DEV_PORT?: string;
    EXPO_PUBLIC_PRIVACY_URL?: string;
    EXPO_PUBLIC_TERMS_URL?: string;
    EXPO_PUBLIC_TELNYX_PUSH_ENV?: "production" | "debug";
  }
}
