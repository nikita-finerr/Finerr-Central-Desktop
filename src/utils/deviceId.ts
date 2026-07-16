import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export const getDeviceId = async () => {
  if (Platform.OS === "android") {
    return DeviceInfo.getAndroidId();
  }

  if (Platform.OS === "ios") {
    const id = await DeviceInfo.getUniqueId();
    if (id) {
      return id;
    }

    throw new Error("Unable to retrieve iOS device identifier.");
  }

  throw new Error(`Device ID is not supported on ${Platform.OS}.`);
};
