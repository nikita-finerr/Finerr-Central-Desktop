import { Colors } from "../../../../constants";
import { CONTACT_DETAILS } from "../../../../mockData/MessagesContact";
import {
  getAvatarColors,
  getNameInitials,
} from "../../../../utils/avatarColors";
import { CONVERSATIONS } from "../../../../mockData/MessagesContact";
import { EXTRA_CALL_RECORDS } from "../../../../mockData/extraCallRecords";

export type CallDirection = "inbound" | "outbound";
export type CallType = "Direct" | "Conference" | "Transfer";

export type CallsFilter =
  | "All Calls"
  | "Missed"
  | "Incoming"
  | "Outgoing"
  | "Voicemail"
  | "Recordings";

export interface CallRecord {
  id: string;
  conversationId: string;
  contactName: string;
  contactRole: string;
  phone: string;
  direction: CallDirection;
  callType: CallType;
  timestamp: string;
  sortKey: number;
  durationSeconds: number;
  isMissed: boolean;
  isConference: boolean;
  isVoicemail: boolean;
  isVoicemailListened: boolean;
  hasRecording: boolean;
  recordingId?: string;
  transcription?: string | null;
  audioUrl?: string | null;
}

const listenedVoicemailIds = new Set<string>();
const deletedCallIds = new Set<string>();

export const markVoicemailListened = (id: string): void => {
  listenedVoicemailIds.add(id);
};

export const hasListenedVoicemailId = (id: string): boolean =>
  listenedVoicemailIds.has(id);

export const deleteCallRecord = (id: string): void => {
  deletedCallIds.add(id);
};

export const getCallRecords = (): CallRecord[] => {
  return CALL_RECORDS.filter((record) => !deletedCallIds.has(record.id));
};

export const getCallRecordById = (id: string): CallRecord | undefined => {
  return getCallRecords().find((record) => record.id === id);
};

export const isVoicemailListened = (record: CallRecord): boolean => {
  if (!record.isVoicemail) return true;
  return record.isVoicemailListened || listenedVoicemailIds.has(record.id);
};

const parseDurationSeconds = (preview: string): number => {
  const minSec = preview.match(/(\d+)\s*m(?:in)?(?:\s*(\d+)\s*s)?/i);
  if (minSec) {
    const minutes = parseInt(minSec[1], 10);
    const seconds = minSec[2] ? parseInt(minSec[2], 10) : 0;
    return minutes * 60 + seconds;
  }

  const colon = preview.match(/(\d+):(\d{2})/);
  if (colon) {
    return parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10);
  }

  const minOnly = preview.match(/(\d+)\s*min/i);
  if (minOnly) return parseInt(minOnly[1], 10) * 60;

  return 0;
};

const inferCallType = (preview: string): CallType => {
  if (/conference/i.test(preview)) return "Conference";
  if (/transfer/i.test(preview)) return "Transfer";
  return "Direct";
};

const buildFromTimeline = (
  conversationId: string,
  timelineId: string,
  sortKey: number,
  options?: {
    voicemailDurationSeconds?: number;
    isVoicemailListened?: boolean;
  },
): CallRecord | null => {
  const conversation = CONVERSATIONS.find((c) => c.id === conversationId);
  const detail = CONTACT_DETAILS[conversationId];
  if (!conversation || !detail) return null;

  const item = detail.timeline.find((t) => t.id === timelineId);
  if (!item || (item.type !== "Call" && item.type !== "Voicemail")) return null;

  const isVoicemail = item.type === "Voicemail";
  const isMissed = /missed/i.test(item.preview);
  const isConference = /conference/i.test(item.preview);
  const callType = inferCallType(item.preview);
  const durationSeconds = isVoicemail
    ? (options?.voicemailDurationSeconds ??
        parseDurationSeconds(item.preview)) ||
      43
    : parseDurationSeconds(item.preview);
  const hasRecording =
    !isVoicemail &&
    !isMissed &&
    durationSeconds >= 120 &&
    (sortKey % 2 === 0 || isConference);

  return {
    id: `${conversationId}-${timelineId}`,
    conversationId,
    contactName: conversation.contactName,
    contactRole: conversation.contactRole,
    phone: detail.phone,
    direction: item.direction,
    callType: isConference ? "Conference" : callType,
    timestamp: item.timestamp,
    sortKey,
    durationSeconds,
    isMissed,
    isConference,
    isVoicemail,
    isVoicemailListened: isVoicemail
      ? (options?.isVoicemailListened ?? false)
      : false,
    hasRecording,
    recordingId: hasRecording
      ? `REC-${conversationId}-${timelineId}`
      : undefined,
  };
};

