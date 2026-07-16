import { ChevronRight, Lock } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

const FaxSecurityBanner = () => {
  return (
    <Pressable style={styles.card} accessibilityRole="button">
      <View style={styles.iconWrap}>
        <Lock size={18} color={Colors.secondary} strokeWidth={2} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>
          Your fax is secure and HIPAA compliant.
        </Text>
        <Text style={styles.subtitle}>
          No PHI is stored on unsecured servers.
        </Text>
      </View>
      <ChevronRight size={18} color={Colors.textLight} strokeWidth={2} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: FontSizes.sm * 1.35,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: FontSizes.xs * 1.45,
  },
});

export default memo(FaxSecurityBanner);
