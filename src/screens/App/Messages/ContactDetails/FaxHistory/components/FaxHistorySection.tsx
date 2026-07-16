import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Spacing,
} from "../../../../../../constants";
import type { ContactFaxItemDto } from "../../../../../../types/contact";
import type { FaxHistorySection } from "../data/faxHistory";
import FaxHistoryRow from "./FaxHistoryRow";

type Props = {
  section: FaxHistorySection;
  onItemPress?: (item: ContactFaxItemDto) => void;
};

const FaxHistorySectionCard = ({ section, onItemPress }: Props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{section.label}</Text>
      <View style={styles.list}>
        {section.items.map((item) => (
          <FaxHistoryRow
            key={String(item.id)}
            item={item}
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
  list: {
    gap: Spacing.sm,
  },
});

export default memo(FaxHistorySectionCard);
