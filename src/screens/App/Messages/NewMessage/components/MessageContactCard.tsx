import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "../../../../../components/common/Avatar";
import { Colors, Fonts, FontSizes, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { NewMessageContact } from "../types";

type Props = {
  item: NewMessageContact;
  addRecipient: (contact: NewMessageContact) => void;
};

const MessageContactCard = ({ item, addRecipient }: Props) => {
  return (
    <Pressable style={styles.suggestionRow} onPress={() => addRecipient(item)}>
      <Avatar name={item.contactName} size={40} />
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionName}>{item?.contactName}</Text>
        <Text style={styles.suggestionPhone}>{item?.phoneNumber}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: Spacing.md,
  },
  suggestionText: {
    flex: 1,
    gap: 2,
  },
  suggestionName: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  suggestionPhone: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});

export default memo(MessageContactCard);
