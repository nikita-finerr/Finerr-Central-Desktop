import LinearGradient from "react-native-linear-gradient";
import { ArrowLeft, Pencil } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  AppRoutes,
  BrandGradient,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { ChatPatientDetailDto } from "../../../types/contact";

type Props = {
  title: string;
  patient: ChatPatientDetailDto | null;
};

const LinearHeader = ({ title, patient }: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const handleEditPress = () => {
    navigation.navigate(AppRoutes.EditContact, { patient });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={[...BrandGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.container,
        {
          paddingTop:
            insets.top + 0.75 * globalStyleDefinitions.screenPadding.padding,
        },
      ]}
    >
      <View style={styles.content}>
        <Pressable
          onPress={handleBackPress}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={Colors.white} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {patient ? (
          <Pressable
            onPress={handleEditPress}
            style={styles.editButton}
            accessibilityRole="button"
            accessibilityLabel="Edit contact"
          >
            <Pencil size={20} color={Colors.white} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.lg,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    position: "absolute",
    left: globalStyleDefinitions.screenPadding.padding,
    width: Spacing.xxl + Spacing.lg,
    height: Spacing.xxl + Spacing.lg,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.whiteOverlay,
  },
  editButton: {
    position: "absolute",
    right: globalStyleDefinitions.screenPadding.padding,
    width: Spacing.xxl + Spacing.lg,
    height: Spacing.xxl + Spacing.lg,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.whiteOverlay,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    lineHeight: FontSizes.lg + Spacing.xs,
    color: Colors.white,
    textAlign: "center",
  },
});

export default memo(LinearHeader);
