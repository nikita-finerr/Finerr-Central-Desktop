import {
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  type LucideIcon,
} from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../../constants";
import { globalStyleDefinitions } from "../../../../../../constants/globalStyleDefinitions";
import type { ContactCallItemDto } from "../../../../../../types/contact";
import {
  getCallHistoryTitle,
  getCallTimeLabel,
  isMissedContactCall,
} from "../data/callHistory";

type Props = {
  item: ContactCallItemDto;
  showSeparator: boolean;
  onPress: (item: ContactCallItemDto) => void;
};

const getItemStyle = (
  item: ContactCallItemDto,
): {
  Icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
} => {
  if (isMissedContactCall(item)) {
    return {
      Icon: PhoneMissed,
      iconColor: Colors.error,
      iconBackground: `${Colors.error}14`,
    };
  }

  if ((item.callType ?? "").toLowerCase().includes("out")) {
    return {
      Icon: PhoneOutgoing,
      iconColor: Colors.secondary,
      iconBackground: `${Colors.secondary}14`,
    };
  }

  return {
    Icon: PhoneIncoming,
    iconColor: Colors.success,
    iconBackground: `${Colors.success}14`,
  };
};

const CallHistoryRow = ({ item, showSeparator, onPress }: Props) => {
  const { Icon, iconColor, iconBackground } = getItemStyle(item);
  const timeLabel = getCallTimeLabel(item.callDate);
  const durationLabel = item.duration?.trim() ?? "";
  const subtitle =
    durationLabel && getCallHistoryTitle(item) !== "Missed Call"
      ? `${timeLabel} • ${durationLabel}`
      : timeLabel;

  return (
    <View>
      <Pressable
        style={styles.row}
        onPress={() => onPress(item)}
        accessibilityRole="button"
      >
        <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{getCallHistoryTitle(item)}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Pressable>

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
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
});

export default memo(CallHistoryRow);
