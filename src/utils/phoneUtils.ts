export const normalizeToE164 = (phoneNumber: string): string => {
  const trimmed = phoneNumber.trim();
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return digits.length > 0 ? `+${digits}` : trimmed;
};

export const normalizePhoneForSendApi = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return phone.trim();
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  return digits;
};

export const normalizePhoneForChatApi = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  return digits;
};

/** FusionPBX outbound routes usually expect local digits, not +E164. */
export const formatExtensionDialNumber = (phoneNumber: string): string => {
  const digits = normalizeToE164(phoneNumber).replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  return digits;
};
