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

const SecurityBanner = () => {
  return (
    <Pressable style={styles.securityBanner} accessibilityRole="button">
      <View style={styles.securityIconWrap}>
        <Lock size={18} color={Colors.secondary} strokeWidth={2} />
      </View>
      <View style={styles.securityCopy}>
        <Text style={styles.securityTitle}>
          Your messages are secure and HIPAA compliant.
        </Text>
        <Text style={styles.securitySubtitle}>
          No PHI is stored on unsecured servers.
        </Text>
      </View>
      <ChevronRight size={18} color={Colors.secondary} strokeWidth={2} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  securityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    borderRadius: Radius.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.secondary + "70",
  },
  securityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  securityCopy: {
    flex: 1,
    gap: 2,
  },
  securityTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: FontSizes.sm * 1.4,
  },
  securitySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: FontSizes.xs * 1.45,
  },
});

export default memo(SecurityBanner);
