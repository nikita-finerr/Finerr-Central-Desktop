import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

type Props = {
  label: string;
};

const ChatDateSeparator = ({ label }: Props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});

export default memo(ChatDateSeparator);
