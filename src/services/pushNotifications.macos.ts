export type PushNotificationPayload = Record<string, unknown>;

type Unsubscribe = () => void;

export const initializePushNotifications =
  async (): Promise<Unsubscribe | null> => null;

export const unregisterPushNotifications = async (): Promise<void> => {};
