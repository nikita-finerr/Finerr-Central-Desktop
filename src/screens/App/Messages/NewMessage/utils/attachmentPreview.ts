import { File } from "expo-file-system";
import { Platform } from "react-native";

export type AttachmentPreviewSource =
  | { type: "uri"; uri: string }
  | { type: "html"; html: string };

const bufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const buildPdfHtml = (base64: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #FFFFFF;
        overflow: hidden;
      }
      embed {
        width: 100%;
        height: 100%;
        border: 0;
      }
    </style>
  </head>
  <body>
    <embed src="data:application/pdf;base64,${base64}" type="application/pdf" />
  </body>
</html>`;

export const isPdfAttachment = (mimeType?: string | null, name?: string) => {
  if (mimeType === "application/pdf") return true;
  return Boolean(name?.toLowerCase().endsWith(".pdf"));
};

export const canPreviewAttachment = (
  kind: "image" | "pdf" | "document",
  mimeType?: string | null,
  name?: string,
) => kind === "image" || kind === "pdf" || isPdfAttachment(mimeType, name);

export const getPdfPreviewSource = async (
  uri: string,
): Promise<AttachmentPreviewSource> => {
  if (Platform.OS === "ios") {
    return { type: "uri", uri };
  }

  const file = new File(uri);
  const buffer = await file.arrayBuffer();
  const base64 = bufferToBase64(buffer);

  return { type: "html", html: buildPdfHtml(base64) };
};
