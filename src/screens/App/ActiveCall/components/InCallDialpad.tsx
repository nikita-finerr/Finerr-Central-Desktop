import Ionicons from "react-native-vector-icons/Ionicons";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, Dimensions, Fonts, FontSizes, Spacing } from "../../../../constants";

const KEYPAD_ROWS = [
  [{ digit: "1" }, { digit: "2" }, { digit: "3" }],
  [{ digit: "4" }, { digit: "5" }, { digit: "6" }],
  [{ digit: "7" }, { digit: "8" }, { digit: "9" }],
  [{ digit: "*" }, { digit: "0" }, { digit: "#" }],
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onDigit: (digit: string) => void;
};

const InCallDialpad = ({ visible, onClose, onDigit }: Props) => {
  const [dialedDigits, setDialedDigits] = useState("");

  useEffect(() => {
    if (visible) {
      setDialedDigits("");
    }
  }, [visible]);

  const handleDigit = useCallback(
    (digit: string) => {
      setDialedDigits((current) => current + digit);
      onDigit(digit);
    },
    [onDigit],
  );

  const handleBackspace = useCallback(() => {
    setDialedDigits((current) => current.slice(0, -1));
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Dialpad</Text>
          <Text style={styles.dialedDigits} numberOfLines={1}>
            {dialedDigits || " "}
          </Text>
          <View style={styles.keypad}>
            {KEYPAD_ROWS.map((row) => (
              <View key={row[0].digit} style={styles.row}>
                {row.map((key) => (
                  <Pressable
                    key={key.digit}
                    onPress={() => handleDigit(key.digit)}
                    style={({ pressed }) => [
                      styles.key,
                      pressed && styles.keyPressed,
                    ]}
                  >
                    <Text style={styles.keyDigit}>{key.digit}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
          <View style={styles.footerRow}>
            <Pressable
              onPress={handleBackspace}
              disabled={dialedDigits.length === 0}
              style={({ pressed }) => [
                styles.backspaceBtn,
                pressed && styles.backspaceBtnPressed,
                dialedDigits.length === 0 && styles.backspaceBtnDisabled,
              ]}
            >
              <Ionicons name="backspace-outline" size={24} color={Colors.textPrimary} />
            </Pressable>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  dialedDigits: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xxxl,
    color: Colors.textPrimary,
    letterSpacing: 2,
    minHeight: FontSizes.xxxl + 4,
    marginBottom: Spacing.lg,
    textAlign: "center",
    width: "100%",
  },
  keypad: {
    width: "100%",
    gap: Spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  key: {
    width: Dimensions.width * 0.2,
    height: Dimensions.width * 0.2,
    borderRadius: (Dimensions.width * 0.2) / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  keyPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  keyDigit: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xxl,
    color: Colors.textPrimary,
  },
  footerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  backspaceBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  backspaceBtnPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  backspaceBtnDisabled: {
    opacity: 0.35,
  },
  closeBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  closeText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.tabActive,
  },
});

export default memo(InCallDialpad);
