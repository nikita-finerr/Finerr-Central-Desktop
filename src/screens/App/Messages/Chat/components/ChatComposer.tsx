import LinearGradient from "react-native-linear-gradient";
import { Paperclip, Send } from "lucide-react-native";
import { memo, useEffect, useRef, useState } from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BrandGradient,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onAttachPress: () => void;
  onSendPress: () => void;
  enabled?: boolean;
  nativeID?: string;
  onComposerLayout?: (event: LayoutChangeEvent) => void;
};

const ChatComposer = ({
  value,
  onChangeText,
  onAttachPress,
  onSendPress,
  enabled = true,
  nativeID = "chat-composer-input",
  onComposerLayout,
}: Props) => {
  const { bottom } = useSafeAreaInsets();
  const [inputResetKey, setInputResetKey] = useState(0);
  const hadTextRef = useRef(false);

  useEffect(() => {
    if (hadTextRef.current && value === "") {
      setInputResetKey((key) => key + 1);
    }
    hadTextRef.current = value.trim().length > 0;
  }, [value]);

  const canSend = enabled && value.trim().length > 0;

  return (
    <View
      onLayout={onComposerLayout}
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(
            bottom,
            0.75 * globalStyleDefinitions.screenPadding.padding,
          ),
        },
        !enabled && styles.wrapDisabled,
      ]}
    >
      {enabled && !canSend && (
        <Pressable
          style={styles.attachButton}
          accessibilityRole="button"
          accessibilityLabel="Attach image"
          onPress={onAttachPress}
        >
          <Paperclip size={20} color={Colors.textSecondary} strokeWidth={2} />
        </Pressable>
      )}
      <TextInput
        nativeID={nativeID}
        style={[styles.input, !enabled && styles.inputDisabled]}
        placeholder={enabled ? "Message..." : "Sending messages is not allowed"}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        multiline
        editable={enabled}
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={enabled ? onSendPress : undefined}
        key={inputResetKey}
      />

      {canSend && (
        <Pressable
          style={styles.sendButton}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={onSendPress}
        >
          <LinearGradient
            colors={[...BrandGradient]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.sendGradient}
          >
            <Send size={18} color={Colors.white} strokeWidth={2} />
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: 0.5 * globalStyleDefinitions.screenPadding.padding,
    backgroundColor: Colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    verticalAlign: "middle",
    textAlignVertical: "center",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 0.75 * globalStyleDefinitions.cardInnerPadding.padding,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  sendGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapDisabled: {
    opacity: 0.85,
  },
  inputDisabled: {
    backgroundColor: Colors.surface,
    color: Colors.textSecondary,
  },
});

export default memo(ChatComposer);
