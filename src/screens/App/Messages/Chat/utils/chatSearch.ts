import type { ChatMessageDto } from "../../../../../types/message";
import { getChatReceivedTimestamp } from "./chatDateUtils";
import { getMessageId } from "./buildChatList";

export type TextPart = {
  text: string;
  match: boolean;
};

export const messageMatchesSearch = (
  item: ChatMessageDto,
  query: string,
): boolean => {
  const normalized = query?.trim()?.toLowerCase();
  if (!normalized) return false;

  return item?.message?.toLowerCase()?.includes(normalized);
};

export const getSearchMatchIds = (
  messages: ChatMessageDto[],
  query: string,
): string[] => {
  const normalized = query?.trim();
  if (!normalized) return [];

  return messages
    ?.map((item, index) => ({ item, id: getMessageId(item, index) }))
    ?.filter(({ item }) => messageMatchesSearch(item, normalized))
    ?.sort(
      (a, b) =>
        getChatReceivedTimestamp(a?.item?.receivedDate) -
        getChatReceivedTimestamp(b?.item?.receivedDate),
    )
    ?.map(({ id }) => id);
};

export const splitTextByQuery = (text: string, query: string): TextPart[] => {
  const normalized = query.trim();
  if (!normalized) return [{ text, match: false }];

  const lowerText = text.toLowerCase();
  const lowerQuery = normalized.toLowerCase();
  const parts: TextPart[] = [];
  let start = 0;
  let index = lowerText.indexOf(lowerQuery, start);

  while (index !== -1) {
    if (index > start) {
      parts.push({ text: text.slice(start, index), match: false });
    }
    parts.push({
      text: text.slice(index, index + normalized.length),
      match: true,
    });
    start = index + normalized.length;
    index = lowerText.indexOf(lowerQuery, start);
  }

  if (start < text.length) {
    parts.push({ text: text.slice(start), match: false });
  }

  return parts.length > 0 ? parts : [{ text, match: false }];
};
