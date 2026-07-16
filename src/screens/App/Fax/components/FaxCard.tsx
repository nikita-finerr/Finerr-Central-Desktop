import { Download, FileText, RotateCcw } from "lucide-react-native";
import { memo, useMemo } from "react";
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
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { useFaxPageCount } from "../../../../hooks/useFaxPageCount";
import type { FaxDto } from "../../../../types/fax";
import { formatConversationTimestamp } from "../../../../utils/dateUtils";
import { formatPhoneDisplay } from "../../../../utils/formatPhoneNumber";
import {
  getDocumentName,
  getRemoteNumber,
  getStatusColor,
  getStatusLabel,
} from "../../Messages/data/faxRecords";

type Props = {
  item: FaxDto;
  onDocumentPress: (item: FaxDto) => void;
  onDownloadPress: (item: FaxDto) => void;
  onResendPress?: (item: FaxDto) => void;
  resending?: boolean;
};

const FaxCard = ({
  item,
  onDocumentPress,
  onDownloadPress,
  onResendPress,
  resending = false,
}: Props) => {
  const contactName = useMemo(
    () => formatPhoneDisplay(getRemoteNumber(item)),
    [item],
  );
  const documentName = useMemo(() => getDocumentName(item), [item]);
  const timestamp = useMemo(
    () => formatConversationTimestamp(item?.updatedAt),
    [item?.updatedAt],
  );
  const statusColor = getStatusColor(item?.status, item?.direction);
  const statusLabel = getStatusLabel(item.status, item.direction);
  const isFailed = (item.status ?? "").toLowerCase().includes("fail");
  const isUnread = item?.direction === "incoming" && !item.isRead;
  const hasDocument = Boolean(item.documentUrl ?? item.mediaUrl);
  const pageCount = useFaxPageCount(item);
  const pageCountLabel = pageCount ? `${pageCount} pg` : "";

  return (
    <View style={styles.row}>
      <View style={styles.infoContainer}>
        <Text style={styles.contactName} numberOfLines={1} ellipsizeMode="tail">
          {contactName}
        </Text>
        <Text style={styles.metaPreview}>{timestamp}</Text>
        {isUnread ? <View style={styles.unreadDot} /> : null}
      </View>
      <View style={styles.infoContainer}>
        <Pressable
          style={styles.activityPreviewRow}
          onPress={() => onDocumentPress(item)}
          disabled={!hasDocument}
          accessibilityRole="button"
          accessibilityLabel={`Preview ${documentName}`}
        >
          <FileText size={18} color={Colors.secondary} strokeWidth={2} />
          <Text
            style={[
              styles.metaPreview,
              styles.documentName,
              hasDocument && styles.documentNamePressable,
              isUnread && styles.documentNameUnread,
            ]}
            numberOfLines={1}
          >
            {documentName}
          </Text>
        </Pressable>
        <View
          style={[
            styles.faxStatusBadge,
            { backgroundColor: `${statusColor}20` },
          ]}
        >
          <Text
            style={[styles.faxStatusText, { color: statusColor }]}
            numberOfLines={1}
          >
            {statusLabel}
          </Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.metaPreview, { flex: 1 }]} numberOfLines={1}>
          {pageCountLabel}
        </Text>
        {isFailed ? (
          <Pressable
            onPress={() => onResendPress?.(item)}
            disabled={resending || !onResendPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Resend fax"
          >
            {resending ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <RotateCcw size={18} color={Colors.error} strokeWidth={2} />
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onDownloadPress(item)}
            disabled={!hasDocument}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Download ${documentName}`}
          >
            <Download
              size={18}
              color={hasDocument ? Colors.textSecondary : Colors.textLight}
              strokeWidth={2}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.sm,
  },
  infoContainer: {
    flex: 1,
    gap: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  contactName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  contactNameUnread: {
    fontFamily: Fonts.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  metaPreview: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  activityPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  documentName: {
    fontFamily: Fonts.medium,
    flex: 1,
  },
  documentNamePressable: {
    color: Colors.secondary,
  },
  documentNameUnread: {
    fontFamily: Fonts.semiBold,
  },
  faxStatusBadge: {
    paddingHorizontal: 0.75 * globalStyleDefinitions.cardInnerPadding.padding,
    paddingVertical: 0.3 * globalStyleDefinitions.cardInnerPadding.padding,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  faxStatusText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
  },
});

export default memo(FaxCard);
