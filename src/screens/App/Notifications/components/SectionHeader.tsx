import { memo } from "react";
import { StyleSheet, Text } from "react-native";
import { Colors, Fonts, FontSizes, Spacing } from "../../../../constants";

type SectionHeaderProps = {
  label: string;
};

const SectionHeader = ({ label }: SectionHeaderProps) => {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
});

export default memo(SectionHeader);
