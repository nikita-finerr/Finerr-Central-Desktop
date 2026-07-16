import { Colors } from "../../../../../../constants";
import type { ContactFaxItemDto } from "../../../../../../types/contact";
import {
  formatConversationTimestamp,
  formatTime,
} from "../../../../../../utils/dateUtils";
import { getStatusColor, getStatusLabel } from "../../../data/faxRecords";

export type FaxHistoryFilter = "" | "Received" | "Sent";

export type FaxHistorySection = {
  key: string;
  label: string;
  items: ContactFaxItemDto[];
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

export const getFaxFilterParam = (
  filter: FaxHistoryFilter,
): string | undefined => {
  switch (filter) {
    case "Received":
      return "received";
    case "Sent":
      return "sent";
    default:
      return "";
  }
};

export type FaxFileType = "pdf" | "document" | "image";

export const getContactFaxDocumentName = (item: ContactFaxItemDto): string => {
  const url = item.documentUrl;
  if (!url) {
    return "Fax document";
  }

  const fileName = url.split("/").pop()?.split("?")[0];
  if (!fileName) {
    return "Fax document";
  }

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

export const getFaxFileType = (documentName: string): FaxFileType => {
  const extension = documentName.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "pdf") return "pdf";
  if (
    ["jpg", "jpeg", "png", "gif", "webp", "heic", "bmp"].includes(extension)
  ) {
    return "image";
  }

  return "document";
};

export const getFaxFileTypeMeta = (documentName: string) => {
  const fileType = getFaxFileType(documentName);

  switch (fileType) {
    case "pdf":
      return {
        fileType,
        badgeLabel: "PDF",
        badgeColor: Colors.error,
        iconBackground: `${Colors.error}14`,
        iconColor: Colors.error,
      };
    case "image":
      return {
        fileType,
        badgeLabel: "IMG",
        badgeColor: Colors.primary,
        iconBackground: `${Colors.primary}14`,
        iconColor: Colors.primary,
      };
    default:
      return {
        fileType,
        badgeLabel: "DOC",
        badgeColor: Colors.secondary,
        iconBackground: `${Colors.secondary}14`,
        iconColor: Colors.secondary,
      };
  }
};

export const getContactFaxStatusColor = (item: ContactFaxItemDto): string =>
  getStatusColor(item.status, item.direction);

export const getContactFaxStatusLabel = (item: ContactFaxItemDto): string =>
  item.displayStatus?.trim() || getStatusLabel(item.status, item.direction);

export const isFailedContactFax = (item: ContactFaxItemDto): boolean =>
  (item.status ?? "").toLowerCase().includes("fail");

export const getFaxTimeLabel = (createdAt?: string | null): string => {
  if (!createdAt) {
    return "";
  }

  return formatTime(createdAt);
};

export const matchesFaxSearch = (
  item: ContactFaxItemDto,
  query: string,
): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    getContactFaxDocumentName(item).toLowerCase().includes(normalized) ||
    (item.contactPhone ?? "").includes(normalized) ||
    (item.contactPhoneDisplay ?? "").toLowerCase().includes(normalized)
  );
};

export const groupContactFaxItems = (
  items: ContactFaxItemDto[],
): FaxHistorySection[] => {
  const sectionMap = new Map<
    string,
    { label: string; sortWeight: number; items: ContactFaxItemDto[] }
  >();

  for (const item of items) {
    const createdAt = item.createdAt ?? "";
    const timestamp = createdAt ? formatConversationTimestamp(createdAt) : "";
    const sortKey = getSortKey(createdAt);
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
      (a, b) => getSortKey(b.createdAt) - getSortKey(a.createdAt),
    ),
    sortWeight:
      value.sortWeight > 0
        ? value.sortWeight
        : Math.max(...value.items.map((item) => getSortKey(item.createdAt))),
  }));

  sections.sort((a, b) => b.sortWeight - a.sortWeight);

  return sections.map(({ key, label, items }) => ({ key, label, items }));
};
