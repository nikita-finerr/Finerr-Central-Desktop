import type { ContactVoicemailItemDto } from "../../../../../../types/contact";
import {
  formatConversationTimestamp,
  formatTime,
} from "../../../../../../utils/dateUtils";

export type VoicemailHistoryFilter = "All Voicemails" | "Received" | "Sent";

export type VoicemailHistorySection = {
  key: string;
  label: string;
  items: ContactVoicemailItemDto[];
};

const SECTION_SORT_WEIGHT: Record<string, number> = {
  today: Number.MAX_SAFE_INTEGER,
  yesterday: Number.MAX_SAFE_INTEGER - 1,
};

const getSortKey = (dateString?: string | null): number => {
  if (!dateString) {
    return 0;
  }

  const match = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/,
  );

  if (!match) {
    return new Date(dateString).getTime();
  }

  return Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0),
  );
};

const getSectionMeta = (
  timestamp: string,
  sortKey: number,
): { key: string; label: string; sortWeight: number } => {
  if (timestamp.startsWith("Today") || /^\d{2}:\d{2} [AP]M$/i.test(timestamp)) {
    return {
      key: "today",
      label: "Today",
      sortWeight: SECTION_SORT_WEIGHT.today,
    };
  }

  if (timestamp.startsWith("Yesterday") || timestamp === "Yesterday") {
    return {
      key: "yesterday",
      label: "Yesterday",
      sortWeight: SECTION_SORT_WEIGHT.yesterday,
    };
  }

  const lastComma = timestamp.lastIndexOf(", ");
  const trailing = timestamp.slice(lastComma + 2);
  const hasTimeSuffix = /^\d{1,2}:\d{2}/.test(trailing);

  if (hasTimeSuffix && lastComma > 0) {
    const dateLabel = timestamp.slice(0, lastComma);
    return {
      key: dateLabel,
      label: dateLabel,
      sortWeight: new Date(`${dateLabel}T12:00:00`).getTime(),
    };
  }

  return {
    key: timestamp,
    label: timestamp,
    sortWeight: sortKey || 0,
  };
};

export const getVoicemailFilterParam = (
  filter: VoicemailHistoryFilter,
): string | undefined => {
  switch (filter) {
    case "Received":
      return "inbound";
    case "Sent":
      return "outbound";
    default:
      return "";
  }
};

export const getVoicemailTimeLabel = (receivedAt?: string | null): string => {
  if (!receivedAt) {
    return "";
  }

  return formatTime(receivedAt);
};

export const getVoicemailDirectionLabel = (
  direction?: string | null,
): string => {
  const normalized = (direction ?? "").toLowerCase();
  return normalized.includes("out") ? "Voicemail Sent" : "Voicemail Received";
};

export const getVoicemailDurationLabel = (
  item: ContactVoicemailItemDto,
): string => {
  return item.duration?.trim() ?? "";
};

export const groupContactVoicemailItems = (
  items: ContactVoicemailItemDto[],
): VoicemailHistorySection[] => {
  const sectionMap = new Map<
    string,
    { label: string; sortWeight: number; items: ContactVoicemailItemDto[] }
  >();

  for (const item of items) {
    const receivedAt = item.receivedAt ?? "";
    const timestamp = receivedAt
      ? formatConversationTimestamp(receivedAt)
      : "";
    const sortKey = getSortKey(receivedAt);
    const { key, label, sortWeight } = getSectionMeta(timestamp, sortKey);
    const existing = sectionMap.get(key);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    sectionMap.set(key, { label, sortWeight, items: [item] });
  }

  const sections = Array.from(sectionMap.entries()).map(([key, value]) => ({
    key,
    label: value.label,
    items: value.items.sort(
      (a, b) => getSortKey(b.receivedAt) - getSortKey(a.receivedAt),
    ),
    sortWeight:
      value.sortWeight > 0
        ? value.sortWeight
        : Math.max(...value.items.map((item) => getSortKey(item.receivedAt))),
  }));

  sections.sort((a, b) => b.sortWeight - a.sortWeight);

  return sections.map(({ key, label, items }) => ({ key, label, items }));
};
