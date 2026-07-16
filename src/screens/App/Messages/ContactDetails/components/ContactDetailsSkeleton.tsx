import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../../components/common/SkeletonCard";
import { FontSizes, Radius, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

const ContactDetailsSkeleton = () => {
  return (
    <View style={styles.content}>
      <View style={styles.summaryCard}>
        <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
        <View style={styles.summaryInfo}>
          <SkeletonCard style={styles.nameLine} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.emailLine} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.phoneLine} borderRadius={Radius.sm} />
        </View>
      </View>

      <View style={styles.statsRow}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.statCard}>
            <SkeletonCard style={styles.statIcon} borderRadius={Radius.md} />
            <SkeletonCard style={styles.statValue} borderRadius={Radius.sm} />
            <SkeletonCard style={styles.statTitle} borderRadius={Radius.sm} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  summaryInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  nameLine: {
    width: "55%",
    height: FontSizes.md + 4,
  },
  emailLine: {
    width: "75%",
    height: FontSizes.sm + 2,
  },
  phoneLine: {
    width: "45%",
    height: FontSizes.sm + 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
  },
  statIcon: {
    width: 36,
    height: 36,
  },
  statValue: {
    width: 28,
    height: FontSizes.xl,
    marginTop: Spacing.xs,
  },
  statTitle: {
    width: 52,
    height: FontSizes.xs + 2,
  },
});

export default memo(ContactDetailsSkeleton);
