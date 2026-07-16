import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../../components/common/SkeletonCard";
import { Colors, Radius, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

const INFO_ROW_COUNT = 6;

const CallDetailsInfoSkeletonRow = ({
  showSeparator,
}: {
  showSeparator: boolean;
}) => (
  <View>
    <View style={styles.infoRow}>
      <SkeletonCard style={styles.infoIcon} borderRadius={Radius.sm} />
      <SkeletonCard style={styles.infoLabel} borderRadius={Radius.sm} />
      <SkeletonCard style={styles.infoValue} borderRadius={Radius.sm} />
    </View>
    {showSeparator ? <View style={styles.infoSeparator} /> : null}
  </View>
);

const CallDetailsSkeleton = () => (
  <View style={styles.root}>
    <View style={styles.header}>
      <View style={styles.headerMain}>
        <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
        <View style={styles.headerContent}>
          <SkeletonCard style={styles.nameLine} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.phoneLine} borderRadius={Radius.sm} />
        </View>
      </View>
      <SkeletonCard style={styles.actionBtn} borderRadius={Radius.full} />
    </View>

    <View style={styles.content}>
      <View style={styles.infoCard}>
        <SkeletonCard style={styles.infoTitle} borderRadius={Radius.sm} />
        {Array.from({ length: INFO_ROW_COUNT }).map((_, index) => (
          <CallDetailsInfoSkeletonRow
            key={index}
            showSeparator={index < INFO_ROW_COUNT - 1}
          />
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
  },
  headerMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minWidth: 0,
  },
  headerContent: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  avatar: {
    width: 56,
    height: 56,
  },
  nameLine: {
    width: "62%",
    height: 22,
  },
  roleBadge: {
    width: 72,
    height: 20,
  },
  phoneLine: {
    width: "48%",
    height: 16,
  },
  actionBtn: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingTop: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  infoTitle: {
    width: 140,
    height: 18,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  infoIcon: {
    width: 36,
    height: 36,
  },
  infoLabel: {
    flex: 1,
    height: 16,
    maxWidth: 120,
  },
  infoValue: {
    width: 88,
    height: 16,
  },
  infoSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(CallDetailsSkeleton);
