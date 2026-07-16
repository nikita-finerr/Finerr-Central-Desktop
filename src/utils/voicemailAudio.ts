import { File, Paths } from "expo-file-system";

import { resolveVoicemailAudioUrl } from "../api/voicemailApi";
import type { PharmacyPbxConfig } from "./pharmacyPbxConfig";

export const getVoicemailAudioRequestUrl = (
  config: PharmacyPbxConfig,
  messageId: string,
  audioPath?: string | null,
): string => {
  const resolved = resolveVoicemailAudioUrl(
    config.baseUrl,
    audioPath ?? `/voicemail-api/v1/messages/${messageId}/audio`,
  );

  if (resolved) {
    return resolved;
  }

  return `${config.baseUrl.replace(/\/$/, "")}/voicemail-api/v1/messages/${messageId}/audio`;
};

export const downloadVoicemailAudio = async (
  config: PharmacyPbxConfig,
  messageId: string,
  audioPath?: string | null,
): Promise<string> => {
  const url = getVoicemailAudioRequestUrl(config, messageId, audioPath);
  const file = new File(Paths.cache, `voicemail-${messageId}.wav`);

  if (file.exists) {
    return file.uri;
  }

  const downloaded = await File.downloadFileAsync(url, file, {
    idempotent: true,
    headers: {
      "X-API-Key": config.apiKey,
      Accept: "audio/*",
    },
  });

  return downloaded.uri;
};
