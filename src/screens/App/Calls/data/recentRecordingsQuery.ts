import type { RecordingDirection } from "../../../../types/recording";
import type { CallRecord, RecentCallsFilter } from "./callRecords";

export type RecordingsListQuery = {
  direction?: RecordingDirection;
  extension?: string;
};

const normalizeExtensionSearch = (search: string): string | undefined => {
  const trimmed = search.trim();
  if (!trimmed) {
    return undefined;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 3) {
    return digits;
  }

  return trimmed;
};

/** Recordings API `extension` matches phone/extension numbers, not caller names. */
export const shouldUseExtensionSearch = (search: string): boolean => {
  const trimmed = search.trim();
  if (!trimmed) {
    return false;
  }

  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 3;
};

export const matchesCallRecordSearch = (
  record: CallRecord,
  search: string,
): boolean => {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const queryDigits = query.replace(/\D/g, "");
  const phoneDigits = record.phone.replace(/\D/g, "");

  return (
    record.contactName.toLowerCase().includes(query) ||
    record.phone.toLowerCase().includes(query) ||
    (queryDigits.length > 0 && phoneDigits.includes(queryDigits))
  );
};

export const buildRecordingsListQuery = (
  filter: RecentCallsFilter,
  search: string,
): RecordingsListQuery => {
  const query: RecordingsListQuery = {};

  if (shouldUseExtensionSearch(search)) {
    const extension = normalizeExtensionSearch(search);
    if (extension) {
      query.extension = extension;
    }
  }

  switch (filter) {
    case "Incoming Calls":
      query.direction = "inbound";
      break;
    case "Outgoing Calls":
      query.direction = "outbound";
      break;
    case "Missed Calls":
      break;
    default:
      break;
  }

  return query;
};

export const shouldClientFilterSearch = (search: string): boolean => {
  const trimmed = search.trim();
  return trimmed.length > 0 && !shouldUseExtensionSearch(trimmed);
};
