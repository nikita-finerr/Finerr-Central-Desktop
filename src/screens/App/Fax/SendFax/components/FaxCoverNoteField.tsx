import { memo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

const COVER_NOTE_LIMIT = 500;

type Props = {
  value: string;
  onChange: (text: string) => void;
};

const FaxCoverNoteField = ({ value, onChange }: Props) => {
  const onChangeText = (text: string) => {
    if (text.length <= COVER_NOTE_LIMIT) {
      onChange(text);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Cover Note (Optional)</Text>
      <View style={styles.shell}>
        <View style={styles.inputWrap}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Add a cover note for the recipient..."
            placeholderTextColor={Colors.textLight}
            multiline
            textAlignVertical="top"
            style={styles.input}
          />
          <Text style={styles.charCount}>
            {value.length} / {COVER_NOTE_LIMIT}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  shell: {
    height: 120,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  icon: {
    marginTop: 2,
  },
  inputWrap: {
    flex: 1,
    height: 100,
  },
  input: {
    flex: 1,
    height: 100,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md * 1.45,
    color: Colors.textPrimary,
    padding: 0,
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
});

export default memo(FaxCoverNoteField);
