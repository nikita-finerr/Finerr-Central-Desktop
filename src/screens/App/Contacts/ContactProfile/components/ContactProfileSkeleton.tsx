import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { SkeletonCard } from "../../../../../components/common/SkeletonCard";
import { Colors, FontSizes, Radius, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

const INFO_ROW_COUNT = 4;

const ContactProfileSkeletonRow = ({
  showSeparator,
}: {
  showSeparator: boolean;
}) => (
  <View>
    <View style={styles.infoRow}>
      <SkeletonCard style={styles.infoIcon} borderRadius={Radius.sm} />
      <View style={styles.infoContent}>
        <SkeletonCard style={styles.infoLabel} borderRadius={Radius.sm} />
        <SkeletonCard style={styles.infoValue} borderRadius={Radius.sm} />
      </View>
      <SkeletonCard style={styles.copyBtn} borderRadius={Radius.sm} />
    </View>
    {showSeparator ? <View style={styles.infoSeparator} /> : null}
  </View>
);

const ContactProfileSkeleton = () => (
  <View style={styles.content}>
    <View style={styles.profileCard}>
      <View style={styles.profileMain}>
        <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
        <View style={styles.profileInfo}>
          <SkeletonCard style={styles.nameLine} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.detailLine} borderRadius={Radius.sm} />
          <SkeletonCard
            style={styles.detailLineShort}
            borderRadius={Radius.sm}
          />
        </View>
      </View>
    </View>

    <View style={styles.actionsRow}>
      <View style={styles.actionCard}>
        <SkeletonCard style={styles.actionIcon} borderRadius={Radius.full} />
        <SkeletonCard style={styles.actionLabel} borderRadius={Radius.sm} />
      </View>
      <View style={styles.actionCard}>
        <SkeletonCard style={styles.actionIcon} borderRadius={Radius.full} />
        <SkeletonCard style={styles.actionLabel} borderRadius={Radius.sm} />
      </View>
    </View>

    <View style={styles.infoCard}>
      <SkeletonCard style={styles.infoTitle} borderRadius={Radius.sm} />
      {Array.from({ length: INFO_ROW_COUNT }).map((_, index) => (
        <ContactProfileSkeletonRow
          key={index}
          showSeparator={index < INFO_ROW_COUNT - 1}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
  },
  profileMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  nameLine: {
    width: "60%",
    height: FontSizes.lg,
  },
  detailLine: {
    width: "75%",
    height: FontSizes.sm,
  },
  detailLineShort: {
    width: "55%",
    height: FontSizes.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
  },
  actionLabel: {
    width: 48,
    height: FontSizes.sm,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingTop: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.sm,
    overflow: "hidden",
  },
  infoTitle: {
    width: 160,
    height: FontSizes.md,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    marginBottom: Spacing.xs,
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
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    width: 72,
    height: FontSizes.xs,
  },
  infoValue: {
    width: "80%",
    height: FontSizes.sm,
  },
  copyBtn: {
    width: 36,
    height: 36,
  },
  infoSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(ContactProfileSkeleton);
