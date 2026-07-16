import { Camera, Image as ImageIcon } from "lucide-react-native";
import { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import type { MessageAttachment } from "../types";
import {
  pickImagesFromLibrary,
  takePhotoWithCamera,
} from "../utils/attachmentPicker";

type AttachmentKind = "images" | "camera";

const ATTACHMENT_OPTIONS: {
  kind: AttachmentKind;
  label: string;
  icon: typeof ImageIcon;
  color: string;
  backgroundColor: string;
}[] = [
  {
    kind: "camera",
    label: "Camera",
    icon: Camera,
    color: "#22C55E",
    backgroundColor: "#DCFCE7",
  },
  {
    kind: "images",
    label: "Images",
    icon: ImageIcon,
    color: "#7C3AED",
    backgroundColor: "#F3E8FF",
  },
];

type Props = {
  disabled?: boolean;
  loadingKind?: AttachmentKind | null;
  onAttach: (attachments: MessageAttachment[]) => void;
  onPickStart: (kind: AttachmentKind) => void;
  onPickEnd: () => void;
};

const AttachmentOptions = ({
  disabled = false,
  loadingKind = null,
  onAttach,
  onPickStart,
  onPickEnd,
}: Props) => {
  const handlePress = useCallback(
    async (kind: AttachmentKind) => {
      if (disabled || loadingKind) return;

      onPickStart(kind);
      try {
        let picked: MessageAttachment[] = [];

        switch (kind) {
          case "images":
            picked = await pickImagesFromLibrary();
            break;
          case "camera":
            picked = await takePhotoWithCamera();
            break;
        }

        if (picked.length > 0) {
          onAttach(picked);
        }
      } finally {
        onPickEnd();
      }
    },
    [disabled, loadingKind, onAttach, onPickEnd, onPickStart],
  );

  return (
    <View style={styles.attachmentsRow}>
      {ATTACHMENT_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isLoading = loadingKind === option.kind;

        return (
          <Pressable
            key={option.kind}
            style={[
              styles.attachmentCard,
              (disabled || loadingKind) && styles.attachmentCardDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            disabled={disabled || Boolean(loadingKind)}
            onPress={() => handlePress(option.kind)}
          >
            <View
              style={[
                styles.attachmentIconWrap,
                { backgroundColor: option.backgroundColor },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={option.color} />
              ) : (
                <Icon size={22} color={option.color} strokeWidth={2} />
              )}
            </View>
            <Text style={styles.attachmentLabel}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  attachmentsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  attachmentCard: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  attachmentCardDisabled: {
    opacity: 0.6,
  },
  attachmentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
    textAlign: "center",
  },
});

export default memo(AttachmentOptions);
