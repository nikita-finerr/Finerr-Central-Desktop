import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  FileText,
  MessageCircle,
  Phone,
  Voicemail,
  type LucideIcon,
} from "lucide-react-native";
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
} from "../constants";
import type { RootState } from "../redux/store";
import { getTabBadgeCounts } from "../utils/tabBadges";

type TabBadgeKey =
  | "messages"
  | "fax"
  | keyof ReturnType<typeof getTabBadgeCounts>;

type TabConfig = {
  route: string;
  label: string;
  Icon?: LucideIcon;
  ionIcon?: string;
  badgeKey?: TabBadgeKey;
};

const TAB_CONFIG: TabConfig[] = [
  {
    route: AppRoutes.Messages,
    label: "Messages",
    Icon: MessageCircle,
    badgeKey: "messages",
  },
  {
    route: AppRoutes.Calls,
    label: "Calls",
    Icon: Phone,
  },
  {
    route: AppRoutes.DialPad,
    label: "DialPad",
    ionIcon: "keypad-outline",
  },
  {
    route: AppRoutes.Fax,
    label: "Fax",
    Icon: FileText,
    badgeKey: "fax",
  },
  {
    route: AppRoutes.VoiceMail,
    label: "VoiceMail",
    Icon: Voicemail,
    badgeKey: "voiceMail",
  },
];

const AppTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const messageUnreadCount = useSelector(
    (state: RootState) => state.message.unreadCount,
  );
  const faxUnreadCount = useSelector(
    (state: RootState) => state.fax.unreadCount,
  );
  const badges = getTabBadgeCounts();

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
      ]}
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tab = TAB_CONFIG.find((item) => item.route === route.name);
          const Icon = tab?.Icon;
          const label = tab?.label ?? options.title ?? route.name;
          const badgeCount =
            tab?.badgeKey === "messages"
              ? messageUnreadCount
              : tab?.badgeKey === "fax"
                ? faxUnreadCount
                : 0;
          const iconColor = isFocused ? Colors.tabActive : Colors.tabInactive;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
            >
              <View style={styles.iconWrap}>
                {tab?.ionIcon ? (
                  <Ionicons name={tab.ionIcon} size={25} color={iconColor} />
                ) : Icon ? (
                  <Icon
                    size={22}
                    color={iconColor}
                    strokeWidth={isFocused ? 2.2 : 2}
                  />
                ) : (
                  <MessageCircle
                    size={22}
                    color={iconColor}
                    strokeWidth={isFocused ? 2.2 : 2}
                  />
                )}
                {badgeCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: Spacing.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.tabInactive,
  },
  labelActive: {
    color: Colors.tabActive,
    fontFamily: Fonts.semiBold,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: Colors.white,
  },
});

export default AppTabBar;
