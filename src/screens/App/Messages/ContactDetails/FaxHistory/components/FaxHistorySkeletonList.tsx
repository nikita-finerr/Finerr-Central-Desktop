import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../../../components/common/SkeletonCard";
import {
  Colors,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../../constants";
import { globalStyleDefinitions } from "../../../../../../constants/globalStyleDefinitions";

const FaxHistorySkeletonRow = () => {
  return (
    <View style={styles.card}>
      <View style={styles.thumbnail}>
        <SkeletonCard style={styles.thumbnailIcon} borderRadius={Radius.sm} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <SkeletonCard style={styles.fileName} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.statusBadge} borderRadius={Radius.sm} />
        </View>
        <View style={styles.bottomRow}>
          <SkeletonCard style={styles.meta} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.actionBtn} borderRadius={Radius.full} />
        </View>
      </View>
    </View>
  );
};

const FaxHistorySkeletonSection = ({ rowCount }: { rowCount: number }) => {
  return (
    <View style={styles.section}>
      <SkeletonCard style={styles.heading} borderRadius={Radius.sm} />
      <View style={styles.list}>
        {Array.from({ length: rowCount }).map((_, index) => (
          <FaxHistorySkeletonRow key={index} />
        ))}
      </View>
    </View>
  );
};

const FaxHistorySkeletonList = () => {
  return (
    <View style={styles.container}>
      <FaxHistorySkeletonSection rowCount={2} />
      <FaxHistorySkeletonSection rowCount={3} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.lg,
  },
  searchBar: {
    height: 44,
    marginBottom: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },
  heading: {
    width: 72,
    height: FontSizes.sm,
    marginHorizontal: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
  },
  card: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
  },
  thumbnail: {
    width: 52,
    height: 64,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  thumbnailIcon: {
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  fileName: {
    flex: 1,
    height: FontSizes.sm + 2,
  },
  statusBadge: {
    width: 56,
    height: FontSizes.sm + 6,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    width: 72,
    height: FontSizes.xs + 2,
  },
  actionBtn: {
    width: 32,
    height: 32,
  },
});

export default memo(FaxHistorySkeletonList);
