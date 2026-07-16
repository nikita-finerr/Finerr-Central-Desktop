import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../../constants";
import type { ContactVoicemailItemDto } from "../../../../../../types/contact";
import type { VoicemailHistorySection as Section } from "../data/voicemailHistory";
import VoicemailHistoryRow from "./VoicemailHistoryRow";

type Props = {
  section: Section;
  onItemPress: (item: ContactVoicemailItemDto) => void;
};

const VoicemailHistorySection = ({ section, onItemPress }: Props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{section.label}</Text>
      <View style={styles.card}>
        {section.items.map((item, index) => (
          <VoicemailHistoryRow
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: "hidden",
  },
});

export default memo(VoicemailHistorySection);
