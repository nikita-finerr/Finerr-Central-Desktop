import ReactNativeBlobUtil from "react-native-blob-util";

import { getDocumentName } from "../screens/App/Messages/data/faxRecords";
import { FaxDto } from "../types/fax";
import { showErrorToast, showSuccessToast } from "./toast";

export const getFaxDocumentUrl = (item: FaxDto): string | null =>
  item.documentUrl ?? item.mediaUrl ?? item.imagePreviewUrl ?? null;

export const downloadFaxDocument = async (item: FaxDto) => {
  const url = getFaxDocumentUrl(item);
  if (!url) {
    showErrorToast("Document unavailable.");
    return;
  }

  const fileName = getDocumentName(item);
  const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;

  try {
    await ReactNativeBlobUtil.config({
      path,
      fileCache: true,
    }).fetch("GET", url);
    showSuccessToast(`${fileName} downloaded successfully.`);
  } catch {
    showErrorToast("Failed to download document.");
  }
};
