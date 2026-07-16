import { resolveRecordingsBaseUrl } from "./recordingsApi";
import type {
  VoicemailMessageActionParams,
  VoicemailMessageDto,
  VoicemailMessagesListParams,
  VoicemailMessagesListResponse,
  VoicemailTranscriptDto,
} from "../types/voicemail";

class VoicemailApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "VoicemailApiError";
    this.status = status;
  }
}

const buildVoicemailHeaders = (
  apiKey: string,
  accept = "application/json",
): Record<string, string> => ({
  Accept: accept,
  "X-API-Key": apiKey,
});

const buildVoicemailUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean>,
): string => {
  const resolvedBase = resolveRecordingsBaseUrl(baseUrl);
  const url = `${resolvedBase}${path.startsWith("/") ? path : `/${path}`}`;

  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `${url}?${query}` : url;
};

export const resolveVoicemailAudioUrl = (
  baseUrl: string,
  audioPath?: string | null,
): string | null => {
  if (!audioPath?.trim()) {
    return null;
  }

  const trimmed = audioPath.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `${resolveRecordingsBaseUrl(baseUrl)}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  let message = `Request failed with status ${response.status}`;

  try {
    const data = (await response.json()) as {
      message?: string;
      detail?: string;
    };
    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
  } catch {
    // Response body may not be JSON.
  }

  return message;
};

const isApiDetailResponse = (data: unknown): data is { detail: string } => {
  return (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof (data as { detail?: unknown }).detail === "string"
  );
};

export const normalizeVoicemailTranscriptResponse = (
  data: unknown,
): VoicemailTranscriptDto | null => {
  if (!data || isApiDetailResponse(data)) {
    return null;
  }

  if (typeof data === "object" && "transcript" in data) {
    const nested = (data as VoicemailMessageDto).transcript;
    if (nested && (nested.text?.trim() || nested.segments?.length)) {
      return nested;
    }
  }

  if (
    typeof data === "object" &&
    ("text" in data || "segments" in data || "id" in data)
  ) {
    const candidate = data as VoicemailTranscriptDto;
    if (candidate.text?.trim() || candidate.segments?.length) {
      return candidate;
    }
  }

  return null;
};

const voicemailRequest = async <T>(
  url: string,
  apiKey: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    accept?: string;
    parseJson?: boolean;
  } = {},
): Promise<T> => {
  const {
    method = "GET",
    accept = "application/json",
    parseJson = true,
  } = options;

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: buildVoicemailHeaders(apiKey, accept),
    });
  } catch (error) {
    throw new VoicemailApiError(
      error instanceof Error ? error.message : "Network request failed",
    );
  }

  if (!response.ok) {
    throw new VoicemailApiError(
      await parseErrorMessage(response),
      response.status,
    );
  }

  if (!parseJson || response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const voicemailApi = {
  list: async ({
    baseUrl,
    apiKey,
    limit = 50,
    offset = 0,
    includeDeleted = false,
    extension,
  }: VoicemailMessagesListParams): Promise<VoicemailMessagesListResponse> => {
    const query: Record<string, string | number | boolean> = {
      limit,
      offset,
      include_deleted: includeDeleted,
    };

    if (extension?.trim()) {
      query.extension = extension.trim();
    }

    return voicemailRequest<VoicemailMessagesListResponse>(
      buildVoicemailUrl(baseUrl, "/voicemail-api/v1/messages", query),
      apiKey,
    );
  },

  getById: async ({
    baseUrl,
    apiKey,
    id,
  }: VoicemailMessageActionParams): Promise<VoicemailMessageDto> =>
    voicemailRequest<VoicemailMessageDto>(
      buildVoicemailUrl(baseUrl, `/voicemail-api/v1/messages/${id}`),
      apiKey,
    ),

  delete: async ({
    baseUrl,
    apiKey,
    id,
  }: VoicemailMessageActionParams): Promise<void> => {
    await voicemailRequest<void>(
      buildVoicemailUrl(baseUrl, `/voicemail-api/v1/messages/${id}`),
      apiKey,
      { method: "DELETE", parseJson: false },
    );
  },

  markRead: async ({
    baseUrl,
    apiKey,
    id,
  }: VoicemailMessageActionParams): Promise<VoicemailMessageDto> =>
    voicemailRequest<VoicemailMessageDto>(
      buildVoicemailUrl(baseUrl, `/voicemail-api/v1/messages/${id}/read`),
      apiKey,
      { method: "PATCH" },
    ),

  markSaved: async ({
    baseUrl,
    apiKey,
    id,
  }: VoicemailMessageActionParams): Promise<VoicemailMessageDto> =>
    voicemailRequest<VoicemailMessageDto>(
      buildVoicemailUrl(baseUrl, `/voicemail-api/v1/messages/${id}/saved`),
      apiKey,
      { method: "PATCH" },
    ),

  getTranscript: async ({
    baseUrl,
    apiKey,
    id,
  }: VoicemailMessageActionParams): Promise<VoicemailTranscriptDto | null> => {
    try {
      const data = await voicemailRequest<unknown>(
        buildVoicemailUrl(
          baseUrl,
          `/voicemail-api/v1/messages/${id}/transcript?generate=true`,
        ),
        apiKey,
      );

      return normalizeVoicemailTranscriptResponse(data);
    } catch (error) {
      if (error instanceof VoicemailApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  },
};
