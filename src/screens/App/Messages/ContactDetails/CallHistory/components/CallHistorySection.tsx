import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../../constants";
import type { ContactCallItemDto } from "../../../../../../types/contact";
import type { CallHistorySection } from "../data/callHistory";
import CallHistoryRow from "./CallHistoryRow";

type Props = {
  section: CallHistorySection;
  onItemPress: (item: ContactCallItemDto) => void;
};

const CallHistorySectionCard = ({ section, onItemPress }: Props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{section.label}</Text>
      <View style={styles.card}>
        {section.items.map((item, index) => (
          <CallHistoryRow
            key={String(item.id)}
            item={item}
            showSeparator={index < section.items.length - 1}
            onPress={onItemPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  heading: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
});

export default memo(CallHistorySectionCard);
