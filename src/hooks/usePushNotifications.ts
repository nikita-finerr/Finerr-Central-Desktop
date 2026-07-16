import { useEffect } from "react";

import {
  initializePushNotifications,
  unregisterPushNotifications,
} from "../services/pushNotifications";

const usePushNotifications = (isAuthenticated: boolean) => {
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let unsubscribe: (() => void) | null = null;

    void initializePushNotifications().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      unsubscribe?.();
    };
  }, [isAuthenticated]);
};

export default usePushNotifications;
