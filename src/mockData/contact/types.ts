import type { CallDirection } from "../../screens/App/Calls/data/callRecords";
import type {
  FaxDirection,
  FaxStatus,
} from "../../screens/App/Messages/data/faxRecords";

export type ContactStats = {
  calls: number;
  voicemails: number;
  faxes: number;
};

export type CallHistorySeed = {
  id: string;
  conversationId: string;
  direction: CallDirection;
  timestamp: string;
  sortKey: number;
  durationSeconds: number;
  isMissed?: boolean;
};

export type VoicemailHistorySeed = {
  id: string;
  conversationId: string;
  direction: CallDirection;
  timestamp: string;
  sortKey: number;
  durationSeconds: number;
  isVoicemailListened?: boolean;
};

export type FaxHistorySeed = {
  id: string;
  conversationId: string;
  direction: FaxDirection;
  status: FaxStatus;
  documentName: string;
  pageCount: number;
  fileSizeBytes: number;
  timestamp: string;
  sortKey: number;
  coverNote?: string;
};
