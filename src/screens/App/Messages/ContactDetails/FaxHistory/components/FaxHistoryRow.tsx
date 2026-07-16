import {
  Clock,
  Download,
  File,
  FileImage,
  FileText,
  RotateCcw,
} from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../../constants";
import { globalStyleDefinitions } from "../../../../../../constants/globalStyleDefinitions";
import type { ContactFaxItemDto } from "../../../../../../types/contact";
import { downloadFaxDocument } from "../../../../../../utils/downloadFaxDocument";
import {
  getContactFaxDocumentName,
  getContactFaxStatusColor,
  getContactFaxStatusLabel,
  getFaxFileTypeMeta,
  getFaxTimeLabel,
  isFailedContactFax,
} from "../data/faxHistory";

type Props = {
  item: ContactFaxItemDto;
  onPress?: (item: ContactFaxItemDto) => void;
};

const FaxHistoryRow = ({ item, onPress }: Props) => {
  const documentName = getContactFaxDocumentName(item);
  const statusColor = getContactFaxStatusColor(item);
  const statusLabel = getContactFaxStatusLabel(item);
  const fileMeta = getFaxFileTypeMeta(documentName);
  const isFailed = isFailedContactFax(item);
  const isUnread = !item.isRead;
  const hasDocument = Boolean(item.documentUrl);
  const FileIcon =
    fileMeta.fileType === "image"
      ? FileImage
      : fileMeta.fileType === "pdf"
        ? FileText
        : File;

  const handleDownloadPress = () => {
    if (!item.documentUrl) {
      return;
    }

    void downloadFaxDocument({
      createdAt: "",
      documentUrl: item.documentUrl,
      id: item.id,
      pharmacyId: 0,
      isRead: item.isRead,
      updatedAt: "",
    });
  };

  return (
    <Pressable
      style={styles.card}
      onPress={onPress ? () => onPress(item) : undefined}
      accessibilityRole="button"
    >
      <View style={styles.thumbnail}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: fileMeta.iconBackground },
          ]}
        >
          <FileIcon size={22} color={fileMeta.iconColor} strokeWidth={2} />
        </View>
        <View
          style={[styles.typeBadge, { backgroundColor: fileMeta.badgeColor }]}
        >
          <Text style={styles.typeBadgeText}>{fileMeta.badgeLabel}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.fileName, isUnread && styles.fileNameUnread]}
            numberOfLines={1}
          >
            {documentName}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}14` },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Clock size={12} color={Colors.textLight} strokeWidth={2} />
            <Text style={styles.metaText}>
              {getFaxTimeLabel(item.createdAt)}
            </Text>
          </View>

          <Pressable
            style={[styles.actionBtn, isFailed && styles.actionBtnFailed]}
            onPress={handleDownloadPress}
            disabled={!hasDocument && !isFailed}
            accessibilityRole="button"
            accessibilityLabel={isFailed ? "Retry fax" : "Download fax"}
          >
            {isFailed ? (
              <RotateCcw size={16} color={Colors.error} strokeWidth={2} />
            ) : (
              <Download
                size={16}
                color={hasDocument ? Colors.primary : Colors.textLight}
                strokeWidth={2}
              />
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
  },
  thumbnail: {
    width: 52,
    height: 64,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    width: "100%",
    paddingVertical: 2,
    alignItems: "center",
  },
  typeBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  fileName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  fileNameUnread: {
    fontFamily: Fonts.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${Colors.primary}10`,
  },
  actionBtnFailed: {
    backgroundColor: `${Colors.error}10`,
  },
});

export default memo(FaxHistoryRow);
