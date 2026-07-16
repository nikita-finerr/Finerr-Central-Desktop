import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../components/common/SkeletonCard";
import {
  Colors,
  Dimensions,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const NotificationSkeletonCard = () => {
  return (
    <View style={styles.card}>
      <SkeletonCard style={styles.icon} borderRadius={Radius.md} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <SkeletonCard style={styles.title} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.timestamp} borderRadius={Radius.sm} />
        </View>
        <SkeletonCard style={styles.descriptionLine} borderRadius={Radius.sm} />
        <SkeletonCard
          style={styles.descriptionLineShort}
          borderRadius={Radius.sm}
        />
      </View>
    </View>
  );
}

const NotificationSkeletonList = () => {
  return (
    <View style={styles.container}>
      <SkeletonCard style={styles.sectionLabel} borderRadius={Radius.sm} />
      {Array.from({ length: 2 }).map((_, index) => (
        <NotificationSkeletonCard key={index} />
      ))}
      <SkeletonCard style={styles.sectionLabel} borderRadius={Radius.sm} />
      {Array.from({ length: 3 }).map((_, index) => (
        <NotificationSkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
  },
  sectionLabel: {
    width: Dimensions.width * 0.3,
    height: FontSizes.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  icon: {
    width: 44,
    height: 44,
  },
  body: {
    flex: 1,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    height: FontSizes.md,
  },
  timestamp: {
    width: 48,
    height: FontSizes.sm,
  },
  descriptionLine: {
    width: "100%",
    height: FontSizes.sm,
  },
  descriptionLineShort: {
    width: "40%",
    height: FontSizes.sm,
  },
});

export default memo(NotificationSkeletonList);
