import { Download, X } from "lucide-react-native";
import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import { downloadFaxDocument } from "../../../../../utils/downloadFaxDocument";
import { showErrorToast } from "../../../../../utils/toast";
import type { MessageAttachment } from "../types";
import {
  canPreviewAttachment,
  getPdfPreviewSource,
  isPdfAttachment,
  type AttachmentPreviewSource,
} from "../utils/attachmentPreview";

type Props = {
  attachment: MessageAttachment | null;
  onClose: () => void;
};

const getPreviewLabel = (attachment: MessageAttachment) => {
  if (attachment.kind === "image") return "Image preview";
  if (
    attachment.kind === "pdf" ||
    isPdfAttachment(attachment.mimeType, attachment.name)
  ) {
    return "PDF preview";
  }
  return "Attachment";
};

const AttachmentPreviewModal = ({ attachment, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const [pdfSource, setPdfSource] = useState<AttachmentPreviewSource | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isImage = attachment?.kind === "image";
  const isPdf =
    attachment?.kind === "pdf" ||
    (attachment != null &&
      isPdfAttachment(attachment.mimeType, attachment.name));
  const isPreviewable =
    attachment != null &&
    canPreviewAttachment(attachment.kind, attachment.mimeType, attachment.name);

  const resetPreview = useCallback(() => {
    setPdfSource(null);
    setLoading(false);
    setDownloading(false);
  }, []);

  const handleDownloadPress = useCallback(async () => {
    if (!attachment || downloading) {
      return;
    }

    setDownloading(true);
    try {
      await downloadFaxDocument({
        documentUrl: attachment.uri,
        mediaUrl: attachment.uri,
        imagePreviewUrl: attachment.uri,
        id: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        direction: "incoming",
        status: "delivered",
        isRead: false,
        pharmacyId: 0,
        failureReason: "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setDownloading(false);
    }
  }, [attachment, downloading]);

  useEffect(() => {
    resetPreview();

    if (!attachment || !isPdf) {
      return;
    }

    const isRemoteUri =
      attachment.uri.startsWith("http://") ||
      attachment.uri.startsWith("https://");

    if (isRemoteUri) {
      setPdfSource({ type: "uri", uri: attachment.uri });
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      setLoading(true);
      try {
        const source = await getPdfPreviewSource(attachment.uri);
        if (!cancelled) {
          setPdfSource(source);
        }
      } catch {
        if (!cancelled) {
          showErrorToast("Unable to open this PDF.");
          onClose();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
    };
  }, [attachment, isPdf, onClose, resetPreview]);

  if (!attachment) {
    return null;
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, Spacing.md),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
          >
            <X size={22} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {attachment.name}
          </Text>

          <Pressable
            onPress={() => void handleDownloadPress()}
            disabled={downloading}
            style={styles.headerActionButton}
            accessibilityRole="button"
            accessibilityLabel={`Download ${attachment.name}`}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <Download size={20} color={Colors.textPrimary} strokeWidth={2} />
            )}
          </Pressable>
        </View>

        <View style={styles.content}>
          {isImage ? (
            <View style={styles.previewFrame}>
              <Image
                source={{ uri: attachment.uri }}
                style={styles.image}
                resizeMode="contain"
                accessibilityLabel={attachment.name}
              />
            </View>
          ) : null}

          {isPdf ? (
            <View style={styles.previewFrame}>
              {loading || !pdfSource ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" color={Colors.secondary} />
                </View>
              ) : (
                <WebView
                  source={
                    pdfSource.type === "html"
                      ? { html: pdfSource.html }
                      : { uri: pdfSource.uri }
                  }
                  style={styles.webview}
                  originWhitelist={["*"]}
                  startInLoadingState
                  renderLoading={() => (
                    <View style={styles.loader}>
                      <ActivityIndicator
                        size="large"
                        color={Colors.secondary}
                      />
                    </View>
                  )}
                  allowFileAccess
                  allowUniversalAccessFromFileURLs
                />
              )}
            </View>
          ) : null}

          {!isPreviewable ? (
            <View style={styles.unsupported}>
              <Text style={styles.unsupportedTitle}>Preview unavailable</Text>
              <Text style={styles.unsupportedText}>
                This file type cannot be previewed here. You can still send it
                with your message.
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: 0.5 * globalStyleDefinitions.screenPadding.padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  closeButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  headerActionButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    textAlign: "center",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  previewFrame: {
    flex: 1,
    overflow: "hidden",
  },
  image: {
    flex: 1,
    width: "100%",
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  unsupported: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  unsupportedTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  unsupportedText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: FontSizes.sm * 1.5,
  },
});

export default memo(AttachmentPreviewModal);
