import { CONTACT_DETAILS, CONVERSATIONS } from "../../../../mockData/MessagesContact";
import {
  getAvatarColors,
  getNameInitials,
} from "../../../../utils/avatarColors";
import {
  getContactRoleTag,
  isExcludedContactRole,
  type ContactRoleTag,
} from "../components/ContactUtils";

export type ContactRecord = {
  id: string;
  name: string;
  role: string;
  roleTag: ContactRoleTag;
  phone: string;
  email?: string;
  avatarInitials: string;
  avatarColor: string;
};

const deletedContactIds = new Set<string>();

export const deleteContact = (id: string): void => {
  deletedContactIds.add(id);
};

export const getAllContacts = (): ContactRecord[] => {
  return CONVERSATIONS.filter(
    (conversation) =>
      !isExcludedContactRole(conversation.contactRole) &&
      !deletedContactIds.has(conversation.id),
  ).map((conversation) => ({
    id: conversation.id,
    name: conversation.contactName,
    role: conversation.contactRole,
    roleTag: getContactRoleTag(conversation.contactRole),
    phone: CONTACT_DETAILS[conversation.id]?.phone ?? "",
    email: CONTACT_DETAILS[conversation.id]?.email,
    avatarInitials: getNameInitials(conversation.contactName),
    avatarColor: getAvatarColors(conversation.contactName).textColor,
  }));
};

export const getContactById = (id: string): ContactRecord | undefined => {
  return getAllContacts().find((contact) => contact.id === id);
};

export const filterContactRecords = (
  contacts: ContactRecord[],
  query: string,
): ContactRecord[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return contacts;

  return contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(normalized) ||
      contact.phone.includes(normalized) ||
      contact.email?.toLowerCase().includes(normalized) ||
      contact.role.toLowerCase().includes(normalized),
  );
};

const normalizePhoneDigits = (phone: string): string =>
  phone.replace(/\D/g, "").slice(-10);

export const findContactByPhone = (
  phoneNumber: string,
): ContactRecord | undefined => {
  const targetDigits = normalizePhoneDigits(phoneNumber);
  if (targetDigits.length < 10) {
    return undefined;
  }

  return getAllContacts().find(
    (contact) => normalizePhoneDigits(contact.phone) === targetDigits,
  );
};

export const findContactNameByPhone = (
  phoneNumber: string,
): string | undefined => findContactByPhone(phoneNumber)?.name;
