import { BellOff } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const NotificationEmptyList = () => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <BellOff size={40} color={Colors.textSecondary} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>No notifications available</Text>
      <Text style={styles.emptySubtitle}>
        Alerts for messages, faxes, and calls will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2 * globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.md,
  },
  emptyIconWrap: {
    width: 70,
    height: 70,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: FontSizes.sm * 1.5,
  },
});

export default memo(NotificationEmptyList);
