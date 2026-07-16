import { ApiEndpoints } from "../constants";
import type {
  AddFcmTokenPayload,
  NotificationsListParams,
  UnregisterDevicePayload,
} from "../types/notification";
import { makeApiRequest } from "./axiosConfig";

export const notificationApi = {
  list: (params: NotificationsListParams = {}) =>
    makeApiRequest(ApiEndpoints.notifications.list, params, {
      method: "GET",
    }),

  markRead: (id: string) =>
    makeApiRequest(
      ApiEndpoints.notifications.markRead(id),
      {},
      { method: "PATCH" },
    ),

  addFcmToken: (payload: AddFcmTokenPayload) =>
    makeApiRequest(ApiEndpoints.notifications.fcmToken, payload),

  unregisterDeviceToken: (payload: UnregisterDevicePayload) =>
    makeApiRequest(ApiEndpoints.notifications.fcmToken, payload, {
      method: "DELETE",
    }),
};
