import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  type AudioPlayer,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

import type { VoicemailMessageDto } from "../types/voicemail";
import { getApiErrorMessage } from "../utils/apiError";
import type { PharmacyPbxConfig } from "../utils/pharmacyPbxConfig";
import { showErrorToast } from "../utils/toast";
import { downloadVoicemailAudio } from "../utils/voicemailAudio";

let activeVoicemailPlayer: AudioPlayer | null = null;

const pauseOtherVoicemailPlayers = (player: AudioPlayer) => {
  if (activeVoicemailPlayer && activeVoicemailPlayer !== player) {
    activeVoicemailPlayer.pause();
    void activeVoicemailPlayer.seekTo(0);
  }

  activeVoicemailPlayer = player;
};

const isPlaybackAtEnd = (status: AudioPlayer["currentStatus"]): boolean => {
  if (status.didJustFinish) {
    return true;
  }

  if (status.duration <= 0) {
    return false;
  }

  return status.currentTime >= status.duration - 0.1;
};

const waitForPlayerLoaded = async (
  player: AudioPlayer,
  timeoutMs = 5000,
): Promise<void> => {
  const startedAt = Date.now();

  while (!player.currentStatus.isLoaded) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Voicemail audio failed to load.");
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

export const useVoicemailPlayback = (
  message: VoicemailMessageDto,
  config: PharmacyPbxConfig | null,
) => {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [isPreparing, setIsPreparing] = useState(false);
  const localUriRef = useRef<string | null>(null);
  const isTogglingRef = useRef(false);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "duckOthers",
    });
  }, []);

  useEffect(() => {
    localUriRef.current = null;
    player.pause();
    void player.seekTo(0);

    return () => {
      if (activeVoicemailPlayer === player) {
        activeVoicemailPlayer = null;
      }
    };
  }, [message.id, player]);

  const ensureLocalAudio = useCallback(async (): Promise<string> => {
    if (!config) {
      throw new Error("Voicemail API is not configured.");
    }

    const uri =
      localUriRef.current ??
      (await downloadVoicemailAudio(config, message.id, message.audio_url));

    localUriRef.current = uri;

    const currentStatus = player.currentStatus;
    if (!currentStatus.isLoaded || isPlaybackAtEnd(currentStatus)) {
      player.replace({ uri });
      await waitForPlayerLoaded(player);
    }

    return uri;
  }, [config, message.audio_url, message.id, player]);

  const togglePlayback = useCallback(async () => {
    if (!config || isTogglingRef.current) {
      if (!config) {
        showErrorToast("Voicemail API is not configured.");
      }
      return;
    }

    const currentStatus = player.currentStatus;

    if (currentStatus.playing) {
      player.pause();
      return;
    }

    isTogglingRef.current = true;
    setIsPreparing(true);

    try {
      await ensureLocalAudio();

      if (isPlaybackAtEnd(player.currentStatus)) {
        await player.seekTo(0);
      }

      pauseOtherVoicemailPlayers(player);
      player.play();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Failed to play voicemail."));
    } finally {
      isTogglingRef.current = false;
      setIsPreparing(false);
    }
  }, [config, ensureLocalAudio, player]);

  const stopPlayback = useCallback(() => {
    player.pause();
    void player.seekTo(0);
  }, [player]);

  return {
    hasAudio: Boolean(config),
    isPlaying: status.playing,
    isLoading: isPreparing,
    togglePlayback,
    stopPlayback,
  };
};
