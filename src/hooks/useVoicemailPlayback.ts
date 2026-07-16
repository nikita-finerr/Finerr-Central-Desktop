import { useCallback, useEffect, useRef, useState } from "react";
import AudioRecorderPlayer, {
  type PlayBackType,
} from "react-native-audio-recorder-player";

import type { VoicemailMessageDto } from "../types/voicemail";
import { getApiErrorMessage } from "../utils/apiError";
import type { PharmacyPbxConfig } from "../utils/pharmacyPbxConfig";
import { showErrorToast } from "../utils/toast";
import { downloadVoicemailAudio } from "../utils/voicemailAudio";

let activePlayerId: string | null = null;

const players = new Map<string, AudioRecorderPlayer>();

const pauseOtherVoicemailPlayers = async (playerId: string) => {
  if (activePlayerId && activePlayerId !== playerId) {
    const other = players.get(activePlayerId);
    if (other) {
      try {
        await other.stopPlayer();
        other.removePlayBackListener();
      } catch {
        // Ignore stop errors from inactive players.
      }
    }
  }

  activePlayerId = playerId;
};

export const useVoicemailPlayback = (
  message: VoicemailMessageDto,
  config: PharmacyPbxConfig | null,
) => {
  const playerRef = useRef(new AudioRecorderPlayer());
  const playerId = message.id;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const localUriRef = useRef<string | null>(null);
  const isTogglingRef = useRef(false);
  const durationRef = useRef(0);
  const positionRef = useRef(0);

  useEffect(() => {
    const player = playerRef.current;
    players.set(playerId, player);

    return () => {
      void (async () => {
        try {
          await player.stopPlayer();
          player.removePlayBackListener();
        } catch {
          // Ignore cleanup errors.
        }
      })();
      players.delete(playerId);
      if (activePlayerId === playerId) {
        activePlayerId = null;
      }
    };
  }, [playerId]);

  useEffect(() => {
    localUriRef.current = null;
    setIsPlaying(false);
    durationRef.current = 0;
    positionRef.current = 0;

    const player = playerRef.current;
    void (async () => {
      try {
        await player.stopPlayer();
        player.removePlayBackListener();
      } catch {
        // Ignore.
      }
    })();
  }, [message.id]);

  const ensureLocalAudio = useCallback(async (): Promise<string> => {
    if (!config) {
      throw new Error("Voicemail API is not configured.");
    }

    const uri =
      localUriRef.current ??
      (await downloadVoicemailAudio(config, message.id, message.audio_url));

    localUriRef.current = uri;
    return uri;
  }, [config, message.audio_url, message.id]);

  const togglePlayback = useCallback(async () => {
    if (!config || isTogglingRef.current) {
      if (!config) {
        showErrorToast("Voicemail API is not configured.");
      }
      return;
    }

    const player = playerRef.current;

    if (isPlaying) {
      try {
        await player.pausePlayer();
        setIsPlaying(false);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    isTogglingRef.current = true;
    setIsPreparing(true);

    try {
      const uri = await ensureLocalAudio();
      await pauseOtherVoicemailPlayers(playerId);

      const nearEnd =
        durationRef.current > 0 &&
        positionRef.current >= durationRef.current - 100;

      if (nearEnd || positionRef.current === 0) {
        player.removePlayBackListener();
        await player.startPlayer(uri);
      } else {
        await player.resumePlayer();
      }

      player.addPlayBackListener((status: PlayBackType) => {
        durationRef.current = status.duration;
        positionRef.current = status.currentPosition;
        const playing =
          status.duration <= 0 || status.currentPosition < status.duration - 50;
        setIsPlaying(playing);

        if (
          status.duration > 0 &&
          status.currentPosition >= status.duration - 50
        ) {
          setIsPlaying(false);
          positionRef.current = 0;
          void player.stopPlayer();
          player.removePlayBackListener();
        }
      });

      setIsPlaying(true);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Failed to play voicemail."));
      setIsPlaying(false);
    } finally {
      isTogglingRef.current = false;
      setIsPreparing(false);
    }
  }, [config, ensureLocalAudio, isPlaying, playerId]);

  const stopPlayback = useCallback(() => {
    const player = playerRef.current;
    void (async () => {
      try {
        await player.stopPlayer();
        player.removePlayBackListener();
      } catch {
        // Ignore.
      }
      setIsPlaying(false);
      positionRef.current = 0;
    })();
  }, []);

  return {
    hasAudio: Boolean(config),
    isPlaying,
    isLoading: isPreparing,
    togglePlayback,
    stopPlayback,
  };
};
