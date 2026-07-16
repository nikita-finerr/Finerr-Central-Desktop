import { Haptics } from "../../../../utils/haptics";
import { memo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { notificationApi } from "../../../../api/notificationApi";
import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { setUnreadCount } from "../../../../redux/notification/notificationSlice";
import { AppDispatch, RootState } from "../../../../redux/store";
import type { NotificationDisplayItem } from "../utils";

type NotificationCardProps = {
  notification: NotificationDisplayItem;
  setNotifications: (notifications: any) => void;
};

const NotificationCard = ({
  notification,
  setNotifications,
}: NotificationCardProps) => {
  const { Icon } = notification;

  const dispatch = useDispatch<AppDispatch>();

  const { unreadCount } = useSelector((state: RootState) => state.notification);

  const onPress = async () => {
    if (Platform.OS !== "web") {
      void Haptics.selectionAsync();
    }

    if (!notification.isRead) {
      setNotifications((prev: any) =>
        prev?.map((item: any) =>
          item?.id === notification?.id ? { ...item, isRead: true } : item,
        ),
      );
      dispatch(setUnreadCount(unreadCount - 1));
    }

    await notificationApi.markRead(notification?.id);
  };

  return (
    <TouchableOpacity
      style={[styles.card, !notification.isRead && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityState={{ selected: !notification.isRead }}
    >
      <View style={[styles.iconWrap, { backgroundColor: notification.iconBg }]}>
        <Icon size={20} color={notification.iconColor} strokeWidth={2.2} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text
            style={[
              styles.cardTitle,
              !notification.isRead && styles.cardTitleUnread,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.cardTimestamp}>{notification.timestamp}</Text>
          {!notification.isRead ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {notification.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: Colors.surface,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardTitle: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  cardTitleUnread: {
    fontFamily: Fonts.semiBold,
  },
  cardDescription: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm * 1.3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  cardTimestamp: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});

export default memo(NotificationCard);
