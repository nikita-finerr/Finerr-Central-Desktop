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
import type { CallInfoRow } from "../data/callDetailsUtils";

type Props = {
  row: CallInfoRow;
  showSeparator: boolean;
};

const CallInformationRow = ({ row, showSeparator }: Props) => {
  const RowIcon = row.Icon;

  return (
    <View>
      <View style={styles.row}>
        <View
          style={[styles.iconWrap, { backgroundColor: row.iconBackground }]}
        >
          <RowIcon size={18} color={row.iconColor} strokeWidth={2} />
        </View>
        <Text style={styles.label}>{row.label}</Text>
        <Text style={[styles.value, { color: row.valueColor }]} numberOfLines={1}>
          {row.value}
        </Text>
      </View>
      {showSeparator ? <View style={styles.separator} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
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
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    textAlign: "right",
    flexShrink: 1,
    maxWidth: "45%",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(CallInformationRow);
