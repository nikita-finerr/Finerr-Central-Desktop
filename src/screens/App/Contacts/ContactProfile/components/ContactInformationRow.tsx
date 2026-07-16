import { Copy } from "lucide-react-native";
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
import { copyToClipboard } from "../../../../../utils/clipboard";
import type { ContactInfoRow } from "../data/contactProfileUtils";

type Props = {
  row: ContactInfoRow;
  showSeparator: boolean;
};

const ContactInformationRow = ({ row, showSeparator }: Props) => {
  const RowIcon = row.Icon;

  const handleCopyPress = useCallback(() => {
    copyToClipboard(row.copyValue, `${row.label} copied`);
  }, [row.copyValue, row.label]);

  return (
    <View>
      <View style={styles.row}>
        <View
          style={[styles.iconWrap, { backgroundColor: row.iconBackground }]}
        >
          <RowIcon size={18} color={row.iconColor} strokeWidth={2} />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value} numberOfLines={2}>
            {row.value}
          </Text>
        </View>
        <Pressable
          style={styles.copyButton}
          onPress={handleCopyPress}
          accessibilityRole="button"
          accessibilityLabel={`Copy ${row.label.toLowerCase()}`}
        >
          <Copy size={18} color={Colors.secondary} strokeWidth={2} />
        </Pressable>
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
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  copyButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(ContactInformationRow);
