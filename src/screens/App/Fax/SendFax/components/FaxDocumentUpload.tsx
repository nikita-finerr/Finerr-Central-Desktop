import { FileUp } from "lucide-react-native";
import { memo } from "react";
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
import type { FaxDocument } from "../utils/pickFaxDocument";

type Props = {
  document: FaxDocument | null;
  loading?: boolean;
  onPress: () => void;
};

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FaxDocumentUpload = ({ document, loading = false, onPress }: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Document</Text>
      <Pressable
        style={[styles.uploadCard, document && styles.uploadCardFilled]}
        onPress={onPress}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Upload fax document"
      >
        {loading ? (
          <View style={styles.iconWrap}>
            <ActivityIndicator size="small" color={Colors.secondary} />
          </View>
        ) : (
          <View style={styles.iconWrap}>
            <FileUp size={28} color={Colors.secondary} strokeWidth={2} />
          </View>
        )}
        {document ? (
          <>
            <Text style={styles.uploadTitle} numberOfLines={1}>
              {document.name}
            </Text>
            {document.size ? (
              <Text style={styles.uploadSub}>
                {formatFileSize(document.size)}
              </Text>
            ) : null}
            <Text style={styles.changeText}>Tap to replace document</Text>
          </>
        ) : (
          <>
            <Text style={styles.uploadTitle}>Tap to upload document</Text>
            <Text style={styles.uploadSub}>
              PDF, TIFF, JPG, PNG, GIF, or BMP up to 25 MB
            </Text>
          </>
        )}
      </Pressable>
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
  uploadCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Colors.secondary,
    backgroundColor: Colors.backgroundSecondary,
    height: 150,
  },
  uploadCardFilled: {
    borderStyle: "solid",
    backgroundColor: Colors.white,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.secondary,
    textAlign: "center",
  },
  uploadSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  changeText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    textAlign: "center",
  },
});

export default memo(FaxDocumentUpload);
