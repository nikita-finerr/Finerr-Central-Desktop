import type {
  RecordingDetailsParams,
  RecordingDto,
  RecordingsListParams,
  RecordingsListResponse,
} from "../types/recording";

class RecordingsApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RecordingsApiError";
    this.status = status;
  }
}

const buildRecordingsHeaders = (apiKey: string): Record<string, string> => ({
  Accept: "application/json",
  "X-API-Key": apiKey,
});

/** Recordings API is HTTP-only; pharmacy.domainName may be https. */
export const resolveRecordingsBaseUrl = (domainName: string): string => {
  const trimmed = domainName.trim();

  try {
    const parsed = new URL(trimmed.endsWith("/") ? trimmed : `${trimmed}/`);
    return `http://${parsed.host}`;
  } catch {
    return trimmed.replace(/\/$/, "").replace(/^https:/i, "http:");
  }
};

const buildRecordingsUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, string | number>,
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

const recordingsFetch = async <T>(url: string, apiKey: string): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: buildRecordingsHeaders(apiKey),
    });
  } catch (error) {
    throw new RecordingsApiError(
      error instanceof Error ? error.message : "Network request failed",
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = (await response.json()) as { message?: string };
      if (typeof data?.message === "string" && data.message.trim()) {
        message = data.message;
      }
    } catch {
      // Response body may not be JSON.
    }

    throw new RecordingsApiError(message, response.status);
  }

  return (await response.json()) as T;
};

export const recordingsApi = {
  list: async ({
    baseUrl,
    apiKey,
    limit = 50,
    offset = 0,
    direction,
    extension,
  }: RecordingsListParams): Promise<RecordingsListResponse> => {
    const query: Record<string, string | number> = { limit, offset };

    if (direction) {
      query.direction = direction;
    }

    if (extension?.trim()) {
      query.extension = extension.trim();
    }

    return recordingsFetch<RecordingsListResponse>(
      buildRecordingsUrl(baseUrl, "/recordings-api/v1/recordings", query),
      apiKey,
    );
  },

  getById: async ({
    baseUrl,
    apiKey,
    id,
  }: RecordingDetailsParams): Promise<RecordingDto> =>
    recordingsFetch<RecordingDto>(
      buildRecordingsUrl(baseUrl, `/recordings-api/v1/recordings/${id}`),
      apiKey,
    ),
};
