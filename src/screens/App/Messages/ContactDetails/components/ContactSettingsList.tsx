import { BellOff, ChevronRight, CircleSlash, Trash2 } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

type SettingRowProps = {
  icon: typeof BellOff;
  iconColor: string;
  iconBackground: string;
  label: string;
  labelColor?: string;
  onPress: () => void;
};

const SettingRow = ({
  icon: Icon,
  iconColor,
  iconBackground,
  label,
  labelColor = Colors.textPrimary,
  onPress,
}: SettingRowProps) => (
  <Pressable
    style={styles.row}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
      <Icon size={18} color={iconColor} strokeWidth={2} />
    </View>
    <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    <ChevronRight size={18} color={Colors.textLight} strokeWidth={2} />
  </Pressable>
);

type Props = {
  onMute: () => void;
  onBlock: () => void;
  onDelete: () => void;
};

const ContactSettingsList = ({ onMute, onBlock, onDelete }: Props) => {
  return (
    <View style={styles.card}>
      <SettingRow
        icon={BellOff}
        iconColor={Colors.textSecondary}
        iconBackground={Colors.surface}
        label="Mute Notifications"
        onPress={onMute}
      />
      <View style={styles.divider} />
      <SettingRow
        icon={CircleSlash}
        iconColor={Colors.warning}
        iconBackground={`${Colors.warning}14`}
        label="Block Contact"
        onPress={onBlock}
      />
      <View style={styles.divider} />
      <SettingRow
        icon={Trash2}
        iconColor={Colors.error}
        iconBackground={`${Colors.error}14`}
        label="Delete Conversation"
        onPress={onDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
});

export default memo(ContactSettingsList);
