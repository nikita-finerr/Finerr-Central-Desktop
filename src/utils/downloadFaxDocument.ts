import { File, Paths } from "expo-file-system";
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
  const destination = new File(Paths.document, fileName);

  try {
    const result = await File.downloadFileAsync(url, destination, {
      idempotent: true,
    });
    console.log(result);
    showSuccessToast(`${fileName} downloaded successfully.`);
  } catch {
    showErrorToast("Failed to download document.");
  }
};
