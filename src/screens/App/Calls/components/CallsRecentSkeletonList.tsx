import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../components/common/SkeletonCard";
import { Colors, FontSizes, Radius, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const SKELETON_COUNT = 10;

const CallsRecentSkeletonRow = () => (
  <View style={styles.row}>
    <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <SkeletonCard style={styles.name} borderRadius={Radius.sm} />
        <SkeletonCard style={styles.timestamp} borderRadius={Radius.sm} />
      </View>
      <View style={styles.statusRow}>
        <SkeletonCard style={styles.statusIcon} borderRadius={Radius.sm} />
        <SkeletonCard style={styles.statusLabel} borderRadius={Radius.sm} />
      </View>
    </View>
  </View>
);

const CallsRecentSkeletonList = () => (
  <View style={styles.container}>
    {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
      <View key={index}>
        <CallsRecentSkeletonRow />
        {index < SKELETON_COUNT - 1 ? (
          <View style={styles.separator} />
        ) : null}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
  },
  avatar: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    height: FontSizes.md,
  },
  timestamp: {
    width: 52,
    height: FontSizes.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statusIcon: {
    width: 14,
    height: 14,
  },
  statusLabel: {
    width: 120,
    height: FontSizes.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    width: "100%",
  },
});

export default memo(CallsRecentSkeletonList);
