export const DeepLinkValues = {
  ResetPassword: "resetPassword",
} as const;

export type DeepLinkValue =
  (typeof DeepLinkValues)[keyof typeof DeepLinkValues];
