const macosUnsupported = [
  // Claims osx in podspec but sources import UIKit / iOS-only APIs.
  "react-native-webrtc",
  "@react-native-firebase/app",
  "@react-native-firebase/messaging",
  // iOS-only / not linked for macOS — keep out of Fabric codegen.
  "react-native-bootsplash",
  "react-native-screens",
  "react-native-keyboard-controller",
  "react-native-haptic-feedback",
  "react-native-biometrics",
  "react-native-appsflyer",
  "@notifee/react-native",
  "@react-native-documents/picker",
  "react-native-image-picker",
  "react-native-date-picker",
  "@react-native-community/datetimepicker",
  "react-native-blob-util",
  "react-native-audio-recorder-player",
  "react-native-device-info",
  "react-native-linear-gradient",
  "react-native-vector-icons",
];

const isMacosPodInstall =
  process.env.MACOS_POD_INSTALL === "1" ||
  process.argv.some((arg) => arg.includes("macos"));

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: [
    "./assets/fonts/Inter-Regular.ttf",
    "./assets/fonts/Inter-Medium.ttf",
    "./assets/fonts/Inter-SemiBold.ttf",
    "./assets/fonts/Inter-Bold.ttf",
  ],
  dependencies: Object.fromEntries(
    macosUnsupported.map((name) => [
      name,
      {
        platforms: {
          // macOS autolinking reads the `ios` platform key, then filters by podspec.
          // Nulling ios here is only applied during macos pod install.
          ...(isMacosPodInstall ? { ios: null } : {}),
        },
      },
    ]),
  ),
};
