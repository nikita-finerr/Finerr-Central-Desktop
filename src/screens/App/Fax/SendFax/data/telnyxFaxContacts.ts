import type { TelnyxFaxNumberDto } from "../../../../../types/fax";

export const getTelnyxFaxContactLabel = (item: TelnyxFaxNumberDto): string =>
  item.displayName?.trim() ||
  item.faxNumber ||
  item.normalizedFaxNumber ||
  "Unknown";

export const getTelnyxFaxContactNumber = (
  item: TelnyxFaxNumberDto,
): string => item.faxNumber ?? item.normalizedFaxNumber ?? "";

export const hasTelnyxFaxContactNumber = (item: TelnyxFaxNumberDto): boolean =>
  getTelnyxFaxContactNumber(item).trim().length > 0;

export const matchesTelnyxFaxContactSearch = (
  item: TelnyxFaxNumberDto,
  query: string,
): boolean => {
  const normalizedQuery = query.replace(/\D/g, "");
  const label = getTelnyxFaxContactLabel(item);
  const phoneNumber = getTelnyxFaxContactNumber(item);
  const haystack = `${label} ${phoneNumber}`.toLowerCase();

  if (haystack.includes(query.toLowerCase())) {
    return true;
  }

  if (normalizedQuery.length >= 3) {
    return phoneNumber.replace(/\D/g, "").includes(normalizedQuery);
  }

  return false;
};
