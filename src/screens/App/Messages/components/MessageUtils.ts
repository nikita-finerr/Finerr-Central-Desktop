import {
  ImageIcon,
  LucideIcon,
  MessageSquare,
  Paperclip,
} from "lucide-react-native";
import { Colors } from "../../../../constants";
import { ChatItemKind, CommType } from "../../../../mockData/MessagesContact";
import type { SmsConversation } from "../../../../types/message";

export type ActivityIconKind = "SMS" | "File" | "Image";

export const COMM_TYPE_STYLES: Record<
  ActivityIconKind,
  { label: string; color: string; bg: string }
> = {
  SMS: {
    label: "SMS",
    color: Colors.secondary,
    bg: `${Colors.secondary}12`,
  },
  File: {
    label: "File",
    color: Colors.warning,
    bg: `${Colors.warning}12`,
  },
  Image: {
    label: "Image",
    color: Colors.primary,
    bg: `${Colors.primary}12`,
  },
};

export const resolveActivityIconKind = (
  item: SmsConversation,
): ActivityIconKind => {
  if (item.messageType === "mms" || item.hasMedia) {
    return "Image";
  }

  return "SMS";
};

export const formatLatestActivity = (
  item: SmsConversation,
): {
  kind: ActivityIconKind;
  text: string;
} => {
  const kind = resolveActivityIconKind(item);
  const preview = item?.lastMessagePreview?.trim();

  if (kind === "Image") {
    return {
      kind,
      text: /attachment/i.test(preview) ? "Attachment" : preview,
    };
  }

  return { kind, text: preview };
};

export const chatKindToCommType = (kind: ChatItemKind): CommType => {
  if (kind === "File" || kind === "Image") return "SMS";
  return kind;
};

export const chatItemToLastMessage = (
  kind: ChatItemKind,
  content: string,
  activityTitle?: string,
): string => {
  switch (kind) {
    case "SMS":
      return content;
    case "Image":
      return /^\d+ photos?$/i.test(content)
        ? content
        : content.trim() || "Image shared";
    case "File":
      return `File shared: ${content}`;
    case "Fax":
      if (activityTitle === "Fax Sent") {
        return content.includes(".pdf")
          ? `Fax sent: ${content}`
          : `Fax sent: ${content}`;
      }
      return content.includes(".pdf") ? content : `Fax received: ${content}`;
    case "Voicemail": {
      const duration =
        content.match(/(\d{1,2}:\d{2}|\d+\s*min)/i)?.[0] ?? content;
      return `Voicemail • ${duration}`;
    }
    case "Call": {
      const direction = activityTitle?.toLowerCase().includes("outbound")
        ? "Outbound"
        : "Inbound";
      return `${direction} call • ${content}`;
    }
    default:
      return content;
  }
};

export const ACTIVITY_ICON_COLORS: Record<ActivityIconKind, string> = {
  SMS: COMM_TYPE_STYLES.SMS.color,
  File: Colors.warning,
  Image: Colors.primary,
};

export const ACTIVITY_ICONS: Record<ActivityIconKind, LucideIcon> = {
  SMS: MessageSquare,
  File: Paperclip,
  Image: ImageIcon,
};
