import { UserData } from "../../../../../types/auth";
import type { ChatMessageDto } from "../../../../../types/message";
import type { MessageAttachment } from "../../NewMessage/types";

const createRefId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const formatReceivedDate = (date = new Date()) => {
  const pad = (value: number, length = 2) =>
    String(value).padStart(length, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const millis = pad(date.getMilliseconds(), 3);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${millis}`;
};

const createLocalMessage = (
  message: string,
  mmsMediaUrl: string | null = null,
  userData: UserData,
  phoneNumber: string,
): ChatMessageDto => ({
  message,
  direction: "outbound",
  receivedDate: formatReceivedDate(),
  senderName: userData.pharmacy?.pharmacyName ?? "",
  receiverName: phoneNumber,
  senderNameInt: userData.pharmacy?.userId ?? "",
  receiverNameInt: phoneNumber,
  destination: `tel:${phoneNumber}`,
  source: userData.pharmacy?.userId ?? "",
  mmsMediaUrl,
  refId: createRefId(),
});

export const textToChatMessage = (
  text: string,
  userData: UserData,
  phoneNumber: string,
): ChatMessageDto =>
  createLocalMessage(text.trim(), null, userData, phoneNumber);

export const attachmentsToChatMessages = (
  attachments: MessageAttachment[],
  userData: UserData,
  phoneNumber: string,
): ChatMessageDto[] => {
  const images = attachments.filter((item) => item.kind === "image");
  if (images.length === 0) return [];

  const mmsMediaUrl = images
    .map((image) => image.uri)
    .filter(Boolean)
    .join(",");

  return [
    createLocalMessage(
      images[0]?.name ?? "Photo",
      mmsMediaUrl || null,
      userData,
      phoneNumber,
    ),
  ];
};
