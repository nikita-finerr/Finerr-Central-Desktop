export type RecordingDirection = "inbound" | "outbound" | "local" | null;

export type RecordingTranscriptSegment = {
  start: number;
  end: number;
  text: string;
  channel?: string | null;
  speaker?: string | null;
};

export type RecordingTranscript = {
  summary?: string | null;
  text?: string | null;
  segments?: RecordingTranscriptSegment[] | null;
};

export type RecordingDto = {
  id: string;
  caller_id_name?: string | null;
  caller_id_number?: string | null;
  destination_number?: string | null;
  caller_destination?: string | null;
  direction?: RecordingDirection;
  date: string;
  duration_seconds: number;
  filename?: string | null;
  audio_url?: string | null;
  transcript?: RecordingTranscript | null;
};

export type RecordingsListResponse = {
  total: number;
  limit: number;
  offset: number;
  recordings: RecordingDto[];
};

export type RecordingsListParams = {
  baseUrl: string;
  apiKey: string;
  limit?: number;
  offset?: number;
  direction?: RecordingDirection;
  extension?: string;
};

export type RecordingDetailsParams = {
  baseUrl: string;
  apiKey: string;
  id: string;
};
