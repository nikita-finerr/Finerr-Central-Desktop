import type { LucideIcon } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Colors } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";

type Props = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
};

const ModuleFab = ({ icon: Icon, label, onPress }: Props) => {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Icon size={24} color={Colors.white} strokeWidth={2} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: globalStyleDefinitions.screenPadding.padding,
    bottom: 120,
    zIndex: 1,
    elevation: 1,
    overflow: "visible",
  },
  fab: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.secondary,
    height: 56,
    width: 56,
    borderRadius: 28,
  },
});

export default memo(ModuleFab);
