import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { SkeletonCard } from "../../../../../components/common/SkeletonCard";
import { Colors, Dimensions, Radius, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

type BubbleConfig = {
  align: "inbound" | "outbound";
  width: number;
  height: number;
};

const SKELETON_BUBBLES: BubbleConfig[] = [
  { align: "inbound", width: 0.62, height: 52 },
  { align: "outbound", width: 0.48, height: 40 },
  { align: "inbound", width: 0.72, height: 64 },
  { align: "outbound", width: 0.55, height: 48 },
  { align: "inbound", width: 0.44, height: 44 },
  { align: "outbound", width: 0.68, height: 100 },
  { align: "inbound", width: 0.58, height: 48 },
];

const ChatSkeletonBubble = ({ align, width, height }: BubbleConfig) => {
  const bubbleWidth = Dimensions.width * width;

  return (
    <View
      style={[
        styles.bubbleRow,
        align === "outbound" ? styles.outboundRow : styles.inboundRow,
      ]}
    >
      <SkeletonCard
        style={{ width: bubbleWidth, height }}
        borderRadius={Radius.lg}
      />
      <SkeletonCard style={styles.time} borderRadius={Radius.sm} />
    </View>
  );
};

const ChatSkeletonList = () => {
  return (
    <View style={styles.container}>
      <SkeletonCard style={styles.dateSeparator} borderRadius={Radius.full} />
      {SKELETON_BUBBLES.map((bubble, index) => (
        <ChatSkeletonBubble key={index} {...bubble} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  dateSeparator: {
    alignSelf: "center",
    width: 96,
    height: 24,
    marginBottom: Spacing.xs,
  },
  bubbleRow: {
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    maxWidth: Dimensions.width * 0.75,
  },
  inboundRow: {
    alignSelf: "flex-start",
  },
  outboundRow: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  time: {
    width: 44,
    height: 10,
  },
});

export default memo(ChatSkeletonList);
