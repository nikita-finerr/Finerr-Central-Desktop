import { NavigationProp, useNavigation } from "@react-navigation/native";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Avatar from "../../../../components/common/Avatar";
import {
  AppRoutes,
  Colors,
  Fonts,
  FontSizes,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import {
  ACTIVITY_ICON_COLORS,
  ACTIVITY_ICONS,
  formatLatestActivity,
} from "../components/MessageUtils";
import type { SmsConversation } from "../../../../types/message";
import { formatConversationTimestamp } from "../../../../utils/dateUtils";

type Props = {
  item: SmsConversation;
};

const SMSContactCard = ({ item }: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const onCardPress = () => {
    navigation.navigate(AppRoutes.Chat, {
      id: item?.id?.toString() ?? "",
      contactName: item?.contactName ?? "",
      phoneNumber: item?.phoneNumber ?? "",
      unreadCount: item?.unreadCount ?? 0,
    });
  };

  const isUnread = item?.unreadCount > 0;
  const timestamp = formatConversationTimestamp(item?.lastMessageAt);

  const { kind, text } = formatLatestActivity(item);
  const showIcon = kind !== "SMS";
  const Icon = ACTIVITY_ICONS[kind];
  const iconColor = ACTIVITY_ICON_COLORS[kind];

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onCardPress}
      activeOpacity={0.9}
    >
      <Avatar name={item?.contactName} size={40} fontSize={FontSizes.sm} />
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text
            style={styles.contactName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.contactName}
          </Text>
          <Text style={styles.metaPreview}>{timestamp}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.activityPreviewRow}>
            {showIcon ? (
              <Icon size={18} color={iconColor} strokeWidth={2} />
            ) : null}
            <Text
              style={[styles.metaPreview, { fontFamily: Fonts.medium }]}
              numberOfLines={1}
            >
              {text}
            </Text>
          </View>
          {isUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item?.unreadCount > 9 ? "9+" : item?.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoContainer: {
    flex: 1,
    gap: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  contactName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  metaPreview: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  activityPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCount: {
    fontFamily: Fonts.bold,
    color: Colors.white,
    fontSize: FontSizes.xs,
  },
});

export default memo(SMSContactCard);
