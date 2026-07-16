import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "../../../../../components/common/Avatar";
import { Colors, Fonts, FontSizes, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { TelnyxFaxNumberDto } from "../../../../../types/fax";
import { formatPhoneDisplay } from "../../../../../utils/formatPhoneNumber";
import {
  getTelnyxFaxContactLabel,
  getTelnyxFaxContactNumber,
} from "../data/telnyxFaxContacts";

type Props = {
  item: TelnyxFaxNumberDto;
  onSelect: (contact: TelnyxFaxNumberDto) => void;
};

const FaxContactSuggestion = ({ item, onSelect }: Props) => {
  const label = getTelnyxFaxContactLabel(item);
  const phoneNumber = getTelnyxFaxContactNumber(item);

  return (
    <Pressable
      style={styles.row}
      onPress={() => onSelect(item)}
      accessibilityRole="button"
      accessibilityLabel={`Select ${label}`}
    >
      <Avatar name={label} size={40} />
      <View style={styles.copy}>
        <Text style={styles.name}>{label}</Text>
        <Text style={styles.phone}>{formatPhoneDisplay(phoneNumber)}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: Spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  phone: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});

export default memo(FaxContactSuggestion);
