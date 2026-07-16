import type { CallRecord } from "../../screens/App/Calls/data/callRecords";
import type { FaxRecord } from "../../screens/App/Messages/data/faxRecords";
import { CONTACT_DETAILS, CONVERSATIONS } from "../MessagesContact";
import { CALL_HISTORY_SEEDS } from "./callHistorySeeds";
import { FAX_HISTORY_SEEDS } from "./faxHistorySeeds";
import type {
  CallHistorySeed,
  FaxHistorySeed,
  VoicemailHistorySeed,
} from "./types";
import { VOICEMAIL_HISTORY_SEEDS } from "./voicemailHistorySeeds";

const buildCallHistoryRecord = (seed: CallHistorySeed): CallRecord | null => {
  const conversation = CONVERSATIONS.find(
    (item) => item.id === seed.conversationId,
  );
  const detail = CONTACT_DETAILS[seed.conversationId];

  if (!conversation || !detail) {
    return null;
  }

  return {
    id: seed.id,
    conversationId: seed.conversationId,
    contactName: conversation.contactName,
    contactRole: conversation.contactRole,
    phone: detail.phone,
    direction: seed.direction,
    callType: "Direct",
    timestamp: seed.timestamp,
    sortKey: seed.sortKey,
    durationSeconds: seed.durationSeconds,
    isMissed: seed.isMissed ?? false,
    isConference: false,
    isVoicemail: false,
    isVoicemailListened: false,
    hasRecording: false,
  };
};

const buildVoicemailHistoryRecord = (
  seed: VoicemailHistorySeed,
): CallRecord | null => {
  const conversation = CONVERSATIONS.find(
    (item) => item.id === seed.conversationId,
  );
  const detail = CONTACT_DETAILS[seed.conversationId];

  if (!conversation || !detail) {
    return null;
  }

  return {
    id: seed.id,
    conversationId: seed.conversationId,
    contactName: conversation.contactName,
    contactRole: conversation.contactRole,
    phone: detail.phone,
    direction: seed.direction,
    callType: "Direct",
    timestamp: seed.timestamp,
    sortKey: seed.sortKey,
    durationSeconds: seed.durationSeconds,
    isMissed: false,
    isConference: false,
    isVoicemail: true,
    isVoicemailListened: seed.isVoicemailListened ?? false,
    hasRecording: false,
  };
};

const buildFaxHistoryRecord = (seed: FaxHistorySeed): FaxRecord | null => {
  const conversation = CONVERSATIONS.find(
    (item) => item.id === seed.conversationId,
  );
  const detail = CONTACT_DETAILS[seed.conversationId];

  if (!conversation || !detail) {
    return null;
  }

  return {
    id: seed.id,
    conversationId: seed.conversationId,
    contactName: conversation.contactName,
    contactRole: conversation.contactRole,
    faxNumber: detail.phone,
    direction: seed.direction,
    status: seed.status,
    documentName: seed.documentName,
    pageCount: seed.pageCount,
    fileSizeBytes: seed.fileSizeBytes,
    coverNote: seed.coverNote,
    timestamp: seed.timestamp,
    sortKey: seed.sortKey,
  };
};

const buildRecords = <TSeed, TRecord>(
  seeds: TSeed[],
  builder: (seed: TSeed) => TRecord | null,
): TRecord[] => {
  return seeds
    .map((seed) => builder(seed))
    .filter((record): record is TRecord => record !== null);
};

export const CONTACT_CALL_HISTORY_RECORDS = buildRecords(
  CALL_HISTORY_SEEDS,
  buildCallHistoryRecord,
);

export const CONTACT_VOICEMAIL_HISTORY_RECORDS = buildRecords(
  VOICEMAIL_HISTORY_SEEDS,
  buildVoicemailHistoryRecord,
);

export const CONTACT_FAX_HISTORY_RECORDS = buildRecords(
  FAX_HISTORY_SEEDS,
  buildFaxHistoryRecord,
);
