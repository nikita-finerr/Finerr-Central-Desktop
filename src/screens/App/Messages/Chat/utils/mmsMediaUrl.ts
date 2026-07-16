export const parseMmsMediaUrls = (
  mmsMediaUrl: string | null | undefined,
): string[] => {
  if (!mmsMediaUrl?.trim()) {
    return [];
  }

  return mmsMediaUrl
    .split(",")
    .map((entry) => entry.split("|")[0]?.trim() ?? "")
    .filter(Boolean);
};

export const hasMmsMedia = (
  mmsMediaUrl: string | null | undefined,
): boolean => parseMmsMediaUrls(mmsMediaUrl).length > 0;
