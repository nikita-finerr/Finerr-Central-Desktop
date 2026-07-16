import { AppRoutes } from "../constants";
import { navigationRef } from "../navigation/navigationRef";

export const isActiveCallRouteFocused = (): boolean => {
  if (!navigationRef.isReady()) {
    return false;
  }

  return navigationRef.getCurrentRoute()?.name === AppRoutes.ActiveCall;
};
