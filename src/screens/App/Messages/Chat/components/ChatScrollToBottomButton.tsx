import { ChevronDown } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { Colors, Radius } from "../../../../../constants";

type Props = {
  visible: boolean;
  onPress: () => void;
};

const ChatScrollToBottomButton = ({ visible, onPress }: Props) => {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Scroll to latest messages"
    >
      <ChevronDown size={22} color={Colors.textSecondary} strokeWidth={2.5} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 16,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default memo(ChatScrollToBottomButton);
