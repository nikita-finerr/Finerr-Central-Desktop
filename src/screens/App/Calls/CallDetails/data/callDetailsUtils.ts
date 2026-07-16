import {
  AudioLines,
  Calendar,
  Clock,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Smartphone,
  type LucideIcon,
} from "lucide-react-native";

import { Colors } from "../../../../../constants";
import type { CallRecord } from "../../data/callRecords";
import { formatCallDuration } from "../../components/CallUtils";
import { formatPhoneDisplay } from "../../../../../utils/formatPhoneNumber";

export type CallInfoRow = {
  key: string;
  label: string;
  value: string;
  valueColor: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
};

const MISSED_ICON_STYLE = {
  iconColor: Colors.error,
  iconBackground: `${Colors.error}14`,
} as const;

const BLUE_ICON_STYLE = {
  iconColor: Colors.secondary,
  iconBackground: `${Colors.secondary}14`,
} as const;

const PURPLE_ICON_STYLE = {
  iconColor: Colors.primary,
  iconBackground: `${Colors.primary}14`,
} as const;

export const getCallTypeLabel = (record: CallRecord): string => {
  if (record.isMissed) return "Missed";
  if (record.isVoicemail) return "Voicemail";
  return record.callType;
};

export const getDirectionLabel = (record: CallRecord): string => {
  return record.direction === "inbound" ? "Incoming" : "Outgoing";
};

export const getCallDurationLabel = (record: CallRecord): string => {
  if (record.isMissed || record.durationSeconds <= 0) return "No answer";
  return formatCallDuration(record.durationSeconds);
};

export const getRecordingStatusLabel = (record: CallRecord): string => {
  return record.hasRecording ? "Recorded" : "Not recorded";
};

export const getCallInformationRows = (record: CallRecord): CallInfoRow[] => {
  const callTypeLabel = getCallTypeLabel(record);
  const isMissed = record.isMissed;
  const directionLabel = getDirectionLabel(record);
  const DirectionIcon =
    record.direction === "outbound" ? PhoneOutgoing : PhoneIncoming;

  return [
    {
      key: "callType",
      label: "Call Type",
      value: callTypeLabel,
      valueColor: isMissed ? Colors.error : Colors.textPrimary,
      Icon: isMissed ? PhoneMissed : DirectionIcon,
      ...(isMissed ? MISSED_ICON_STYLE : BLUE_ICON_STYLE),
    },
    {
      key: "direction",
      label: "Direction",
      value: directionLabel,
      valueColor: Colors.textPrimary,
      Icon: DirectionIcon,
      ...BLUE_ICON_STYLE,
    },
    {
      key: "dateTime",
      label: "Date & Time",
      value: record.timestamp,
      valueColor: Colors.textPrimary,
      Icon: Calendar,
      ...BLUE_ICON_STYLE,
    },
    {
      key: "duration",
      label: "Duration",
      value: getCallDurationLabel(record),
      valueColor: Colors.textPrimary,
      Icon: Clock,
      ...BLUE_ICON_STYLE,
    },
    {
      key: "recordingStatus",
      label: "Recording Status",
      value: getRecordingStatusLabel(record),
      valueColor: Colors.textPrimary,
      Icon: AudioLines,
      ...PURPLE_ICON_STYLE,
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      value: formatPhoneDisplay(record.phone),
      valueColor: Colors.textPrimary,
      Icon: Smartphone,
      ...BLUE_ICON_STYLE,
    },
  ];
};
