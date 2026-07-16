import * as DocumentPicker from "expo-document-picker";

import { showErrorToast } from "../../../../../utils/toast";

const MAX_FAX_FILE_BYTES = 25 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = new Set([
  ".pdf",
  ".tif",
  ".tiff",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
]);

const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "image/tiff",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
];

export type FaxDocument = {
  name: string;
  uri: string;
  size?: number | null;
  mimeType?: string | null;
};

const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
};

export const getFaxDocumentMimeType = (
  fileName: string,
  mimeType?: string | null,
): string => {
  if (mimeType?.trim()) {
    return mimeType;
  }

  switch (getFileExtension(fileName)) {
    case ".pdf":
      return "application/pdf";
    case ".tif":
    case ".tiff":
      return "image/tiff";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
};

const isSupportedFaxDocument = (
  fileName: string,
  mimeType?: string | null,
): boolean => {
  const extension = getFileExtension(fileName);
  if (extension && SUPPORTED_EXTENSIONS.has(extension)) {
    return true;
  }

  if (!mimeType) {
    return false;
  }

  return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
};

export const pickFaxDocument = async (): Promise<FaxDocument | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: SUPPORTED_MIME_TYPES,
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];

  if (!isSupportedFaxDocument(asset.name, asset.mimeType)) {
    showErrorToast(
      "Unsupported file type. Use PDF, TIFF, or image files (JPG, PNG, GIF, BMP).",
    );
    return null;
  }

  if (asset.size && asset.size > MAX_FAX_FILE_BYTES) {
    showErrorToast("File must be 25 MB or smaller.");
    return null;
  }

  return {
    name: asset.name,
    uri: asset.uri,
    size: asset.size,
    mimeType: getFaxDocumentMimeType(asset.name, asset.mimeType),
  };
};
