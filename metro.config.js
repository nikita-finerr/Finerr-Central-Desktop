const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");
const { resolve: metroResolve } = require("metro-resolver");

const macosPackageStubs = {
  "react-native-haptic-feedback": "haptic-feedback.js",
  "react-native-keyboard-controller": "keyboard-controller.js",
  "react-native-linear-gradient": "linear-gradient.js",
  "react-native-vector-icons/Ionicons": "Ionicons.js",
  "@react-native-documents/picker": "documents-picker.js",
  "react-native-image-picker": "image-picker.js",
  "react-native-date-picker": "date-picker.js",
  "react-native-blob-util": "blob-util.js",
  "react-native-audio-recorder-player": "audio-recorder-player.js",
  "react-native-screens": "screens.js",
};

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration for iOS/Android + react-native-macos.
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    platforms: ["macos", "ios", "android"],
    resolveRequest: (context, moduleName, platform) => {
      if (platform === "macos" && macosPackageStubs[moduleName]) {
        return {
          filePath: path.resolve(
            __dirname,
            "src/macos-stubs",
            macosPackageStubs[moduleName],
          ),
          type: "sourceFile",
        };
      }

      // Out-of-tree platform: resolve react-native → react-native-macos,
      // and pair it with the React version RN-macOS expects (19.1.x).
      let resolvedName = moduleName;
      if (platform === "macos") {
        if (moduleName === "react-native") {
          resolvedName = "react-native-macos";
        } else if (moduleName.startsWith("react-native/")) {
          resolvedName = `react-native-macos/${moduleName.slice(
            "react-native/".length,
          )}`;
        } else if (moduleName === "react") {
          resolvedName = "react-for-macos";
        } else if (moduleName.startsWith("react/")) {
          resolvedName = `react-for-macos/${moduleName.slice("react/".length)}`;
        }
      }

      // Avoid recursing into this custom resolver (breaks .macos.* resolution).
      const previousResolveRequest = context.resolveRequest;
      delete context.resolveRequest;
      try {
        return metroResolve(context, resolvedName, platform);
      } finally {
        context.resolveRequest = previousResolveRequest;
      }
    },
  },
  serializer: {
    getModulesRunBeforeMainModule: () => {
      const modules = [];
      try {
        modules.push(
          require.resolve("react-native/Libraries/Core/InitializeCore"),
        );
      } catch {
        // ignore
      }
      try {
        modules.push(
          require.resolve("react-native-macos/Libraries/Core/InitializeCore"),
        );
      } catch {
        // ignore
      }
      return modules;
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
