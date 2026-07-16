import {
  Bell,
  CheckCircle2,
  Disc,
  FileText,
  MessageSquare,
  PhoneMissed,
  User,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { NotificationType } from "../../../types/notification";

type NotificationVisualConfig = {
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  NotificationVisualConfig
> = {
  message_received: {
    Icon: MessageSquare,
    iconColor: "#4D8DFF",
    iconBg: "#EFF6FF",
  },
  fax_received: {
    Icon: FileText,
    iconColor: "#F59E0B",
    iconBg: "#FFF7ED",
  },
  missed_call: {
    Icon: PhoneMissed,
    iconColor: "#EF4444",
    iconBg: "#FEF2F2",
  },
  recording_saved: {
    Icon: Disc,
    iconColor: "#10B981",
    iconBg: "#ECFDF5",
  },
  contact_updated: {
    Icon: User,
    iconColor: "#8B5CF6",
    iconBg: "#F5F3FF",
  },
  fax_delivered: {
    Icon: CheckCircle2,
    iconColor: "#F59E0B",
    iconBg: "#FFFBEB",
  },
};

const DEFAULT_NOTIFICATION_CONFIG: NotificationVisualConfig = {
  Icon: Bell,
  iconColor: "#64748B",
  iconBg: "#F1F5F9",
};

export const getNotificationConfig = (
  type: NotificationType,
): NotificationVisualConfig => {
  return NOTIFICATION_CONFIG[type] ?? DEFAULT_NOTIFICATION_CONFIG;
};
