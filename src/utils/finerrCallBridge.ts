import { NativeModules, Platform } from "react-native";

type FinerrCallBridgeModule = {
  dismissIncomingCallAlert: () => Promise<boolean>;
  configureCallAudio?: () => Promise<boolean>;
  releaseCallAudio?: () => Promise<boolean>;
  setSpeakerEnabled?: (enabled: boolean) => Promise<boolean>;
  isSpeakerEnabled?: () => Promise<boolean>;
};

const FinerrCallBridge = NativeModules.FinerrCallBridge as
  | FinerrCallBridgeModule
  | undefined;

export const dismissIncomingCallAlert = async (): Promise<void> => {
  if (Platform.OS !== "android" || !FinerrCallBridge?.dismissIncomingCallAlert) {
    return;
  }

  try {
    await FinerrCallBridge.dismissIncomingCallAlert();
  } catch {
    // Ignore native bridge errors during cleanup.
  }
};

export const configureExtensionCallAudio = async (): Promise<boolean> => {
  if (Platform.OS !== "android" || !FinerrCallBridge?.configureCallAudio) {
    return false;
  }

  try {
    return Boolean(await FinerrCallBridge.configureCallAudio());
  } catch {
    return false;
  }
};

export const releaseExtensionCallAudio = async (): Promise<void> => {
  if (Platform.OS !== "android" || !FinerrCallBridge?.releaseCallAudio) {
    return;
  }

  try {
    await FinerrCallBridge.releaseCallAudio();
  } catch {
    // Ignore native bridge errors.
  }
};

export const setExtensionSpeakerEnabled = async (
  enabled: boolean,
): Promise<boolean> => {
  if (Platform.OS !== "android" || !FinerrCallBridge?.setSpeakerEnabled) {
    return enabled;
  }

  try {
    return Boolean(await FinerrCallBridge.setSpeakerEnabled(enabled));
  } catch {
    return false;
  }
};

export const isExtensionSpeakerEnabled = async (): Promise<boolean> => {
  if (Platform.OS !== "android" || !FinerrCallBridge?.isSpeakerEnabled) {
    return false;
  }

  try {
    return Boolean(await FinerrCallBridge.isSpeakerEnabled());
  } catch {
    return false;
  }
};

export const toggleExtensionSpeaker = async (
  currentEnabled?: boolean,
): Promise<boolean> => {
  const enabled =
    typeof currentEnabled === "boolean"
      ? currentEnabled
      : await isExtensionSpeakerEnabled();
  return setExtensionSpeakerEnabled(!enabled);
};
