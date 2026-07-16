import {
  Permission,
  type PermissionKey,
} from "../constants/permissions";

const PERMISSION_ALIASES: Record<PermissionKey, readonly string[]> = {
  [Permission.ViewMessage]: ["viewmessage", "viewmessages"],
  [Permission.ManageMessage]: ["managemessage", "managemessages"],
  [Permission.ViewCall]: ["viewcall", "viewcalls"],
  [Permission.ManageCall]: ["managecall", "managecalls"],
  [Permission.ManageContact]: ["managecontact", "managecontacts"],
  [Permission.ViewFax]: ["viewfax", "viewfaxes"],
  [Permission.ManageFax]: ["managefax", "managefaxes"],
  [Permission.ViewVoicemail]: ["viewvoicemail", "viewvoicemails"],
  [Permission.ManageVoicemail]: ["managevoicemail", "managevoicemails"],
  [Permission.ViewTranscript]: ["viewtranscript", "viewtranscripts"],
};

const normalizePermission = (value: string): string =>
  value.toLowerCase().replace(/[^a-z]/g, "");

export const hasPermission = (
  permissions: string[] | undefined,
  permission: PermissionKey,
): boolean => {
  if (!permissions?.length) {
    return false;
  }

  const normalized = new Set(permissions.map(normalizePermission));
  return PERMISSION_ALIASES[permission].some((alias) => normalized.has(alias));
};

export const hasAnyPermission = (
  permissions: string[] | undefined,
  keys: PermissionKey[],
): boolean => keys.some((key) => hasPermission(permissions, key));
