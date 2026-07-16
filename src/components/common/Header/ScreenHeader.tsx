import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import { memo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Fonts, FontSizes, Radius, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";

type Props = {
  title: string;
  description?: string;
  showBack?: boolean;
  onBackPress?: () => void;
};

const ScreenHeader = ({
  title,
  description,
  showBack = true,
  onBackPress,
}: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            insets.top + 0.75 * globalStyleDefinitions.screenPadding.padding,
        },
      ]}
    >
      {showBack ? (
        <Pressable
          onPress={handleBackPress}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
      ) : null}

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: 0.75 * globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.lg,
  },
  backButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
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
});

export default memo(ScreenHeader);
