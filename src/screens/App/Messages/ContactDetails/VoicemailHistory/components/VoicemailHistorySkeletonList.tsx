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

const VoicemailHistorySkeletonRow = ({
  showSeparator,
}: {
  showSeparator: boolean;
}) => {
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.main}>
          <SkeletonCard style={styles.icon} borderRadius={Radius.sm} />
          <View style={styles.content}>
            <SkeletonCard style={styles.title} borderRadius={Radius.sm} />
            <SkeletonCard style={styles.meta} borderRadius={Radius.sm} />
          </View>
        </View>
        <View style={styles.actions}>
          <SkeletonCard style={styles.playBtn} borderRadius={Radius.full} />
          <SkeletonCard style={styles.duration} borderRadius={Radius.sm} />
        </View>
      </View>
      {showSeparator ? <View style={styles.separator} /> : null}
    </View>
  );
};

const VoicemailHistorySkeletonSection = ({
  rowCount,
}: {
  rowCount: number;
}) => {
  return (
    <View style={styles.section}>
      <SkeletonCard style={styles.heading} borderRadius={Radius.sm} />
      <View style={styles.card}>
        {Array.from({ length: rowCount }).map((_, index) => (
          <VoicemailHistorySkeletonRow
            key={index}
            showSeparator={index < rowCount - 1}
          />
        ))}
      </View>
    </View>
  );
};

const VoicemailHistorySkeletonList = () => {
  return (
    <View style={styles.container}>
      <VoicemailHistorySkeletonSection rowCount={3} />
      <VoicemailHistorySkeletonSection rowCount={2} />
      <VoicemailHistorySkeletonSection rowCount={4} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  heading: {
    width: 72,
    height: FontSizes.sm,
    marginHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    width: "60%",
    height: FontSizes.sm + 2,
  },
  meta: {
    width: "45%",
    height: FontSizes.xs + 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  playBtn: {
    width: 32,
    height: 32,
  },
  duration: {
    width: 36,
    height: FontSizes.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(VoicemailHistorySkeletonList);
