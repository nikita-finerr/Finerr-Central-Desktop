import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react-native";
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
import type { FaxHistoryFilter } from "../data/faxHistory";

const FILTERS: Array<{
  id: FaxHistoryFilter;
  label: string;
  icon?: typeof ArrowDownToLine;
  iconColor?: string;
}> = [
  { id: "", label: "All Faxes" },
  {
    id: "Received",
    label: "Received",
    icon: ArrowDownToLine,
    iconColor: Colors.success,
  },
  {
    id: "Sent",
    label: "Sent",
    icon: ArrowUpFromLine,
    iconColor: Colors.secondary,
  },
];

type Props = {
  value: FaxHistoryFilter;
  onChange: (filter: FaxHistoryFilter) => void;
};

const FaxHistoryFilterTabs = ({ value, onChange }: Props) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {FILTERS.map((filter, index) => {
          const isActive = filter.id === value;
          const Icon = filter.icon;

          return (
            <View key={filter.id} style={styles.tabCell}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                onPress={() => onChange(filter.id)}
                style={[styles.tab, isActive && styles.tabActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                {Icon ? (
                  <Icon
                    size={14}
                    color={isActive ? Colors.primary : filter.iconColor}
                    strokeWidth={2}
                  />
                ) : null}
                <Text
                  style={[styles.label, isActive && styles.labelActive]}
                  numberOfLines={1}
                >
                  {filter.label}
                </Text>
              </Pressable>
            </View>
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
  },
  tabCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
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

export default memo(FaxHistoryFilterTabs);
