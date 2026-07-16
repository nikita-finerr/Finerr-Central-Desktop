import { FileText, Image as ImageIcon, Paperclip, X } from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import type { MessageAttachment } from "../types";
import AttachmentPreviewModal from "./AttachmentPreviewModal";

type Props = {
  attachments: MessageAttachment[];
  onRemove: (id: string) => void;
};

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AttachmentIcon = ({ kind }: { kind: MessageAttachment["kind"] }) => {
  if (kind === "image") {
    return <ImageIcon size={16} color={Colors.secondary} strokeWidth={2} />;
  }
  if (kind === "pdf") {
    return <FileText size={16} color="#EF4444" strokeWidth={2} />;
  }
  return <Paperclip size={16} color={Colors.secondary} strokeWidth={2} />;
};

const MessageAttachmentsList = ({ attachments, onRemove }: Props) => {
  const [previewAttachment, setPreviewAttachment] =
    useState<MessageAttachment | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.wrap}>
        <Text style={styles.title}>Attachments ({attachments.length})</Text>
        {attachments.map((attachment) => (
            <Pressable
              key={attachment.id}
              style={styles.row}
              onPress={() => setPreviewAttachment(attachment)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${attachment.name}`}
            >
              <View style={styles.iconWrap}>
                <AttachmentIcon kind={attachment.kind} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={1}>
                  {attachment.name}
                </Text>
                {attachment.size ? (
                  <Text style={styles.meta}>
                    {formatFileSize(attachment.size)}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={() => onRemove(attachment.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${attachment.name}`}
              >
                <X size={16} color={Colors.textSecondary} strokeWidth={2} />
              </Pressable>
            </Pressable>
          ))}
      </View>

      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});

export default memo(MessageAttachmentsList);
