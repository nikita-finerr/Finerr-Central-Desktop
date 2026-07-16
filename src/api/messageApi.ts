import { ApiEndpoints } from "../constants";
import type {
  ChatMessagesListParams,
  ChatMessagesListResponse,
  MarkChatMessagesReadParams,
  MarkChatMessagesReadResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
  SendChatMultipartMessageParams,
  SmsConversationsListParams,
} from "../types/message";
import { makeApiRequest } from "./axiosConfig";

export const messageApi = {
  listSmsConversations: (params: SmsConversationsListParams) =>
    makeApiRequest(ApiEndpoints.messages.smsList, params, {
      method: "GET",
    }),

  listChatMessages: (params: ChatMessagesListParams) =>
    makeApiRequest(ApiEndpoints.messages.chatHistory, params, {
      method: "GET",
    }) as Promise<ChatMessagesListResponse>,

  markChatMessagesRead: (params: MarkChatMessagesReadParams) =>
    makeApiRequest(ApiEndpoints.messages.chatMarkRead, {}, {
      method: "POST",
      params,
    }) as Promise<MarkChatMessagesReadResponse>,

  sendChatMessage: (userId: string, body: SendChatMessageRequest) =>
    makeApiRequest(ApiEndpoints.messages.chatSend, body, {
      method: "POST",
      params: { userId },
    }) as Promise<SendChatMessageResponse>,

  sendChatMessageMultipart: ({
    userId,
    formData,
  }: SendChatMultipartMessageParams) => {
    return makeApiRequest(ApiEndpoints.messages.chatSendMultipart, formData, {
      method: "POST",
      params: { userId },
      contentType: "multipart/form-data",
    }) as Promise<SendChatMessageResponse>;
  },
};
