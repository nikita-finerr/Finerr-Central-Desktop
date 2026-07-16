import { Colors } from "../../../../constants";
import { MOCK_FAX_RECORDS } from "../../../../mockData/faxRecords";
import { FaxDto } from "../../../../types/fax";

export type FaxDirection = "sent" | "received";
export type FaxStatus = "delivered" | "sent" | "failed" | "pending";

export type FaxFilter = "all" | "sent" | "received" | "failed";

export interface FaxRecord {
  id: string;
  conversationId: string;
  contactName: string;
  contactRole: string;
  faxNumber: string;
  direction: FaxDirection;
  status: FaxStatus;
  documentName: string;
  pageCount: number;
  fileSizeBytes: number;
  coverNote?: string;
  timestamp: string;
  sortKey: number;
}

export const FAX_FILTERS: FaxFilter[] = ["all", "sent", "received", "failed"];

const FAX_RECORDS: FaxRecord[] = MOCK_FAX_RECORDS;

export const getFaxRecords = (): FaxRecord[] => {
  return [...FAX_RECORDS].sort((a, b) => b.sortKey - a.sortKey);
};

export const formatFaxFileSize = (bytes: number): string => {
  if (bytes >= 1_048_576) {
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${bytes} B`;
};

export const filterFaxRecords = (
  records: FaxRecord[],
  filter: FaxFilter,
  query: string,
): FaxRecord[] => {
  const normalized = query.trim().toLowerCase();

  return records.filter((record) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "sent" && record.direction === "sent") ||
      (filter === "received" && record.direction === "received") ||
      (filter === "failed" && record.status === "failed");

    const matchesQuery =
      normalized.length === 0 ||
      record.contactName.toLowerCase().includes(normalized) ||
      record.documentName.toLowerCase().includes(normalized) ||
      record.faxNumber.includes(normalized);

    return matchesFilter && matchesQuery;
  });
};

export const getFaxStatusColor = (
  status: FaxStatus,
  direction: FaxDirection,
): string => {
  if (status === "failed") return Colors.error;
  if (status === "pending") return Colors.warning;
  if (direction === "received" || status === "delivered") return Colors.success;
  if (status === "sent" || direction === "sent") return Colors.primary;
  return Colors.warning;
};

export const getFaxStatusLabel = (
  status: FaxStatus,
  direction: FaxDirection,
): string => {
  if (status === "failed") return "Failed";
  if (status === "pending") return "Sending…";
  if (direction === "received") return "Received";
  return status === "delivered" ? "Delivered" : "Sent";
};

export const getDocumentName = (item: FaxDto): string => {
  const url = item.documentUrl ?? item.mediaUrl;
  if (!url) return "Fax document";

  const fileName = url.split("/").pop()?.split("?")[0];
  if (!fileName) return "Fax document";

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

export const getRemoteNumber = (item: FaxDto): string =>
  item.direction === "inbound"
    ? (item.fromNumber ?? "")
    : (item.toNumber ?? "");

export const getStatusColor = (
  status?: string | null,
  direction?: string | null,
) => {
  const normalized = (status ?? "").toLowerCase();

  if (normalized.includes("fail")) return Colors.error;
  if (
    normalized.includes("queue") ||
    normalized.includes("pending") ||
    normalized.includes("sending")
  ) {
    return Colors.warning;
  }
  if (normalized.includes("deliver") || direction === "inbound") {
    return Colors.success;
  }

  return Colors.primary;
};

export const getStatusLabel = (
  status?: string | null,
  direction?: string | null,
) => {
  const normalized = (status ?? "").toLowerCase();

  if (normalized.includes("fail")) return "Failed";
  if (
    normalized.includes("queue") ||
    normalized.includes("pending") ||
    normalized.includes("sending")
  ) {
    return "Sending…";
  }
  if (direction === "inbound") return "Received";
  if (normalized.includes("deliver")) return "Delivered";

  return "Sent";
};
