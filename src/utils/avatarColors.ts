export type AvatarColorPair = {
  textColor: string;
  backgroundColor: string;
};

const AVATAR_COLORS_BY_LETTER: Record<string, AvatarColorPair> = {
  A: { textColor: "#16A34A", backgroundColor: "#DCFCE7" },
  B: { textColor: "#CA8A04", backgroundColor: "#FEF9C3" },
  C: { textColor: "#2563EB", backgroundColor: "#DBEAFE" },
  D: { textColor: "#7C3AED", backgroundColor: "#EDE9FE" },
  E: { textColor: "#0D9488", backgroundColor: "#CCFBF1" },
  F: { textColor: "#E11D48", backgroundColor: "#FFE4E6" },
  G: { textColor: "#059669", backgroundColor: "#D1FAE5" },
  H: { textColor: "#EA580C", backgroundColor: "#FFEDD5" },
  I: { textColor: "#4F46E5", backgroundColor: "#E0E7FF" },
  J: { textColor: "#0891B2", backgroundColor: "#CFFAFE" },
  K: { textColor: "#65A30D", backgroundColor: "#ECFCCB" },
  L: { textColor: "#DB2777", backgroundColor: "#FCE7F3" },
  M: { textColor: "#0284C7", backgroundColor: "#E0F2FE" },
  N: { textColor: "#6D28D9", backgroundColor: "#F3E8FF" },
  O: { textColor: "#B45309", backgroundColor: "#FDE68A" },
  P: { textColor: "#C026D3", backgroundColor: "#FAE8FF" },
  Q: { textColor: "#475569", backgroundColor: "#E2E8F0" },
  R: { textColor: "#DC2626", backgroundColor: "#FEE2E2" },
  S: { textColor: "#1D4ED8", backgroundColor: "#BFDBFE" },
  T: { textColor: "#0F766E", backgroundColor: "#CCFBF1" },
  U: { textColor: "#9333EA", backgroundColor: "#F3E8FF" },
  V: { textColor: "#047857", backgroundColor: "#A7F3D0" },
  W: { textColor: "#92400E", backgroundColor: "#FFEDD5" },
  X: { textColor: "#4B5563", backgroundColor: "#F3F4F6" },
  Y: { textColor: "#A16207", backgroundColor: "#FEF08A" },
  Z: { textColor: "#52525B", backgroundColor: "#F4F4F5" },
};

const DEFAULT_AVATAR_COLORS: AvatarColorPair = {
  textColor: "#4F46E5",
  backgroundColor: "#EEF2FF",
};

export const getAvatarLetter = (name: string): string => {
  const match = name.trim().match(/[a-zA-Z]/);
  return match ? match[0].toUpperCase() : "U";
};

export const getAvatarColors = (name: string): AvatarColorPair => {
  const letter = getAvatarLetter(name);
  return AVATAR_COLORS_BY_LETTER[letter] ?? DEFAULT_AVATAR_COLORS;
};

export const getNameInitials = (name: string): string => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "U";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() || "U";
  }
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first}${last}`;
};
