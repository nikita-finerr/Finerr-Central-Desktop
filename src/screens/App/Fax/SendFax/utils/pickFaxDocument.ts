import { pick, types, keepLocalCopy } from "@react-native-documents/picker";

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
  types.pdf,
  "image/tiff",
  types.images,
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

  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/")
  );
};

export const pickFaxDocument = async (): Promise<FaxDocument | null> => {
  try {
    const [file] = await pick({
      type: SUPPORTED_MIME_TYPES,
      allowMultiSelection: false,
    });

    if (!file) {
      return null;
    }

    const [localCopy] = await keepLocalCopy({
      files: [
        {
          uri: file.uri,
          fileName: file.name ?? "document",
        },
      ],
      destination: "cachesDirectory",
    });

    const uri =
      localCopy?.status === "success" ? localCopy.localUri : file.uri;
    const name = file.name ?? "document";

    if (!isSupportedFaxDocument(name, file.type)) {
      showErrorToast(
        "Unsupported file type. Use PDF, TIFF, or image files (JPG, PNG, GIF, BMP).",
      );
      return null;
    }

    if (file.size && file.size > MAX_FAX_FILE_BYTES) {
      showErrorToast("File must be 25 MB or smaller.");
      return null;
    }

    return {
      name,
      uri,
      size: file.size,
      mimeType: getFaxDocumentMimeType(name, file.type),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/cancel/i.test(message)) {
      showErrorToast("Unable to pick document.");
    }
    return null;
  }
};
