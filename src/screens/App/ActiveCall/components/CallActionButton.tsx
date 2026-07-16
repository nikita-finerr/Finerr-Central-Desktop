import Ionicons from "react-native-vector-icons/Ionicons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Fonts, FontSizes, Spacing } from "../../../../constants";

type Props = {
  label: string;
  iconName: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

const CallActionButton = ({
  label,
  iconName,
  active = false,
  disabled = false,
  onPress,
}: Props) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.wrap,
      pressed && !disabled && styles.pressed,
      disabled && styles.disabled,
    ]}
  >
    <View style={[styles.circle, active && styles.circleActive]}>
      <Ionicons
        name={iconName}
        size={28}
        color={active ? Colors.white : Colors.tabActive}
      />
    </View>
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: 88,
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundSecondary,
  },
  circleActive: {
    backgroundColor: Colors.tabActive,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.tabActive,
    letterSpacing: 0.5,
  },
  labelActive: {
    color: Colors.tabActive,
  },
});

export default memo(CallActionButton);
