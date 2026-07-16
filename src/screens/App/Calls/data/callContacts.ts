import type { ChatContactDto } from "../../../../types/contact";
import { formatPhoneDisplay } from "../../../../utils/formatPhoneNumber";

export type CallContactSection = {
  key: string;
  label: string;
  items: ChatContactDto[];
};

export const getCallContactName = (contact: ChatContactDto): string =>
  contact.fullName?.trim() ||
  [contact.patientFirstName, contact.patientLastName]
    .filter(Boolean)
    .join(" ")
    .trim() ||
  contact.mobileNumber ||
  contact.phoneNumber ||
  "Unknown";

export const getCallContactPhone = (contact: ChatContactDto): string =>
  contact.mobileNumber ?? contact.phoneNumber ?? "";

export const getCallContactPhoneDisplay = (contact: ChatContactDto): string =>
  formatPhoneDisplay(getCallContactPhone(contact));

export const hasCallContactPhone = (contact: ChatContactDto): boolean =>
  getCallContactPhone(contact).replace(/\D/g, "").length >= 3;

const getContactSectionLetter = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "#";
  }

  const letter = trimmed[0].toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
};

export const groupCallContactsByLetter = (
  contacts: ChatContactDto[],
): CallContactSection[] => {
  const groups = new Map<string, ChatContactDto[]>();

  for (const contact of contacts) {
    const letter = getContactSectionLetter(getCallContactName(contact));
    const bucket = groups.get(letter) ?? [];
    bucket.push(contact);
    groups.set(letter, bucket);
  }

  for (const items of groups.values()) {
    items.sort((left, right) =>
      getCallContactName(left).localeCompare(getCallContactName(right), undefined, {
        sensitivity: "base",
      }),
    );
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => {
      if (left === "#") {
        return -1;
      }
      if (right === "#") {
        return 1;
      }
      return left.localeCompare(right);
    })
    .map(([letter, items]) => ({
      key: letter,
      label: letter,
      items,
    }));
};
