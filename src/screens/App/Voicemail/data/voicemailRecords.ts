import { Colors } from "../../../../constants";
import { VOICEMAIL_TRANSCRIPTS } from "../../../../mockData/voicemailTranscripts";
import type {
  VoicemailMessageDto,
  VoicemailTranscriptDto,
} from "../../../../types/voicemail";
import { formatConversationTimestamp } from "../../../../utils/dateUtils";
import { formatPhoneDisplay } from "../../../../utils/formatPhoneNumber";
import type { CallRecord } from "../../Calls/data/callRecords";
import {
  filterCallRecords,
  getCallRecords,
  hasListenedVoicemailId,
  isVoicemailListened,
} from "../../Calls/data/callRecords";

export type VoicemailFilter = "All" | "Unread" | "Read";

export const VOICEMAIL_FILTERS: VoicemailFilter[] = ["All", "Unread", "Read"];

export const VOICEMAIL_FILTER_COLORS: Record<VoicemailFilter, string> = {
  All: Colors.primary,
  Unread: Colors.primary,
  Read: Colors.primary,
};

export const getVoicemailCallerName = (
  message: VoicemailMessageDto,
): string => {
  const callerName = message.caller_id_name?.trim();
  if (callerName) {
    return callerName;
  }

  const phone = message?.caller_id_number?.trim() ?? "";
  return formatPhoneDisplay(phone) || "Unknown";
};

export const getVoicemailCallerPhone = (message: VoicemailMessageDto): string =>
  message?.caller_id_number?.trim() ?? "";

export const getVoicemailTimestamp = (message: VoicemailMessageDto): string =>
  formatConversationTimestamp(message.created_at);

export const isVoicemailMessageUnread = (
  message: VoicemailMessageDto,
): boolean => {
  if (hasListenedVoicemailId(message.id)) {
    return false;
  }

  return message.is_new && !message.read_at;
};

export const isVoicemailMessageRead = (message: VoicemailMessageDto): boolean =>
  !isVoicemailMessageUnread(message);

const getDefaultRolePhrase = (contactRole: string): string => {
  return contactRole === "Patient"
    ? "I wanted to follow up on my recent visit"
    : "I'm calling regarding a patient case and need to discuss next steps";
};

const buildFallbackTranscript = (
  message: VoicemailMessageDto,
  contactRole: string,
): string => {
  const contactName = getVoicemailCallerName(message);
  const phone = getVoicemailCallerPhone(message);

  return `Hi, this is ${contactName}. ${getDefaultRolePhrase(contactRole)}. Please call me back at ${phone} when you get a chance. Thank you.`;
};

const matchesVoicemailId = (record: CallRecord, id: string): boolean => {
  return record.id === id && record.isVoicemail;
};

const matchesVoicemailMessageFilter = (
  message: VoicemailMessageDto,
  filter: VoicemailFilter,
): boolean => {
  return (
    filter === "All" ||
    (filter === "Unread" && isVoicemailMessageUnread(message)) ||
    (filter === "Read" && isVoicemailMessageRead(message))
  );
};

const matchesVoicemailMessageQuery = (
  message: VoicemailMessageDto,
  normalized: string,
): boolean => {
  if (normalized.length === 0) {
    return true;
  }

  const callerName = getVoicemailCallerName(message).toLowerCase();
  const phone = getVoicemailCallerPhone(message);

  return callerName.includes(normalized) || phone.includes(normalized);
};

export const formatVoicemailTranscriptText = (
  transcript?: VoicemailTranscriptDto | null,
  message?: VoicemailMessageDto | null,
): string => {
  const directText =
    transcript?.text?.trim() ??
    message?.transcript?.text?.trim() ??
    message?.transcription?.trim();

  if (directText) {
    return directText;
  }

  const segments =
    transcript?.segments?.filter((segment) => segment.text?.trim()) ??
    message?.transcript?.segments?.filter((segment) => segment.text?.trim()) ??
    [];

  if (segments.length > 0) {
    return segments
      .map((segment) => segment.text?.trim())
      .filter(Boolean)
      .join(" ");
  }

  return "";
};

export const getVoicemailDisplayTranscript = (
  message: VoicemailMessageDto,
  transcript?: VoicemailTranscriptDto | null,
): string => formatVoicemailTranscriptText(transcript, message);

export const getVoicemailTranscript = (record: CallRecord): string => {
  if (record.transcription?.trim()) {
    return record.transcription.trim();
  }

  if (VOICEMAIL_TRANSCRIPTS[record.id]) {
    return VOICEMAIL_TRANSCRIPTS[record.id];
  }

  return `Hi, this is ${record.contactName}. ${getDefaultRolePhrase(record.contactRole)}. Please call me back at ${record.phone} when you get a chance. Thank you.`;
};

export const getVoicemailRecordById = (id: string): CallRecord | undefined => {
  const records = getCallRecords();

  for (const record of records) {
    if (matchesVoicemailId(record, id)) {
      return record;
    }
  }

  return undefined;
};

export const isVoicemailUnread = (record: CallRecord): boolean => {
  return !isVoicemailListened(record);
};

export const getVoicemailFilterColor = (filter: VoicemailFilter): string => {
  return VOICEMAIL_FILTER_COLORS[filter];
};

export const getVoicemailRecords = (): CallRecord[] => {
  return filterCallRecords(getCallRecords(), "Voicemail");
};

export const filterVoicemailMessages = (
  messages: VoicemailMessageDto[],
  filter: VoicemailFilter,
  query: string,
): VoicemailMessageDto[] => {
  const normalized = query.trim().toLowerCase();

  return messages.filter(
    (message) =>
      matchesVoicemailMessageFilter(message, filter) &&
      matchesVoicemailMessageQuery(message, normalized),
  );
};

export const filterVoicemailRecords = (
  records: CallRecord[],
  filter: VoicemailFilter,
  query: string,
): CallRecord[] => {
  const normalized = query.trim().toLowerCase();

  return records.filter((record) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Unread" && !isVoicemailListened(record)) ||
      (filter === "Read" && isVoicemailListened(record));

    const matchesQuery =
      normalized.length === 0 ||
      record.contactName.toLowerCase().includes(normalized) ||
      record.phone.includes(normalized);

    return matchesFilter && matchesQuery;
  });
};
