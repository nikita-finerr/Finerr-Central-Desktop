import {
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  type LucideIcon,
} from "lucide-react-native";

import { Colors } from "../../../../constants";
import { formatConversationTimestamp } from "../../../../utils/dateUtils";
import type { CallRecord } from "../data/callRecords";

export type CallStatusKind = "missed" | "incoming" | "outgoing";

export type CallStatusMeta = {
  kind: CallStatusKind;
  label: string;
  Icon: LucideIcon;
  color: string;
  durationLabel: string;
};

export const formatCallDuration = (seconds: number): string => {
  if (seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

export const getCallTimeLabel = (timestamp: string): string => {
  if (timestamp.includes("T")) {
    return formatConversationTimestamp(timestamp);
  }

  if (timestamp.startsWith("Yesterday")) {
    return "Yesterday";
  }

  if (timestamp.startsWith("Today")) {
    const lastComma = timestamp.lastIndexOf(", ");
    if (lastComma >= 0) {
      return timestamp.slice(lastComma + 2);
    }
  }

  const dayMatch = timestamp.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/);
  if (dayMatch) {
    return dayMatch[1];
  }

  const lastComma = timestamp.lastIndexOf(", ");
  const trailing = timestamp.slice(lastComma + 2);
  if (/AM|PM/i.test(trailing)) {
    return trailing;
  }

  return timestamp;
};

export const getCallStatusMeta = (item: CallRecord): CallStatusMeta => {
  if (item.isMissed) {
    return {
      kind: "missed",
      label: "Missed Call",
      Icon: PhoneMissed,
      color: Colors.error,
      durationLabel: "",
    };
  }

  if (item.direction === "outbound") {
    return {
      kind: "outgoing",
      label: "Outgoing",
      Icon: PhoneOutgoing,
      color: Colors.secondary,
      durationLabel: formatCallDuration(item.durationSeconds),
    };
  }

  return {
    kind: "incoming",
    label: "Incoming",
    Icon: PhoneIncoming,
    color: Colors.success,
    durationLabel: formatCallDuration(item.durationSeconds),
  };
};
