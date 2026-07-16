import type { RecordingDto } from "../../../../types/recording";
import { formatConversationTimestamp } from "../../../../utils/dateUtils";
import { formatPhoneDisplay } from "../../../../utils/formatPhoneNumber";
import type { CallRecord } from "./callRecords";

const getRecordingPhone = (recording: RecordingDto): string => {
  if (recording.direction === "outbound") {
    return (
      recording.destination_number ??
      recording.caller_destination ??
      recording.caller_id_number ??
      ""
    );
  }

  return (
    recording.caller_id_number ??
    recording.caller_destination ??
    recording.destination_number ??
    ""
  );
};

const getRecordingContactName = (
  recording: RecordingDto,
  phone: string,
): string => {
  const name = recording.caller_id_name?.trim();
  if (name) {
    return name;
  }

  const formattedPhone = formatPhoneDisplay(phone);
  return formattedPhone || "Unknown";
};

const isMissedRecording = (recording: RecordingDto): boolean =>
  recording.duration_seconds === 0 &&
  (recording.direction === "inbound" || recording.direction === "outbound");

export const mapRecordingToCallRecord = (
  recording: RecordingDto,
): CallRecord => {
  const phone = getRecordingPhone(recording);
  const direction =
    recording.direction === "outbound" ? "outbound" : "inbound";

  return {
    id: recording.id,
    conversationId: recording.id,
    contactName: getRecordingContactName(recording, phone),
    contactRole: "",
    phone,
    direction,
    callType: "Direct",
    timestamp: formatConversationTimestamp(recording.date),
    sortKey: new Date(recording.date).getTime(),
    durationSeconds: recording.duration_seconds,
    isMissed: isMissedRecording(recording),
    isConference: false,
    isVoicemail: false,
    isVoicemailListened: false,
    hasRecording: true,
    recordingId: recording.id,
  };
};

export const mapRecordingsToCallRecords = (
  recordings: RecordingDto[],
): CallRecord[] =>
  recordings
    .map(mapRecordingToCallRecord)
    .sort((left, right) => right.sortKey - left.sortKey);
