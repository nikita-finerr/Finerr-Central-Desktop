import { Platform } from "react-native";
import appsFlyer, { type UnifiedDeepLinkData } from "react-native-appsflyer";

import { Env } from "../../constants/env";
import { parseResetPasswordDeepLinkFromUrl } from "../../utils/resetPasswordDeepLink";
import { navigateToResetPassword } from "./navigateToResetPassword";

let initialized = false;
let deepLinkUnsubscribe: (() => void) | null = null;

const handleAppsFlyerDeepLink = (result: UnifiedDeepLinkData): void => {
  if (result.deepLinkStatus === "NOT_FOUND") {
    return;
  }

  const data = result.data as Record<string, unknown>;
  const link = typeof data.link === "string" ? data.link : "";
  const resetParams =
    parseResetPasswordDeepLinkFromUrl(link) ??
    (typeof data.token === "string" && data.token.trim()
      ? { token: data.token.trim() }
      : null);

  if (resetParams) {
    void navigateToResetPassword(resetParams);
  }
};

export const initializeAppsFlyer = (): void => {
  if (initialized || !Env.APPSFLYER_DEV_KEY) {
    return;
  }

  deepLinkUnsubscribe?.();
  deepLinkUnsubscribe = appsFlyer.onDeepLink(handleAppsFlyerDeepLink);

  appsFlyer.initSdk(
    {
      devKey: Env.APPSFLYER_DEV_KEY,
      appId: Platform.OS === "ios" ? Env.APPSFLYER_APP_ID : undefined,
      isDebug: __DEV__,
      onInstallConversionDataListener: false,
      onDeepLinkListener: true,
    },
    () => {
      initialized = true;
    },
    () => {
      initialized = false;
    },
  );
};

export const teardownAppsFlyer = (): void => {
  deepLinkUnsubscribe?.();
  deepLinkUnsubscribe = null;
};
