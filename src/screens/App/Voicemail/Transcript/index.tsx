import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Copy, FileText } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";

import {
  normalizeVoicemailTranscriptResponse,
  voicemailApi,
} from "../../../../api/voicemailApi";
import Avatar from "../../../../components/common/Avatar";
import Header from "../../../../components/common/Header/Header";
import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
  Typography,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import type { RootState } from "../../../../redux/store";
import type {
  VoicemailMessageDto,
  VoicemailTranscriptDto,
} from "../../../../types/voicemail";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { copyToClipboard } from "../../../../utils/clipboard";
import {
  getPharmacyPbxConfig,
  type PharmacyPbxConfig,
} from "../../../../utils/pharmacyPbxConfig";
import {
  getVoicemailCallerName,
  getVoicemailDisplayTranscript,
  getVoicemailTimestamp,
} from "../data/voicemailRecords";

type RouteParams = {
  VoicemailTranscript: { id: string };
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VoicemailTranscriptScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "VoicemailTranscript">>();
  const pharmacy = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy,
  );
  const pbxConfig = useMemo(
    () => getPharmacyPbxConfig(pharmacy),
    [pharmacy],
  ) as PharmacyPbxConfig | null;

  const [message, setMessage] = useState<VoicemailMessageDto | null>(null);
  const [transcript, setTranscript] = useState<VoicemailTranscriptDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const voicemailId = route.params?.id ?? "";

  useEffect(() => {
    if (!voicemailId) {
      setLoading(false);
      setError("Voicemail not found.");
      return;
    }

    if (!pbxConfig) {
      setLoading(false);
      setError("Voicemail API is not configured for this pharmacy.");
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const [nextMessage, nextTranscript] = await Promise.all([
          voicemailApi.getById({ ...pbxConfig, id: voicemailId }),
          voicemailApi.getTranscript({
            ...pbxConfig,
            id: voicemailId,
          }),
        ]);
        if (cancelled) {
          return;
        }

        setMessage(nextMessage);
        setTranscript(
          nextTranscript ??
            normalizeVoicemailTranscriptResponse(nextMessage) ??
            nextMessage.transcript ??
            null,
        );

        if (nextMessage.is_new || !nextMessage.read_at) {
          try {
            const updated = await voicemailApi.markRead({
              ...pbxConfig,
              id: voicemailId,
            });
            if (!cancelled) {
              setMessage(updated);
            }
          } catch {
            // Non-blocking if read sync fails.
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load voicemail."));
          setMessage(null);
          setTranscript(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pbxConfig, voicemailId]);

  const transcriptText = useMemo(
    () => (message ? getVoicemailDisplayTranscript(message, transcript) : ""),
    [message, transcript],
  );

  const hasTranscript = transcriptText.trim().length > 0;

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCopy = useCallback(async () => {
    if (!transcriptText) {
      return;
    }

    await copyToClipboard(transcriptText, "Transcript copied to clipboard");
  }, [transcriptText]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Header title="Transcript" showBack onBackPress={handleBackPress} />
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!message) {
    return (
      <View style={styles.root}>
        <Header title="Transcript" showBack onBackPress={handleBackPress} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {error ?? "Voicemail not found."}
          </Text>
        </View>
      </View>
    );
  }

  const contactName = getVoicemailCallerName(message);
  const durationLabel = formatDuration(message.duration_seconds);
  const timestamp = getVoicemailTimestamp(message);
  const previewTranscript = transcriptText;

  return (
    <View style={styles.root}>
      <Header title="Transcript" showBack onBackPress={handleBackPress} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Avatar name={contactName} size={56} fontSize={FontSizes.lg} />
          <Text style={styles.name}>{contactName}</Text>
          <Text style={styles.meta}>
            {timestamp} · {durationLabel}
          </Text>
        </View>

        <View style={styles.transcriptCard}>
          <View style={styles.transcriptHeader}>
            <View style={styles.transcriptTitleRow}>
              <FileText
                size={FontSizes.lg}
                color={Colors.primary}
                strokeWidth={2}
              />
              <Text style={styles.transcriptTitle}>Transcript</Text>
            </View>
            {hasTranscript ? (
              <Pressable onPress={handleCopy} hitSlop={Spacing.sm}>
                <Copy
                  size={FontSizes.lg}
                  color={Colors.textSecondary}
                  strokeWidth={2}
                />
              </Pressable>
            ) : null}
          </View>

          {hasTranscript ? (
            <Text style={styles.transcriptText}>{previewTranscript}</Text>
          ) : (
            <View style={styles.emptyTranscript}>
              <Text style={styles.emptyTranscriptText}>
                No transcript is available for this voicemail yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  hero: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  name: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  roleBadge: {
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  roleBadgeText: {
    ...Typography.caption,
    fontFamily: Fonts.semiBold,
  },
  meta: {
    ...Typography.body,
    color: Colors.textLight,
  },
  transcriptCard: {
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
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  transcriptTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  transcriptTitle: {
    ...Typography.body,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  transcriptText: {
    ...Typography.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: FontSizes.md * 1.5,
  },
  emptyTranscript: {
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  emptyTranscriptText: {
    ...Typography.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: FontSizes.md * 1.5,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.white,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
  },
  emptyText: {
    ...Typography.body,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

export default VoicemailTranscriptScreen;
