import type { ApiResponse } from "./common";

export type MessageType = "sms" | "mms";

export interface SmsConversation {
  id: number;
  conversationId: number;
  contactName: string;
  contactInitials: string;
  phoneNumber: string;
  lastMessagePreview: string;
  messageType: MessageType;
  hasMedia: boolean;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SmsConversationsListResponse extends ApiResponse<
  SmsConversation[]
> {
  totalUnreadCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type SmsConversationsListParams = {
  PharmacyId: number;
  Search?: string;
  FromDate?: string;
  ToDate?: string;
  Page?: number;
  PageSize?: number;
};

export type ChatMessageDirection = "inbound" | "outbound";

export interface ChatMessageDto {
  message: string;
  direction: ChatMessageDirection;
  receivedDate: string;
  senderName: string;
  receiverName: string;
  senderNameInt: string;
  receiverNameInt: string;
  destination: string | null;
  source: string | null;
  mmsMediaUrl: string | null;
  refId: string;
}

export interface ChatMessagesListResponse {
  items: ChatMessageDto[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export type ChatMessagesListParams = {
  userId: string;
  source: string;
  senderName: string;
  pageIndex?: number;
  pageSize?: number;
};

export type MarkChatMessagesReadParams = {
  userId: string;
  source: string;
};

export type MarkChatMessagesReadResponse = {
  success: boolean;
  message?: string | null;
  markedCount?: number;
};

export type SendChatMessageRequest = {
  mobileNumber?: string | null;
  text?: string | null;
  mediaUrls?: string[] | null;
  imageSource?: string | null;
  base64Images?: string[] | null;
  fileNames?: string[] | null;
};

export type SendChatMessageResponse = {
  success: boolean;
  message?: string | null;
};

export type SendChatMultipartMessageParams = {
  userId: string;
  formData: FormData;
};
