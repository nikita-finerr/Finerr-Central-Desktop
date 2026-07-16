import LinearGradient from "react-native-linear-gradient";
import { ArrowLeftIcon, Phone } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../../../../../components/common/Avatar";
import {
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
import type { ChatContactProfileResponse } from "../../../../../types/contact";

type Props = {
  profile?: ChatContactProfileResponse | undefined;
};

const ContactProfileHeader = ({ profile }: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { canManageCalls } = usePermissions();
  const { top } = useSafeAreaInsets();
  const { dial } = useOutboundCall();

  const onBack = () => {
    navigation.goBack();
  };

  const onPressCall = () => {
    if (!profile?.patientCentralId || !canManageCalls) return;
    void dial(profile?.phoneNumber ?? "");
  };

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
        onPress={onBack}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeftIcon size={22} color={Colors.white} strokeWidth={2.5} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.normalContent}>
          <Pressable style={styles.center} accessibilityRole="button">
            <Avatar
              name={profile?.fullName?.trim() ?? ""}
              size={40}
              fontSize={FontSizes.sm}
              backgroundColor={Colors.white}
              textColor={Colors.secondary}
            />
            <Text style={styles.name} numberOfLines={1}>
              {profile?.fullName?.trim() ?? ""}
            </Text>
          </Pressable>

          <Pressable
            onPress={onPressCall}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Call contact"
          >
            <Phone size={18} color={Colors.white} strokeWidth={2} />
          </Pressable>
        </View>
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
});

export default memo(ContactProfileHeader);
