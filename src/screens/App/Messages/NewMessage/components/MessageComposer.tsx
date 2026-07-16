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

const MESSAGE_CHAR_LIMIT = 1000;

type Props = {
  message: string;
  onChange: (text: string) => void;
  disabled?: boolean;
};

const MessageComposer = ({ message, onChange, disabled = false }: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Message</Text>
      <View style={styles.messageCard}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type your message..."
          placeholderTextColor={Colors.textLight}
          value={message}
          onChangeText={onChange}
          multiline
          textAlignVertical="top"
          editable={!disabled}
        />
        <Text style={styles.charCount}>
          {message.length} / {MESSAGE_CHAR_LIMIT}
        </Text>
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
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  messageCard: {
    height: 150,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
  },
  messageInput: {
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

export default memo(MessageComposer);
