import { ShieldCheck } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const FaxDeliveryConfirmation = ({ value, onValueChange }: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <ShieldCheck size={20} color={Colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Request delivery confirmation</Text>
        <Text style={styles.subtitle}>
          Receive a confirmation when your fax is delivered
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.secondary }}
        thumbColor={Colors.white}
      />
    </View>
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
    backgroundColor: Colors.primary + "20",
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

export default memo(FaxDeliveryConfirmation);
