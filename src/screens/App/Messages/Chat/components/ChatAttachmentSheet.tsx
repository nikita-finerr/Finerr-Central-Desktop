import { Camera, Image as ImageIcon } from "lucide-react-native";
import { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import type { MessageAttachment } from "../../NewMessage/types";
import {
  pickImagesFromLibrary,
  takePhotoWithCamera,
} from "../../NewMessage/utils/attachmentPicker";

type AttachmentKind = "camera" | "gallery";

const ATTACHMENT_OPTIONS: {
  kind: AttachmentKind;
  label: string;
  icon: typeof Camera | typeof ImageIcon;
  color: string;
}[] = [
  {
    kind: "camera",
    label: "Camera",
    icon: Camera,
    color: "#EC4899",
  },
  {
    kind: "gallery",
    label: "Gallery",
    icon: ImageIcon,
    color: "#7C3AED",
  },
];

type Props = {
  visible: boolean;
  loadingKind: AttachmentKind | null;
  onClose: () => void;
  onAttach: (attachments: MessageAttachment[]) => void;
  onPickStart: (kind: AttachmentKind) => void;
  onPickEnd: () => void;
};

const ChatAttachmentSheet = ({
  visible,
  loadingKind,
  onClose,
  onAttach,
  onPickStart,
  onPickEnd,
}: Props) => {
  const { bottom } = useSafeAreaInsets();

  const handlePick = useCallback(
    async (kind: AttachmentKind) => {
      if (loadingKind) return;

      onPickStart(kind);

      try {
        let picked: MessageAttachment[] = [];

        switch (kind) {
          case "camera":
            picked = await takePhotoWithCamera();
            break;
          case "gallery":
            picked = await pickImagesFromLibrary();
            break;
        }

        if (picked.length > 0) {
          onAttach(picked);
        }
      } finally {
        onPickEnd();
        onClose();
      }
    },
    [loadingKind, onAttach, onClose, onPickEnd, onPickStart],
  );

  const handleOptionPress = useCallback(
    (kind: AttachmentKind) => {
      if (loadingKind) return;

      void handlePick(kind);
    },
    [handlePick, loadingKind, onClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(bottom, Spacing.lg) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.grid}>
            {ATTACHMENT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isLoading = loadingKind === option.kind;

              return (
                <Pressable
                  key={option.kind}
                  style={styles.option}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  disabled={Boolean(loadingKind)}
                  onPress={() => handleOptionPress(option.kind)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: option.color },
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Icon size={24} color={Colors.white} strokeWidth={2} />
                    )}
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.black,
    opacity: 0.4,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    columnGap: Spacing.md,
    rowGap: Spacing.lg,
  },
  option: {
    width: "30%",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
    textAlign: "center",
  },
});

export default memo(ChatAttachmentSheet);
