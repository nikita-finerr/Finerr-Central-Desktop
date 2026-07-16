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

const CallHistorySkeletonRow = ({
  showSeparator,
}: {
  showSeparator: boolean;
}) => {
  return (
    <View>
      <View style={styles.row}>
        <SkeletonCard style={styles.icon} borderRadius={Radius.md} />
        <View style={styles.content}>
          <SkeletonCard style={styles.title} borderRadius={Radius.sm} />
          <SkeletonCard style={styles.subtitle} borderRadius={Radius.sm} />
        </View>
      </View>
      {showSeparator ? <View style={styles.separator} /> : null}
    </View>
  );
};

const CallHistorySkeletonSection = ({ rowCount }: { rowCount: number }) => {
  return (
    <View style={styles.section}>
      <SkeletonCard style={styles.heading} borderRadius={Radius.sm} />
      <View style={styles.card}>
        {Array.from({ length: rowCount }).map((_, index) => (
          <CallHistorySkeletonRow
            key={index}
            showSeparator={index < rowCount - 1}
          />
        ))}
      </View>
    </View>
  );
};

const CallHistorySkeletonList = () => {
  return (
    <View style={styles.container}>
      <CallHistorySkeletonSection rowCount={3} />
      <CallHistorySkeletonSection rowCount={2} />
      <CallHistorySkeletonSection rowCount={4} />
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
    borderWidth: 1,
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
  icon: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    width: "55%",
    height: FontSizes.sm + 2,
  },
  subtitle: {
    width: "40%",
    height: FontSizes.xs + 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(CallHistorySkeletonList);
