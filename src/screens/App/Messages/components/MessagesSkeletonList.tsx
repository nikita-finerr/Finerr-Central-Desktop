import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../components/common/SkeletonCard";
import { Colors, FontSizes, Radius, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const SKELETON_COUNT = 15;

const MessagesSkeletonRow = () => {
  return (
    <View style={styles.row}>
      <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <SkeletonCard style={styles.contactName} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.timestamp} borderRadius={Radius.sm} />
        </View>
        <View style={styles.infoContainer}>
          <SkeletonCard style={styles.preview} borderRadius={Radius.sm} />
        </View>
      </View>
    </View>
  );
};

const MessagesSkeletonList = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View key={index}>
          <MessagesSkeletonRow />
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
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  contentContainer: {
    flex: 1,
    gap: Spacing.sm,
  },
  infoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  contactName: {
    flex: 0.8,
    height: FontSizes.lg,
  },
  timestamp: {
    width: 48,
    height: FontSizes.sm,
  },
  preview: {
    flex: 1,
    height: FontSizes.sm,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    width: "100%",
  },
});

export default memo(MessagesSkeletonList);
