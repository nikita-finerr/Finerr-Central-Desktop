import { Dimensions as RNDimensions } from "react-native";
import DeviceInfo from "react-native-device-info";

const { width, height } = RNDimensions.get("window");

export const Dimensions = {
  width,
  height,
} as const;

export const APP_VERSION = DeviceInfo.getVersion() || "1.0.0";
