import type { ApiResponse } from "./common";

export type NotificationType =
  | "message_received"
  | "fax_received"
  | "missed_call"
  | "recording_saved"
  | "contact_updated"
  | "fax_delivered";

export type NotificationReferenceType =
  | "message"
  | "fax"
  | "call"
  | "recording"
  | "contact";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  referenceId: string;
  referenceType: NotificationReferenceType;
}

export interface NotificationsListResponse extends ApiResponse<Notification[]> {
  unreadCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type NotificationsListParams = {
  page?: number;
  pageSize?: number;
};

export type AddFcmTokenPayload = {
  fcmToken: string;
  deviceId: string;
  platform: string;
};

export type UnregisterDevicePayload = {
  fcmToken: string;
};
