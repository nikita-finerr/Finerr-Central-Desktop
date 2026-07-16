import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants";
import { FontSizes } from "../../constants/theme/typography";

type Props = {
  title: string;
  description?: string;
};

const EmptyList = ({ title, description }: Props) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptySubtitle}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});

export default memo(EmptyList);
