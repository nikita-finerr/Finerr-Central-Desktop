import type { CallRecord } from "../screens/App/Calls/data/callRecords";
import type { CallDto } from "../types/call";
import { formatConversationTimestamp } from "./dateUtils";

export const formatDisplayPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    const local = digits.slice(1);
    return `+(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
};

export const isMissedCall = (call: CallDto): boolean =>
  call.direction === "inbound" &&
  (call.status === "no_answer" || call.status === "busy");

export const mapCallDtoToRecord = (call: CallDto): CallRecord => {
  const isOutbound = call.direction === "outbound";
  const remoteNumber = isOutbound ? call.calleeNumber : call.callerNumber;
  const timestamp = call.startedAt ?? call.createdAt;

  return {
    id: call.id,
    conversationId: "",
    contactName: formatDisplayPhone(remoteNumber),
    contactRole: "",
    phone: remoteNumber,
    direction: call.direction,
    callType: "Direct",
    timestamp: formatConversationTimestamp(timestamp),
    sortKey: new Date(timestamp).getTime(),
    durationSeconds: call.durationSeconds ?? 0,
    isMissed: isMissedCall(call),
    isConference: false,
    isVoicemail: false,
    isVoicemailListened: false,
    hasRecording: Boolean(call.recordingUrl),
    recordingId: call.recordingUrl,
  };
};

export const mapCallDtosToRecords = (calls: CallDto[]): CallRecord[] =>
  calls.map(mapCallDtoToRecord).sort((a, b) => b.sortKey - a.sortKey);
