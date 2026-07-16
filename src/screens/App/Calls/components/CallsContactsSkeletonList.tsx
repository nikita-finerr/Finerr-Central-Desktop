import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../components/common/SkeletonCard";
import { Colors, FontSizes, Radius, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const SECTION_CONFIG = [
  { key: "hash", headingWidth: 12, rowCount: 2 },
  { key: "a", headingWidth: 10, rowCount: 3 },
  { key: "b", headingWidth: 10, rowCount: 4 },
  { key: "c", headingWidth: 10, rowCount: 2 },
] as const;

const CallsContactsSkeletonRow = ({
  showSeparator,
}: {
  showSeparator: boolean;
}) => (
  <View>
    <View style={styles.row}>
      <SkeletonCard style={styles.avatar} borderRadius={Radius.full} />
      <View style={styles.content}>
        <SkeletonCard style={styles.name} borderRadius={Radius.sm} />
        <SkeletonCard style={styles.phone} borderRadius={Radius.sm} />
      </View>
      <View style={styles.actions}>
        <SkeletonCard style={styles.actionBtn} borderRadius={Radius.full} />
        <SkeletonCard style={styles.actionBtn} borderRadius={Radius.full} />
      </View>
    </View>
    {showSeparator ? <View style={styles.separator} /> : null}
  </View>
);

const CallsContactsSkeletonSection = ({
  headingWidth,
  rowCount,
}: {
  headingWidth: number;
  rowCount: number;
}) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <SkeletonCard
        style={[styles.heading, { width: headingWidth }]}
        borderRadius={Radius.sm}
      />
      <SkeletonCard style={styles.chevron} borderRadius={Radius.sm} />
    </View>
    <View style={styles.card}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <CallsContactsSkeletonRow
          key={index}
          showSeparator={index < rowCount - 1}
        />
      ))}
    </View>
  </View>
);

const CallsContactsSkeletonList = () => (
  <View style={styles.container}>
    {SECTION_CONFIG.map((section, index) => (
      <View key={section.key}>
        <CallsContactsSkeletonSection
          headingWidth={section.headingWidth}
          rowCount={section.rowCount}
        />
        {index < SECTION_CONFIG.length - 1 ? (
          <View style={styles.sectionSeparator} />
        ) : null}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xs,
  },
  heading: {
    height: FontSizes.sm,
  },
  chevron: {
    width: 18,
    height: 18,
  },
  card: {
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  name: {
    width: "70%",
    height: FontSizes.md,
  },
  phone: {
    width: "45%",
    height: FontSizes.sm,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionBtn: {
    width: 40,
    height: 40,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionSeparator: {
    height: Spacing.lg,
  },
});

export default memo(CallsContactsSkeletonList);
