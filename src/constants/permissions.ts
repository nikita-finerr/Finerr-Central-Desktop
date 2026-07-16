export const Permission = {
  ViewMessage: "viewMessage",
  ManageMessage: "manageMessage",
  ViewCall: "viewCall",
  ManageCall: "manageCall",
  ManageContact: "manageContact",
  ViewFax: "viewFax",
  ManageFax: "manageFax",
  ViewVoicemail: "viewVoicemail",
  ManageVoicemail: "manageVoicemail",
  ViewTranscript: "viewTranscript",
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];
