import Ionicons from "react-native-vector-icons/Ionicons";
import { memo, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputSelectionChangeEvent,
} from "react-native";

import { TabHeader } from "../../../components/common/Header";
import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Spacing,
} from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { useOutboundCall } from "../../../hooks/useOutboundCall";

const KEYPAD_ROWS = [
  [
    { digit: "1", letters: "" },
    { digit: "2", letters: "ABC" },
    { digit: "3", letters: "DEF" },
  ],
  [
    { digit: "4", letters: "GHI" },
    { digit: "5", letters: "JKL" },
    { digit: "6", letters: "MNO" },
  ],
  [
    { digit: "7", letters: "PQRS" },
    { digit: "8", letters: "TUV" },
    { digit: "9", letters: "WXYZ" },
  ],
  [
    { digit: "*", letters: "" },
    { digit: "0", letters: "+" },
    { digit: "#", letters: "" },
  ],
] as const;

const MAX_DIAL_LENGTH = 15;
const DIALPAD_CHAR_PATTERN = /[^\d+*#]/g;

const DialPad = () => {
  const { dial, loading } = useOutboundCall();
  const [digits, setDigits] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const selectionRef = useRef({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  const updateSelection = useCallback((start: number, end = start) => {
    const next = { start, end };
    selectionRef.current = next;
    setSelection(next);
  }, []);

  const handleSelectionChange = useCallback(
    (event: TextInputSelectionChangeEvent) => {
      const next = event.nativeEvent.selection;
      selectionRef.current = next;
      setSelection(next);
    },
    [],
  );

  const handleChangeText = useCallback((text: string) => {
    const sanitized = text
      .replace(DIALPAD_CHAR_PATTERN, "")
      .slice(0, MAX_DIAL_LENGTH);
    setDigits(sanitized);
  }, []);

  const insertAtCursor = useCallback(
    (digit: string) => {
      setDigits((current) => {
        const { start, end } = selectionRef.current;
        const before = current.slice(0, start);
        const after = current.slice(end);
        const updated = `${before}${digit}${after}`
          .replace(DIALPAD_CHAR_PATTERN, "")
          .slice(0, MAX_DIAL_LENGTH);
        const cursor = updated.length - after.length;

        updateSelection(cursor);
        return updated;
      });

      inputRef.current?.focus();
    },
    [updateSelection],
  );

  const handleDigit = useCallback(
    (digit: string) => {
      insertAtCursor(digit);
    },
    [insertAtCursor],
  );

  const handleDigitLongPress = useCallback(
    (digit: string) => {
      if (digit === "0") {
        insertAtCursor("+");
      }
    },
    [insertAtCursor],
  );

  const handleBackspace = useCallback(() => {
    setDigits((current) => {
      const { start, end } = selectionRef.current;

      if (start !== end) {
        const updated = `${current.slice(0, start)}${current.slice(end)}`;
        updateSelection(start);
        return updated;
      }

      if (start === 0) {
        return current;
      }

      const updated = `${current.slice(0, start - 1)}${current.slice(start)}`;
      updateSelection(start - 1);
      return updated;
    });

    inputRef.current?.focus();
  }, [updateSelection]);

  const handleCall = useCallback(async () => {
    if (digits.replace(/\D/g, "").length < 3) {
      return;
    }

    const result = await dial(digits);
    if (result) {
      setDigits("");
      updateSelection(0);
    }
  }, [dial, digits, updateSelection]);

  const canCall = digits.replace(/\D/g, "").length >= 3;

  return (
    <View style={styles.root}>
      <TabHeader
        title="DialPad"
        description="Dial a phone number to make a call."
      />
      <View style={styles.container}>
        <View style={styles.displayWrap}>
          <TextInput
            ref={inputRef}
            value={digits}
            onChangeText={handleChangeText}
            onSelectionChange={handleSelectionChange}
            selection={selection}
            style={styles.display}
            showSoftInputOnFocus={false}
            keyboardType="phone-pad"
            maxLength={MAX_DIAL_LENGTH}
            caretHidden={false}
            contextMenuHidden={false}
            selectTextOnFocus={false}
          />
        </View>

        <View style={styles.keypadSection}>
          <View style={{ gap: Spacing.lg }}>
            {KEYPAD_ROWS.map((row) => (
              <View key={row[0].digit} style={styles.keyRow}>
                {row.map((key) => (
                  <Pressable
                    key={key.digit}
                    onPress={() => handleDigit(key.digit)}
                    onLongPress={() => handleDigitLongPress(key.digit)}
                    delayLongPress={350}
                    style={({ pressed }) => [
                      styles.key,
                      pressed && styles.keyPressed,
                    ]}
                  >
                    <Text style={styles.keyDigit}>{key.digit}</Text>
                    {key?.letters && (
                      <Text style={styles.keyLetters}>{key?.letters}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <View style={{ width: Dimensions.width * 0.2 }} />
            <Pressable
              onPress={handleCall}
              disabled={!canCall || loading}
              style={[
                styles.callBtn,
                (!canCall || loading) && styles.callBtnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Ionicons name="call" size={35} color={Colors.white} />
              )}
            </Pressable>
            <Pressable
              onPress={handleBackspace}
              disabled={digits.length === 0}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && styles.deleteBtnPressed,
              ]}
            >
              <Ionicons
                name="backspace-outline"
                size={35}
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: globalStyleDefinitions.screenPadding.padding,
    alignItems: "center",
    justifyContent: "center",
    height: Dimensions.height * 0.75,
  },
  displayWrap: {
    width: "100%",
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.xs,
  },
  keypadSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: Spacing.lg,
  },
  display: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xxxl,
    lineHeight: FontSizes.xxxl + 5,
    color: Colors.textPrimary,
    letterSpacing: 2,
    textAlign: "center",
    width: Dimensions.width - 2 * globalStyleDefinitions.screenPadding.padding,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: Dimensions.width - 2 * globalStyleDefinitions.screenPadding.padding,
  },
  key: {
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.width * 0.2,
    height: Dimensions.width * 0.2,
    borderRadius: (Dimensions.width * 0.2) / 2,
  },
  keyPressed: {
    backgroundColor: Colors.surface,
  },
  keyDigit: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xxxl,
    lineHeight: FontSizes.xxxl + 5,
    color: Colors.textPrimary,
  },
  keyLetters: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm + 5,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: Spacing.lg,
    width: Dimensions.width - 4 * globalStyleDefinitions.screenPadding.padding,
  },
  callBtn: {
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.width * 0.18,
    height: Dimensions.width * 0.18,
    borderRadius: (Dimensions.width * 0.18) / 2,
  },
  callBtnDisabled: {
    opacity: 0.45,
  },
  deleteBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.width * 0.18,
    height: Dimensions.width * 0.18,
  },
  deleteBtnPressed: {
    opacity: 0.5,
  },
});

export default memo(DialPad);
