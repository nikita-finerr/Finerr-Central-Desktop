import type { LucideIcon } from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import DatePicker from "react-native-date-picker";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

const MIN_BIRTH_YEAR_OFFSET = 120;

const getMaximumBirthDate = () => new Date();

const getMinimumBirthDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - MIN_BIRTH_YEAR_OFFSET);
  return date;
};

const getDefaultBirthDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 30);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const formatBirthDate = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  Icon: LucideIcon;
};

const DateOfBirthField = ({
  label,
  value,
  onChange,
  placeholder = "Select date of birth",
  Icon,
}: Props) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = (selectedDate: Date) => {
    setShowPicker(false);
    onChange(selectedDate);
  };

  const displayValue = value ? formatBirthDate(value) : "";

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.shell}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Icon size={18} color={Colors.textSecondary} strokeWidth={2} />
        <Text
          style={[styles.value, !displayValue && styles.placeholder]}
          numberOfLines={1}
        >
          {displayValue || placeholder}
        </Text>
      </Pressable>

      <DatePicker
        modal
        open={showPicker}
        date={value ?? getDefaultBirthDate()}
        mode="date"
        maximumDate={getMaximumBirthDate()}
        minimumDate={getMinimumBirthDate()}
        onConfirm={handleConfirm}
        onCancel={() => setShowPicker(false)}
        title="Select Date of Birth"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  shell: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  value: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  placeholder: {
    color: Colors.textLight,
  },
});

export default memo(DateOfBirthField);
