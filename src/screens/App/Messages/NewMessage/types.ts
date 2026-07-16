export type MessageAttachmentKind = "image" | "pdf" | "document";

export type MessageAttachment = {
  id: string;
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  kind: MessageAttachmentKind;
};

export type NewMessageContact = {
  id: string;
  contactName: string;
  phoneNumber: string;
};
