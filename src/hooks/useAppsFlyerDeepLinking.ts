import { Linking } from "react-native";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  flushPendingAuthDeepLink,
  navigateToResetPassword,
} from "../services/appsflyer/navigateToResetPassword";
import {
  initializeAppsFlyer,
  teardownAppsFlyer,
} from "../services/appsflyer/appsflyerService";
import { subscribePendingAuthDeepLink } from "../services/appsflyer/pendingAuthDeepLink";
import type { RootState } from "../redux/store";
import { parseResetPasswordDeepLinkFromUrl } from "../utils/resetPasswordDeepLink";

const handleUrl = (url: string | null): void => {
  if (!url) {
    return;
  }

  const resetParams = parseResetPasswordDeepLinkFromUrl(url);
  if (resetParams) {
    void navigateToResetPassword(resetParams);
  }
};

export const useAppsFlyerDeepLinking = (navigationReady: boolean): void => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.userData != null,
  );

  useEffect(() => {
    initializeAppsFlyer();

    void Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
      teardownAppsFlyer();
    };
  }, []);

  useEffect(() => {
    if (!navigationReady || isAuthenticated) {
      return;
    }

    flushPendingAuthDeepLink();

    return subscribePendingAuthDeepLink(() => {
      flushPendingAuthDeepLink();
    });
  }, [isAuthenticated, navigationReady]);
};
