import * as Application from "expo-application";
import { Platform } from "react-native";

export const getDeviceId = async () => {
  if (Platform.OS === "android") {
    return Application.getAndroidId();
  }

  if (Platform.OS === "ios") {
    const id = await Application.getIosIdForVendorAsync();
    if (id) {
      return id;
    }

    throw new Error("Unable to retrieve iOS device identifier.");
  }

  throw new Error(`Device ID is not supported on ${Platform.OS}.`);
};
