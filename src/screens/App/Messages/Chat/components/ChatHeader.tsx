import LinearGradient from "react-native-linear-gradient";
import {
  ArrowLeftIcon,
  ChevronDown,
  ChevronUp,
  Phone,
  Search,
  X,
} from "lucide-react-native";
import { memo, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../../../../../components/common/Avatar";
import {
  AppRoutes,
  BrandGradient,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../../hooks/usePermissions";
import { useOutboundCall } from "../../../../../providers/OutboundCallProvider";

type Props = {
  conversation?: {
    id: string;
    contactName: string;
    phone?: string;
  };
  isSearchOpen: boolean;
  searchQuery: string;
  matchCount: number;
  activeMatchIndex: number;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchChange: (text: string) => void;
  onPrevMatch: () => void;
  onNextMatch: () => void;
};

const ChatHeader = ({
  conversation,
  isSearchOpen,
  searchQuery,
  matchCount,
  activeMatchIndex,
  onSearchOpen,
  onSearchClose,
  onSearchChange,
  onPrevMatch,
  onNextMatch,
}: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { top } = useSafeAreaInsets();

  const { dial, loading } = useOutboundCall();
  const { canManageCalls } = usePermissions();

  const searchInputRef = useRef<TextInput>(null);
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: isSearchOpen ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isSearchOpen, searchAnim]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const timer = setTimeout(() => searchInputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [isSearchOpen]);

  const onBack = () => {
    navigation.goBack();
  };

  const onLeftPress = () => {
    if (isSearchOpen) {
      Keyboard.dismiss();
      onSearchClose();
      return;
    }

    onBack();
  };

  const onPressContact = () => {
    if (!conversation?.id) return;
    navigation.navigate(AppRoutes.ContactDetails, {
      id: conversation.id,
    });
  };

  const onPressCall = async () => {
    if (!conversation?.id) return;
    await dial(conversation?.phone ?? "");
  };

  const normalOpacity = searchAnim.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [1, 0, 0],
  });

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0, 1],
  });

  const searchTranslateX = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const hasQuery = searchQuery.trim().length > 0;
  const canGoPrev = matchCount > 0 && activeMatchIndex > 0;
  const canGoNext = matchCount > 0 && activeMatchIndex < matchCount - 1;

  return (
    <LinearGradient
      colors={[...BrandGradient]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[
        styles.gradient,
        {
          paddingTop: top + 0.75 * globalStyleDefinitions.screenPadding.padding,
        },
      ]}
    >
      <Pressable
        onPress={onLeftPress}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel={isSearchOpen ? "Close search" : "Go back"}
      >
        {isSearchOpen ? (
          <X size={20} color={Colors.white} strokeWidth={2.5} />
        ) : (
          <ArrowLeftIcon size={22} color={Colors.white} strokeWidth={2.5} />
        )}
      </Pressable>

      <View style={styles.content}>
        <Animated.View
          style={[styles.normalContent, { opacity: normalOpacity }]}
          pointerEvents={isSearchOpen ? "none" : "auto"}
        >
          <Pressable
            style={styles.center}
            onPress={onPressContact}
            accessibilityRole="button"
          >
            <Avatar
              name={conversation?.contactName ?? "Contact"}
              size={40}
              fontSize={FontSizes.sm}
              backgroundColor={Colors.white}
              textColor={Colors.secondary}
            />
            <Text style={styles.name} numberOfLines={1}>
              {conversation?.contactName ?? "Contact"}
            </Text>
          </Pressable>

          {canManageCalls ? (
            <Pressable
              onPress={onPressCall}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Call contact"
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Phone size={18} color={Colors.white} strokeWidth={2} />
              )}
            </Pressable>
          ) : null}

          <Pressable
            onPress={onSearchOpen}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Search messages"
          >
            <Search size={18} color={Colors.white} strokeWidth={2} />
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.searchContent,
            {
              opacity: searchOpacity,
              transform: [{ translateX: searchTranslateX }],
            },
          ]}
          pointerEvents={isSearchOpen ? "auto" : "none"}
        >
          <Search size={18} color={Colors.white} strokeWidth={2} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="rgba(255, 255, 255, 0.65)"
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Search messages"
          />

          {hasQuery ? (
            <View style={styles.searchNav}>
              <Text style={styles.matchCounter}>
                {matchCount > 0
                  ? `${activeMatchIndex + 1}/${matchCount}`
                  : "0/0"}
              </Text>
              <Pressable
                onPress={onPrevMatch}
                disabled={!canGoPrev}
                style={[
                  styles.navButton,
                  !canGoPrev && styles.navButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Previous search result"
              >
                <ChevronUp size={18} color={Colors.white} strokeWidth={2.5} />
              </Pressable>
              <Pressable
                onPress={onNextMatch}
                disabled={!canGoNext}
                style={[
                  styles.navButton,
                  !canGoNext && styles.navButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Next search result"
              >
                <ChevronDown size={18} color={Colors.white} strokeWidth={2.5} />
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: 0.75 * globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.md,
    zIndex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
  },
  normalContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  center: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minWidth: 0,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.white,
    flex: 1,
  },
  searchContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.white + "20",
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.white,
    paddingVertical: 0,
  },
  searchNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  matchCounter: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.white,
    minWidth: 28,
    textAlign: "center",
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white + "20",
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
});

export default memo(ChatHeader);
