import ReactNativeBlobUtil from "react-native-blob-util";

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
  const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/voicemail-${messageId}.wav`;

  const exists = await ReactNativeBlobUtil.fs.exists(path);
  if (exists) {
    return PlatformPathToUri(path);
  }

  const result = await ReactNativeBlobUtil.config({
    path,
    fileCache: true,
  }).fetch("GET", url, {
    "X-API-Key": config.apiKey,
    Accept: "audio/*",
  });

  return PlatformPathToUri(result.path());
};

const PlatformPathToUri = (path: string): string => {
  if (path.startsWith("file://")) {
    return path;
  }
  return `file://${path}`;
};
