export type VoicemailMessageStatus = "new" | "saved" | string;

export type VoicemailTranscriptSegment = {
  start?: number | null;
  end?: number | null;
  text?: string | null;
};

export type VoicemailTranscriptDto = {
  text?: string | null;
  segments?: VoicemailTranscriptSegment[] | null;
  language?: string | null;
};

export type VoicemailMessageDto = {
  id: string;
  mailbox_id: string;
  extension: string;
  domain: string;
  caller_id_name?: string | null;
  caller_id_number?: string | null;
  duration_seconds: number;
  created_at: string;
  read_at?: string | null;
  status: VoicemailMessageStatus;
  is_new: boolean;
  priority?: string | null;
  has_transcript?: boolean;
  transcript?: VoicemailTranscriptDto | null;
  transcription?: string | null;
  audio_url?: string | null;
};

export type VoicemailMessagesListResponse = {
  total: number;
  limit: number;
  offset: number;
  messages: VoicemailMessageDto[];
};

export type VoicemailApiBaseParams = {
  baseUrl: string;
  apiKey: string;
};

export type VoicemailMessagesListParams = VoicemailApiBaseParams & {
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
  extension?: string;
};

export type VoicemailMessageActionParams = VoicemailApiBaseParams & {
  id: string;
  generate?: boolean;
};
