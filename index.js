/**
 * @format
 */
import "react-native-gesture-handler";
import { AppRegistry, Platform } from "react-native";
import { enableScreens } from "react-native-screens";
import App from "./src/App";
import { name as appName } from "./app.json";

// react-native-screens is not linked on macOS — use JS fallbacks.
if (Platform.OS === "macos") {
  enableScreens(false);
}

AppRegistry.registerComponent(appName, () => App);
