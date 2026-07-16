import { getCallRecords } from "../screens/App/Calls/data/callRecords";

export const getTabBadgeCounts = () => {
  const voiceMail = getCallRecords().filter(
    (record) => record.isVoicemail && !record.isVoicemailListened,
  ).length;

  return { voiceMail };
};
