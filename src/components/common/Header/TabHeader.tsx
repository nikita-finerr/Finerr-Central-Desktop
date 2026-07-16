import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Bell } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import {
  AppRoutes,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import type { RootState } from "../../../redux/store";
import Avatar from "../Avatar";

type Props = {
  title: string;
  description?: string;
  showNotifications?: boolean;
  showProfile?: boolean;
};

const TabHeader = ({
  title,
  description,
  showNotifications = true,
  showProfile = true,
}: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const unreadCount = useSelector(
    (state: RootState) => state.notification.unreadCount,
  );
  const userData = useSelector((state: RootState) => state.auth.userData);

  const onBellPress = () => {
    navigation.navigate(AppRoutes.Notifications);
  };

  const onProfilePress = () => {
    navigation.navigate(AppRoutes.Profile);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            insets.top + 0.5 * globalStyleDefinitions.screenPadding.padding,
        },
      ]}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {showNotifications ? (
        <Pressable onPress={onBellPress} accessibilityRole="button">
          <Bell size={24} color={Colors.textPrimary} strokeWidth={2} />
          {unreadCount > 0 ? (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}
      {showProfile && (
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          style={styles.profileButton}
        >
          <Avatar
            name={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}
            size={35}
            fontSize={FontSizes.sm}
            backgroundColor={Colors.secondary}
            textColor={Colors.white}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: 0.75 * globalStyleDefinitions.screenPadding.padding,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg + 5,
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm + 5,
    color: Colors.textSecondary,
  },
  badgeContainer: {
    position: "absolute",
    top: -9,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.error,
    zIndex: 1,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs - 2,
    color: Colors.white,
  },
  profileButton: {
    marginLeft: Spacing.md,
  },
});

export default memo(TabHeader);
