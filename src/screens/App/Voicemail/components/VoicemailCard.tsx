import { FileText, Pause, Phone, Play, Trash2 } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { NavigationProp, useNavigation } from "@react-navigation/native";
import { voicemailApi } from "../../../../api/voicemailApi";
import Avatar from "../../../../components/common/Avatar";
import {
  AppRoutes,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useVoicemailPlayback } from "../../../../hooks/useVoicemailPlayback";
import { useOutboundCall } from "../../../../providers/OutboundCallProvider";
import type { VoicemailMessageDto } from "../../../../types/voicemail";
import { getApiErrorMessage } from "../../../../utils/apiError";
import type { PharmacyPbxConfig } from "../../../../utils/pharmacyPbxConfig";
import { showErrorToast } from "../../../../utils/toast";
import {
  getVoicemailCallerName,
  getVoicemailCallerPhone,
  getVoicemailTimestamp,
  isVoicemailMessageUnread,
} from "../data/voicemailRecords";

type Props = {
  item: VoicemailMessageDto;
  pbxConfig: PharmacyPbxConfig | null;
  onDelete?: () => void;
  onMessageUpdated: (message: VoicemailMessageDto) => void;
};

const WAVE_BAR_COUNT = 48;

const WAVE_BAR_INDICES = Array.from(
  { length: WAVE_BAR_COUNT },
  (_, index) => index,
);

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getWaveBarHeight = (index: number): number => {
  const pattern = [6, 10, 14, 8, 16, 12, 18, 10, 14, 8, 20, 12, 16, 10, 14, 8];
  return pattern[index % pattern.length];
};

const VoicemailCard = ({
  item,
  pbxConfig,
  onDelete,
  onMessageUpdated,
}: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const { dial } = useOutboundCall();
  const { canManageCalls, canViewTranscript, canManageVoicemail } =
    usePermissions();
  const [isUnread, setIsUnread] = useState(isVoicemailMessageUnread(item));
  const [markingRead, setMarkingRead] = useState(false);
  const { hasAudio, isPlaying, isLoading, togglePlayback } =
    useVoicemailPlayback(item, pbxConfig);

  useEffect(() => {
    setIsUnread(isVoicemailMessageUnread(item));
  }, [item]);

  const contactName = getVoicemailCallerName(item);
  const durationLabel = formatDuration(item.duration_seconds);
  const timestamp = getVoicemailTimestamp(item);
  const showActions = canManageCalls || canViewTranscript || canManageVoicemail;

  const markAsRead = useCallback(async () => {
    if (!pbxConfig || !isVoicemailMessageUnread(item) || markingRead) {
      return;
    }

    setMarkingRead(true);
    try {
      const updated = await voicemailApi.markRead({
        ...pbxConfig,
        id: item.id,
      });
      onMessageUpdated(updated);
      setIsUnread(false);
    } catch (error) {
      showErrorToast(
        getApiErrorMessage(error, "Failed to mark voicemail read."),
      );
    } finally {
      setMarkingRead(false);
    }
  }, [item, markingRead, onMessageUpdated, pbxConfig]);

  const handleTogglePlayback = useCallback(() => {
    if (!hasAudio) {
      showErrorToast("Voicemail audio is unavailable.");
      return;
    }

    togglePlayback();
    void markAsRead();
  }, [hasAudio, markAsRead, togglePlayback]);

  const handleOpenTranscript = () => {
    void markAsRead();
    navigation.navigate(AppRoutes.VoicemailTranscript, { id: item.id });
  };

  const onCallBack = () => {
    void markAsRead();
    void dial(getVoicemailCallerPhone(item), {
      contactName: getVoicemailCallerName(item),
    });
  };

  const renderWaveBar = (index: number) => (
    <View
      key={index}
      style={[
        styles.waveBar,
        { height: getWaveBarHeight(index) },
        isPlaying && styles.waveBarActive,
      ]}
    />
  );

  return (
    <View
      style={[styles.card, isUnread && styles.cardUnread]}
      accessibilityState={{ selected: isUnread }}
    >
      <View style={styles.header}>
        <Avatar name={contactName} size={40} fontSize={FontSizes.sm} />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.name, isUnread && styles.nameUnread]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {contactName}
            </Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
            {isUnread ? <View style={styles.unreadDot} /> : null}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{durationLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playerRow}>
        <Pressable
          style={[styles.playBtn, !hasAudio && styles.playBtnDisabled]}
          onPress={handleTogglePlayback}
          disabled={!hasAudio || isLoading || markingRead}
        >
          {isLoading || markingRead ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : isPlaying ? (
            <Pause
              size={18}
              color={Colors.white}
              strokeWidth={2}
              fill={Colors.white}
            />
          ) : (
            <Play
              size={18}
              color={Colors.white}
              strokeWidth={2}
              fill={Colors.white}
              style={styles.playIcon}
            />
          )}
        </Pressable>
        <View style={styles.waveformRow}>
          {WAVE_BAR_INDICES.map(renderWaveBar)}
        </View>
      </View>

      {showActions ? (
        <View style={styles.actionsRow}>
          {canManageCalls ? (
            <Pressable style={styles.callBackBtn} onPress={onCallBack}>
              <Phone size={16} color={Colors.success} strokeWidth={2} />
              <Text style={styles.callBackText}>Call Back</Text>
            </Pressable>
          ) : null}
          {canViewTranscript ? (
            <Pressable
              style={styles.transcriptBtn}
              onPress={handleOpenTranscript}
            >
              <FileText size={16} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.transcriptText}>Transcript</Text>
            </Pressable>
          ) : null}
          {canManageVoicemail ? (
            <Pressable style={styles.deleteBtn} onPress={onDelete}>
              <Trash2 size={16} color={Colors.error} strokeWidth={2} />
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderDark,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  nameUnread: {
    fontFamily: Fonts.semiBold,
  },
  timestamp: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnDisabled: {
    opacity: 0.45,
  },
  playIcon: {
    marginLeft: 2,
  },
  waveformRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 24,
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
    backgroundColor: Colors.border,
  },
  waveBarActive: {
    backgroundColor: Colors.secondary,
  },
  waveDuration: {
    marginLeft: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  callBackBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: `${Colors.success}15`,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  callBackText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
    color: Colors.success,
  },
  transcriptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: `${Colors.primary}12`,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  transcriptText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
    color: Colors.primary,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: `${Colors.error}12`,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  deleteText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
    color: Colors.error,
  },
});

export default memo<Props>(VoicemailCard);
