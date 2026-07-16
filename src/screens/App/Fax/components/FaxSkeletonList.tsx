import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../components/common/SkeletonCard";
import { Colors, FontSizes, Radius, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const SKELETON_COUNT = 8;

const FaxSkeletonRow = () => {
  return (
    <View style={styles.row}>
      <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <SkeletonCard style={styles.contactName} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.timestamp} borderRadius={Radius.sm} />
        </View>
        <View style={styles.infoContainer}>
          <SkeletonCard style={styles.documentName} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.statusBadge} borderRadius={Radius.md} />
        </View>
        <View style={styles.infoContainer}>
          <SkeletonCard style={styles.metaLine} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.actionIcon} borderRadius={Radius.full} />
        </View>
      </View>
    </View>
  );
};

const FaxSkeletonList = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View key={index}>
          <FaxSkeletonRow />
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
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1.5 * globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    gap: Spacing.xxl,
  },
  infoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  contactName: {
    flex: 0.7,
    height: FontSizes.md + 5,
  },
  timestamp: {
    width: 48,
    height: FontSizes.sm,
  },
  documentName: {
    flex: 1,
    height: FontSizes.sm + 5,
  },
  statusBadge: {
    width: 72,
    height: FontSizes.sm + 5,
  },
  metaLine: {
    flex: 1,
    height: FontSizes.sm + 5,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    width: "100%",
  },
});

export default memo(FaxSkeletonList);
