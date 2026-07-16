import type { ResetPasswordDeepLinkParams } from "../../utils/resetPasswordDeepLink";

export type PendingAuthDeepLink = {
  route: "ResetPassword";
  params: ResetPasswordDeepLinkParams;
};

type PendingListener = () => void;

let pendingAuthDeepLink: PendingAuthDeepLink | null = null;
const pendingListeners = new Set<PendingListener>();

const notifyPendingListeners = (): void => {
  pendingListeners.forEach((listener) => listener());
};

export const setPendingAuthDeepLink = (link: PendingAuthDeepLink): void => {
  pendingAuthDeepLink = link;
  notifyPendingListeners();
};

export const peekPendingAuthDeepLink = (): PendingAuthDeepLink | null => {
  return pendingAuthDeepLink;
};

export const clearPendingAuthDeepLink = (): void => {
  pendingAuthDeepLink = null;
};

export const subscribePendingAuthDeepLink = (
  listener: PendingListener,
): (() => void) => {
  pendingListeners.add(listener);
  return () => {
    pendingListeners.delete(listener);
  };
};

export const consumePendingAuthDeepLink = (): PendingAuthDeepLink | null => {
  const next = pendingAuthDeepLink;
  pendingAuthDeepLink = null;
  return next;
};
