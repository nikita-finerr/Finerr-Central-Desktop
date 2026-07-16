import { Pause, Play, Voicemail } from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../../constants";
import { globalStyleDefinitions } from "../../../../../../constants/globalStyleDefinitions";
import type { ContactVoicemailItemDto } from "../../../../../../types/contact";
import {
  getVoicemailDirectionLabel,
  getVoicemailDurationLabel,
  getVoicemailTimeLabel,
} from "../data/voicemailHistory";

type Props = {
  item: ContactVoicemailItemDto;
  showSeparator: boolean;
  onPress: (item: ContactVoicemailItemDto) => void;
};

const VoicemailHistoryRow = ({ item, showSeparator, onPress }: Props) => {
  const [playing, setPlaying] = useState(false);
  const durationLabel = getVoicemailDurationLabel(item);
  const timeLabel = getVoicemailTimeLabel(item.receivedAt);
  const title = getVoicemailDirectionLabel(item.direction);
  const isUnread = !item.isRead;

  const handlePlayPress = () => {
    setPlaying((current) => !current);
  };

  return (
    <View>
      <View style={styles.row}>
        <Pressable style={styles.main} onPress={() => onPress(item)}>
          <View style={styles.iconWrap}>
            <Voicemail size={18} color={Colors.primary} strokeWidth={2} />
          </View>

          <View style={styles.content}>
            <Text
              style={[styles.title, isUnread && styles.titleUnread]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {durationLabel
                ? `${timeLabel} · ${durationLabel}`
                : timeLabel}
            </Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.playBtn} onPress={handlePlayPress}>
            {playing ? (
              <Pause size={14} color={Colors.primary} strokeWidth={2} />
            ) : (
              <Play
                size={14}
                color={Colors.primary}
                strokeWidth={2}
                fill={Colors.transparent}
              />
            )}
          </Pressable>
          {durationLabel ? (
            <Text style={styles.duration}>{durationLabel}</Text>
          ) : null}
        </View>
      </View>

      {showSeparator ? <View style={styles.separator} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${Colors.primary}14`,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  titleUnread: {
    fontFamily: Fonts.bold,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${Colors.primary}14`,
  },
  duration: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    minWidth: 36,
    textAlign: "right",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(VoicemailHistoryRow);
