import notifee, { AndroidImportance } from "@notifee/react-native";
import messaging, {
  type FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

import { notificationApi } from "../api/notificationApi";
import { getDeviceId } from "../utils/deviceId";

export type PushNotificationPayload = FirebaseMessagingTypes.RemoteMessage;

type Unsubscribe = () => void;

const ANDROID_CHANNEL_ID = "default";

const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: "Default",
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
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

  if (Platform.OS === "android" && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }

  return true;
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

  await notifee.displayNotification({
    title,
    body,
    data: (remoteMessage.data ?? {}) as Record<string, string>,
    android: {
      channelId: ANDROID_CHANNEL_ID,
      pressAction: { id: "default" },
    },
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
