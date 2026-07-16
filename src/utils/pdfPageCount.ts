const pageCountCache = new Map<string, number>();

const countPagesInPdfBytes = (bytes: Uint8Array): number | null => {
  let text = "";

  for (let index = 0; index < bytes.length; index += 1) {
    text += String.fromCharCode(bytes[index]);
  }

  const matches = text.match(/\/Type\s*\/Page(?!s)/g);
  if (!matches?.length) {
    return null;
  }

  return matches.length;
};

export const countPdfPagesFromUrl = async (
  url: string,
): Promise<number | null> => {
  const cached = pageCountCache.get(url);
  if (cached != null) {
    return cached;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    const pageCount = countPagesInPdfBytes(new Uint8Array(buffer));

    if (pageCount != null) {
      pageCountCache.set(url, pageCount);
    }

    return pageCount;
  } catch {
    return null;
  }
};
