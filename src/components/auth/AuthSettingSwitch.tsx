import { memo, type ReactNode } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Colors, Fonts, FontSizes, Spacing } from "../../constants";

type Props = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: ReactNode;
};

const AuthSettingSwitch = ({ label, value, onValueChange, icon }: Props) => {
  return (
    <View style={styles.row}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 20,
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});

export default memo(AuthSettingSwitch);
