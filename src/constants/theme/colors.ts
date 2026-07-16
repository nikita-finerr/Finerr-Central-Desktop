export const Colors = {
  // Brand
  primary: "#4F46E5",
  primaryDark: "#4338CA",

  // Gradient
  gradientStart: "#4F46E5",
  gradientMiddle: "#6366F1",
  gradientEnd: "#3B82F6",

  // Backgrounds
  background: "#FFFFFF",
  card: "#FFFFFF",
  surface: "#F5F7FB",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",

  // Border
  border: "#E5E7EB",
  borderDark: "#D1D5DB",
  skeleton: "#E5E7EB",

  // Status
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",

  // Misc
  white: "#FFFFFF",
  whiteOverlay: "rgba(255, 255, 255, 0.2)",
  black: "#000000",
  transparent: "transparent",

  // Aliases for existing components
  text: "#111827",
  secondary: "#3B82F6",
  backgroundSecondary: "rgba(59, 130, 246, 0.1)",
  tabActive: "#3B82F6",
  tabInactive: "#9CA3AF",
} as const;

export const BrandGradient = ["#7C3AED", "#6366F1", "#3B82F6"] as const;
