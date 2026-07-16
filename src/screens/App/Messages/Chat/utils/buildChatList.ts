import type { ChatMessageDto } from "../../../../../types/message";
import {
  formatChatDateLabel,
  formatChatMessageTime,
  getChatReceivedTimestamp,
} from "./chatDateUtils";

export type ChatListItem =
  | { type: "date"; id: string; label: string }
  | { type: "message"; id: string; data: ChatMessageDto };

export const getMessageId = (message: ChatMessageDto, index: number): string =>
  `${message.refId}-${message.receivedDate}-${index}`;

export const buildChatList = (messages: ChatMessageDto[]): ChatListItem[] => {
  const sorted = [...messages].sort(
    (a, b) =>
      getChatReceivedTimestamp(b.receivedDate) -
      getChatReceivedTimestamp(a.receivedDate),
  );
  const result: ChatListItem[] = [];
  let previousDate: string | null = null;

  sorted.forEach((message, index) => {
    const dateLabel = formatChatDateLabel(message.receivedDate);

    if (previousDate && previousDate !== dateLabel) {
      result.push({
        type: "date",
        id: `date-${previousDate}`,
        label: previousDate,
      });
    }

    result.push({
      type: "message",
      id: getMessageId(message, index),
      data: message,
    });
    previousDate = dateLabel;
  });

  if (previousDate) {
    result.push({
      type: "date",
      id: `date-${previousDate}`,
      label: previousDate,
    });
  }

  return result;
};

export const getMessageTime = (receivedDate: string): string =>
  formatChatMessageTime(receivedDate);
