import { pick, types, keepLocalCopy } from "@react-native-documents/picker";
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
} from "react-native-image-picker";

import { showErrorToast } from "../../../../../utils/toast";
import type { MessageAttachment, MessageAttachmentKind } from "../types";

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const toAttachment = (
  asset: {
    uri: string;
    name?: string | null;
    mimeType?: string | null;
    size?: number | null;
  },
  kind: MessageAttachmentKind,
): MessageAttachment => ({
  id: createId(),
  uri: asset.uri,
  name: asset.name ?? "Attachment",
  mimeType: asset.mimeType,
  size: asset.size,
  kind,
});

const assetToAttachment = (
  asset: Asset,
  kind: MessageAttachmentKind,
): MessageAttachment =>
  toAttachment(
    {
      uri: asset.uri ?? "",
      name: asset.fileName ?? `image-${createId()}.jpg`,
      mimeType: asset.type ?? "image/jpeg",
      size: asset.fileSize,
    },
    kind,
  );

export const pickImagesFromLibrary = async (): Promise<MessageAttachment[]> => {
  const result = await launchImageLibrary({
    mediaType: "photo",
    selectionLimit: 0,
    quality: 0.8,
  });

  if (result.didCancel || !result.assets?.length) {
    if (result.errorCode === "permission") {
      showErrorToast("Photo library access is required to attach images.");
    }
    return [];
  }

  return result.assets
    .filter((asset) => Boolean(asset.uri))
    .map((asset) => assetToAttachment(asset, "image"));
};

export const takePhotoWithCamera = async (): Promise<MessageAttachment[]> => {
  const result = await launchCamera({
    mediaType: "photo",
    quality: 0.8,
    saveToPhotos: false,
  });

  if (result.didCancel || !result.assets?.[0]?.uri) {
    if (result.errorCode === "permission") {
      showErrorToast("Camera access is required to take a photo.");
    }
    return [];
  }

  return [assetToAttachment(result.assets[0], "image")];
};

const pickDocumentsOfType = async (
  typeList: string[],
): Promise<MessageAttachment[]> => {
  try {
    const results = await pick({
      type: typeList,
      allowMultiSelection: true,
    });

    if (!results.length) {
      return [];
    }

    const [first, ...rest] = results;
    const localCopies = await keepLocalCopy({
      files: [
        {
          uri: first.uri,
          fileName: first.name ?? "document",
        },
        ...rest.map((file) => ({
          uri: file.uri,
          fileName: file.name ?? "document",
        })),
      ],
      destination: "cachesDirectory",
    });

    return results.map((file, index) => {
      const local = localCopies[index];
      const uri =
        local?.status === "success" ? local.localUri : file.uri;
      const isPdf =
        file.type === "application/pdf" ||
        (file.name ?? "").toLowerCase().endsWith(".pdf");

      return toAttachment(
        {
          uri,
          name: file.name,
          mimeType: file.type,
          size: file.size,
        },
        isPdf ? "pdf" : "document",
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/cancel/i.test(message)) {
      showErrorToast("Unable to pick document.");
    }
    return [];
  }
};

export const pickPdfDocuments = async (): Promise<MessageAttachment[]> =>
  pickDocumentsOfType([types.pdf]);

export const pickDocuments = async (): Promise<MessageAttachment[]> =>
  pickDocumentsOfType([
    types.pdf,
    types.doc,
    types.docx,
    types.xls,
    types.xlsx,
    types.plainText,
  ]);
