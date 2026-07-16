import type { ChatContactDto } from "../../../../../types/contact";
import type { NewMessageContact } from "../types";

export const mapChatContactToNewMessageContact = (
  contact: ChatContactDto,
): NewMessageContact => {
  const contactName =
    contact.fullName?.trim() ||
    [contact.patientFirstName, contact.patientLastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    contact.mobileNumber ||
    contact.phoneNumber ||
    "Unknown";

  return {
    id: String(contact.id),
    contactName,
    phoneNumber: contact.mobileNumber ?? contact.phoneNumber ?? "",
  };
};
