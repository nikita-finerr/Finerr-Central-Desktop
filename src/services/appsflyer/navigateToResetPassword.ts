import { CommonActions } from "@react-navigation/native";
import { InteractionManager } from "react-native";

import { AuthRoutes, MainRoutes } from "../../constants";
import { store } from "../../redux/store";
import type { ResetPasswordDeepLinkParams } from "../../utils/resetPasswordDeepLink";
import { performAppLogout } from "../../utils/performAppLogout";
import { navigationRef } from "../../navigation/navigationRef";
import {
  clearPendingAuthDeepLink,
  peekPendingAuthDeepLink,
  setPendingAuthDeepLink,
} from "./pendingAuthDeepLink";

const resetToResetPasswordScreen = (
  params: ResetPasswordDeepLinkParams,
): void => {
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: MainRoutes.Auth,
          state: {
            index: 1,
            routes: [
              { name: AuthRoutes.Login },
              { name: AuthRoutes.ResetPassword, params },
            ],
          },
        },
      ],
    }),
  );
  clearPendingAuthDeepLink();
};

export const flushPendingAuthDeepLink = (): void => {
  const pending = peekPendingAuthDeepLink();
  if (!pending || pending.route !== "ResetPassword") {
    return;
  }

  const isAuthenticated = store.getState().auth.userData != null;
  if (isAuthenticated || !navigationRef.isReady()) {
    return;
  }

  InteractionManager.runAfterInteractions(() => {
    requestAnimationFrame(() => {
      const stillPending = peekPendingAuthDeepLink();
      if (!stillPending || stillPending.route !== "ResetPassword") {
        return;
      }

      if (store.getState().auth.userData != null || !navigationRef.isReady()) {
        return;
      }

      resetToResetPasswordScreen(stillPending.params);
    });
  });
};

export const navigateToResetPassword = async (
  params: ResetPasswordDeepLinkParams,
): Promise<void> => {
  if (!params.token.trim()) {
    return;
  }

  setPendingAuthDeepLink({
    route: "ResetPassword",
    params,
  });

  const isAuthenticated = store.getState().auth.userData != null;

  if (isAuthenticated) {
    await performAppLogout();
    flushPendingAuthDeepLink();
    return;
  }

  if (!navigationRef.isReady()) {
    return;
  }

  flushPendingAuthDeepLink();
};