const TIMELINE_VOICEMAILS: Array<[string, string, number, number, boolean]> = [
  ["4", "t1", 131, 43, false],
  ["12", "t1", 125, 72, true],
  ["28", "t1", 122, 58, false],
];

const TIMELINE_CALLS: Array<[string, string, number]> = [
  ["1", "t3", 120],
  ["2", "t2", 119],
  ["4", "t2", 117],
  ["5", "t2", 116],
  ["8", "t1", 115],
  ["9", "t1", 114],
  ["11", "t2", 113],
  ["13", "t1", 111],
  ["15", "t2", 110],
  ["16", "t1", 109],
  ["19", "t1", 108],
  ["21", "t2", 107],
  ["22", "t1", 106],
  ["23", "t2", 105],
  ["26", "t1", 104],
];

export const CALL_RECORDS: CallRecord[] = [
  ...TIMELINE_CALLS.map(([conversationId, timelineId, sortKey]) =>
    buildFromTimeline(conversationId, timelineId, sortKey),
  ).filter((record): record is CallRecord => record !== null),
  ...TIMELINE_VOICEMAILS.map(
    ([conversationId, timelineId, sortKey, duration, listened]) =>
      buildFromTimeline(conversationId, timelineId, sortKey, {
        voicemailDurationSeconds: duration,
        isVoicemailListened: listened,
      }),
  ).filter((record): record is CallRecord => record !== null),
  ...EXTRA_CALL_RECORDS,
].sort((a, b) => b.sortKey - a.sortKey);

export const getCallRecord = (id: string): CallRecord | undefined => {
  if (deletedCallIds.has(id)) return undefined;
  return CALL_RECORDS.find((record) => record.id === id);
};

export const getCallsForContact = (conversationId: string): CallRecord[] => {
  return getCallRecords().filter(
    (record) => record.conversationId === conversationId,
  );
};

export const filterCallRecords = (
  records: CallRecord[],
  filter: CallsFilter,
  query = "",
): CallRecord[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return records.filter((record) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      record.contactName.toLowerCase().includes(normalizedQuery) ||
      record.phone.includes(normalizedQuery);

    if (!matchesQuery) return false;

    switch (filter) {
      case "All Calls":
        return !record.isVoicemail;
      case "Missed":
        return record.isMissed;
      case "Incoming":
        return (
          record.direction === "inbound" &&
          !record.isMissed &&
          !record.isVoicemail
        );
      case "Outgoing":
        return (
          record.direction === "outbound" &&
          !record.isMissed &&
          !record.isVoicemail
        );
      case "Recordings":
        return record.hasRecording;
      case "Voicemail":
        return record.isVoicemail;
      default:
        return true;
    }
  });
};

export const CALLS_FILTERS: CallsFilter[] = [
  "All Calls",
  "Missed",
  "Incoming",
  "Outgoing",
  "Voicemail",
  "Recordings",
];

export type RecentCallsFilter =
  | "All"
  | "Incoming Calls"
  | "Outgoing Calls"
  | "Missed Calls";

export const RECENT_CALLS_FILTERS: RecentCallsFilter[] = [
  "All",
  "Incoming Calls",
  "Outgoing Calls",
  "Missed Calls",
];

export const RECENT_CALLS_FILTER_COLORS: Record<RecentCallsFilter, string> = {
  All: Colors.primary,
  "Incoming Calls": Colors.success,
  "Outgoing Calls": Colors.secondary,
  "Missed Calls": Colors.error,
};

export const getRecentCallsFilterColor = (
  filter: RecentCallsFilter,
): string => {
  return RECENT_CALLS_FILTER_COLORS[filter];
};

const toCallsFilter = (filter: RecentCallsFilter): CallsFilter => {
  switch (filter) {
    case "Incoming Calls":
      return "Incoming";
    case "Outgoing Calls":
      return "Outgoing";
    case "Missed Calls":
      return "Missed";
    default:
      return "All Calls";
  }
};

export const filterRecentCallRecords = (
  records: CallRecord[],
  filter: RecentCallsFilter,
  query = "",
): CallRecord[] => {
  return filterCallRecords(records, toCallsFilter(filter), query);
};
