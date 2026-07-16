import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../../constants";
import { globalStyleDefinitions } from "../../../../../../constants/globalStyleDefinitions";
import type { CallHistoryFilter } from "../data/callHistory";

const FILTERS: CallHistoryFilter[] = [
  "All Calls",
  "Inbound",
  "Outbound",
  "Missed",
];

type Props = {
  value: CallHistoryFilter;
  onChange: (filter: CallHistoryFilter) => void;
};

const CallHistoryFilterTabs = ({ value, onChange }: Props) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {FILTERS.map((filter) => {
          const isActive = filter === value;

          return (
            <Pressable
              key={filter}
              onPress={() => onChange(filter)}
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  tabActive: {
    backgroundColor: `${Colors.primary}14`,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  labelActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default memo(CallHistoryFilterTabs);
