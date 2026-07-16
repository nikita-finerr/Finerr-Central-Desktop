import Constants from "expo-constants";
import { Dimensions as RNDimensions } from "react-native";

const { width, height } = RNDimensions.get("window");

export const Dimensions = {
  width,
  height,
} as const;

export const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
