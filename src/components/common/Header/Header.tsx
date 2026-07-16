import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts, FontSizes } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { ArrowLeft } from "lucide-react-native";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

const Header = ({ title, showBack = false, onBackPress }: HeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            0.75 * globalStyleDefinitions.screenPadding.padding + insets.top,
        },
      ]}
    >
      {showBack && onBackPress ? (
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: 0.75 * globalStyleDefinitions.screenPadding.padding,
  },
  title: {
    textAlign: "center",
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  backButton: {
    position: "absolute",
    left: globalStyleDefinitions.screenPadding.padding,
    bottom: 0.75 * globalStyleDefinitions.screenPadding.padding,
  },
});

export default memo(Header);
