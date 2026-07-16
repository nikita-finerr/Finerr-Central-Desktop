import { useEffect, useState } from "react";
import type { FaxDto } from "../types/fax";
import { getFaxDocumentUrl } from "../utils/downloadFaxDocument";
import { countPdfPagesFromUrl } from "../utils/pdfPageCount";

export const useFaxPageCount = (item: FaxDto): number | null => {
  const apiPageCount = null;
  const [resolvedPageCount, setResolvedPageCount] = useState<number | null>(
    apiPageCount,
  );

  useEffect(() => {
    if (apiPageCount != null) {
      setResolvedPageCount(apiPageCount);
      return;
    }

    const url = getFaxDocumentUrl(item);
    if (!url) {
      setResolvedPageCount(null);
      return;
    }

    let cancelled = false;

    void countPdfPagesFromUrl(url).then((count) => {
      if (!cancelled) {
        setResolvedPageCount(count);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    apiPageCount,
    item.documentUrl,
    item.id,
    item.imagePreviewUrl,
    item.mediaUrl,
  ]);

  return resolvedPageCount;
};
