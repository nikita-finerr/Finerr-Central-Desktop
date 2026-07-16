import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../components/common/SkeletonCard";
import { Colors, FontSizes, Radius, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const SKELETON_COUNT = 6;

const VoicemailSkeletonRow = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <SkeletonCard style={styles.name} borderRadius={Radius.sm} />
            <SkeletonCard style={styles.timestamp} borderRadius={Radius.sm} />
          </View>
          <SkeletonCard style={styles.duration} borderRadius={Radius.sm} />
        </View>
      </View>

      <View style={styles.playerRow}>
        <SkeletonCard style={styles.playBtn} borderRadius={Radius.full} />
        <SkeletonCard style={styles.waveform} borderRadius={Radius.sm} />
      </View>

      <View style={styles.actionsRow}>
        <SkeletonCard style={styles.actionBtn} borderRadius={Radius.md} />
        <SkeletonCard style={styles.actionBtn} borderRadius={Radius.md} />
        <SkeletonCard style={styles.actionBtn} borderRadius={Radius.md} />
      </View>
    </View>
  );
};

const VoicemailSkeletonList = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View key={index}>
          <VoicemailSkeletonRow />
          {index < SKELETON_COUNT - 1 ? (
            <View style={styles.itemSeparator} />
          ) : null}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: 120,
  },
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  name: {
    flex: 1,
    height: FontSizes.md + 4,
  },
  timestamp: {
    width: 52,
    height: FontSizes.xs + 4,
  },
  duration: {
    width: 40,
    height: FontSizes.sm + 2,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  playBtn: {
    width: 40,
    height: 40,
  },
  waveform: {
    flex: 1,
    height: 24,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 36,
  },
  itemSeparator: {
    height: Spacing.md,
  },
});

export default memo(VoicemailSkeletonList);
