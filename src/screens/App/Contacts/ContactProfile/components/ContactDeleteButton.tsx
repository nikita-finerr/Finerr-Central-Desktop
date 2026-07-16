import { ChevronRight, Trash2 } from "lucide-react-native";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

type Props = {
  onPress: () => void;
};

const ContactDeleteButton = ({ onPress }: Props) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <Pressable
      style={styles.card}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Delete contact"
    >
      <View style={styles.separator} />
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Trash2 size={18} color={Colors.error} strokeWidth={2} />
        </View>
        <Text style={styles.label}>Delete Contact</Text>
        <ChevronRight size={20} color={Colors.textLight} strokeWidth={2} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: `${Colors.error}14`,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
});

export default memo(ContactDeleteButton);
