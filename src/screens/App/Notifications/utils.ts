import type { LucideIcon } from "lucide-react-native";
import type { Notification } from "../../../types/notification";
import { formatSectionDate, formatTime } from "../../../utils/dateUtils";
import { getNotificationConfig } from "./notificationConfig";

export type NotificationDisplayItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  referenceId: string;
  referenceType: string;
};

export type NotificationSectionGroup = {
  key: string;
  label: string;
  items: NotificationDisplayItem[];
};

const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const getDateKey = (createdAt: string): string => {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getSectionMeta = (createdAt: string): { key: string; label: string } => {
  const date = new Date(createdAt);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) {
    return { key: "today", label: "Today" };
  }

  if (isSameDay(date, yesterday)) {
    return { key: "yesterday", label: "Yesterday" };
  }

  return {
    key: getDateKey(createdAt),
    label: formatSectionDate(createdAt),
  };
};

const getSectionSortValue = (key: string): number => {
  if (key === "today") {
    return Number.MAX_SAFE_INTEGER;
  }

  if (key === "yesterday") {
    return Number.MAX_SAFE_INTEGER - 1;
  }

  return new Date(`${key}T12:00:00`).getTime();
};

export const toNotificationDisplayItem = (
  notification: Notification,
): NotificationDisplayItem => {
  const { Icon, iconColor, iconBg } = getNotificationConfig(notification.type);

  return {
    timestamp: formatTime(notification.createdAt),
    Icon,
    iconColor,
    iconBg,
    ...notification,
  };
};

export const groupNotificationsBySection = (
  notifications: Notification[],
): NotificationSectionGroup[] => {
  const sectionMap = new Map<
    string,
    { label: string; items: NotificationDisplayItem[] }
  >();

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const notification of sorted) {
    const { key, label } = getSectionMeta(notification.createdAt);
    const item = toNotificationDisplayItem(notification);

    if (!sectionMap.has(key)) {
      sectionMap.set(key, { label, items: [] });
    }

    sectionMap.get(key)!.items.push(item);
  }

  return Array.from(sectionMap.entries())
    .sort(
      ([keyA], [keyB]) => getSectionSortValue(keyB) - getSectionSortValue(keyA),
    )
    .map(([key, section]) => ({
      key,
      label: section.label,
      items: section.items,
    }));
};

export type NotificationListRow =
  | { type: "header"; key: string; label: string }
  | {
      type: "notification";
      key: string;
      notification: NotificationDisplayItem;
    };

export const flattenNotificationSections = (
  sections: NotificationSectionGroup[],
): NotificationListRow[] => {
  const rows: NotificationListRow[] = [];

  for (const section of sections) {
    rows.push({
      type: "header",
      key: `header-${section.key}`,
      label: section.label,
    });

    for (const notification of section.items) {
      rows.push({
        type: "notification",
        key: notification.id,
        notification,
      });
    }
  }

  return rows;
};
