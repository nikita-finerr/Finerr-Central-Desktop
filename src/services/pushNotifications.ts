import messaging, {
  type FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { notificationApi } from "../api/notificationApi";
import { getDeviceId } from "../utils/deviceId";

export type PushNotificationPayload = FirebaseMessagingTypes.RemoteMessage;

type Unsubscribe = () => void;

const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4F46E5",
  });
};

const requestPushPermissions = async () => {
  if (Platform.OS === "ios") {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return false;
    }

    await messaging().registerDeviceForRemoteMessages();
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

const getFcmToken = async () => {
  const token = await messaging().getToken();
  return token;
};

const registerTokenWithBackend = async (token: string) => {
  const deviceId = await getDeviceId();
  const response = await notificationApi.addFcmToken({
    fcmToken: token,
    deviceId,
    platform: Platform.OS,
  });
  if (response?.success === false) {
    console.warn("Failed to register device token:", response?.message);
  }
};

const displayForegroundNotification = async (
  remoteMessage: PushNotificationPayload,
) => {
  const title =
    remoteMessage.notification?.title?.trim() ??
    (typeof remoteMessage.data?.title === "string"
      ? remoteMessage.data.title
      : "Finerr Central");
  const body =
    remoteMessage.notification?.body?.trim() ??
    (typeof remoteMessage.data?.body === "string"
      ? remoteMessage.data.body
      : "");

  if (!body) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: remoteMessage.data ?? {},
    },
    trigger: null,
  });
};

const hasNotificationPayload = (remoteMessage: PushNotificationPayload) =>
  Boolean(
    remoteMessage.notification?.title?.trim() ||
    remoteMessage.notification?.body?.trim(),
  );

const handleNotificationOpen = (
  remoteMessage: PushNotificationPayload | null,
) => {
  if (!remoteMessage) {
    return;
  }

  console.log("Notification opened:", remoteMessage.data);
};

export const initializePushNotifications =
  async (): Promise<Unsubscribe | null> => {
    const hasPermission = await requestPushPermissions();
    if (!hasPermission) {
      return null;
    }

    await ensureAndroidChannel();

    const token = await getFcmToken();
    await registerTokenWithBackend(token);

    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage) => {
        // iOS: firebase.json shows remote notification payloads in foreground.
        // Scheduling a local copy causes duplicates.
        if (
          Platform.OS === "android" ||
          !hasNotificationPayload(remoteMessage)
        ) {
          await displayForegroundNotification(remoteMessage);
        }
      },
    );

    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(
      async (newToken) => {
        await registerTokenWithBackend(newToken);
      },
    );

    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        handleNotificationOpen(remoteMessage);
      },
    );

    const initialNotification = await messaging().getInitialNotification();
    handleNotificationOpen(initialNotification);

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnTokenRefresh();
      unsubscribeOnNotificationOpened();
    };
  };

export const unregisterPushNotifications = async () => {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    await notificationApi.unregisterDeviceToken({ fcmToken });
  }

  try {
    await messaging().deleteToken();
  } catch {
    // Token may already be cleared.
  }
};
