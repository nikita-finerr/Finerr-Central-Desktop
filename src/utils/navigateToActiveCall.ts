import { AppRoutes, MainRoutes } from "../constants";
import { navigationRef } from "../navigation/navigationRef";

const MAX_ATTEMPTS = 40;
const RETRY_DELAY_MS = 250;

export const navigateToActiveCall = (): void => {
  const attemptNavigate = (attempt = 0) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(MainRoutes.App, {
        screen: AppRoutes.ActiveCall,
      });
      return;
    }

    if (attempt < MAX_ATTEMPTS) {
      setTimeout(() => attemptNavigate(attempt + 1), RETRY_DELAY_MS);
    }
  };

  attemptNavigate();
};
