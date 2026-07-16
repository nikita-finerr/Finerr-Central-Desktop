import { CONTACT_DEMO_STATS } from "../../../../../mockData/contact";
import { TimelineItem } from "../../../../../mockData/MessagesContact";

export type ContactStats = {
  calls: number;
  voicemails: number;
  faxes: number;
};

export const getContactStats = (
  id: string,
  timeline: TimelineItem[],
): ContactStats => {
  if (CONTACT_DEMO_STATS[id]) return CONTACT_DEMO_STATS[id];

  return {
    calls: timeline.filter((item) => item.type === "Call").length,
    voicemails: timeline.filter((item) => item.type === "Voicemail").length,
    faxes: timeline.filter((item) => item.type === "Fax").length,
  };
};
