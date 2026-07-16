const fs = require("fs");
const path = require("path");

function loadDotEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    return env;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim().replace(/^export\s+/, "");
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

const envFromFile = loadDotEnvFile(path.join(__dirname, ".env"));

/** Inline `process.env.KEY` from `.env` at bundle time (Expo-style EXPO_PUBLIC_*). */
function inlineDotEnvPlugin({ types: t }) {
  return {
    name: "inline-dotenv-from-file",
    visitor: {
      MemberExpression(nodePath) {
        if (!nodePath.get("object").matchesPattern("process.env")) {
          return;
        }

        const { property } = nodePath.node;
        let key = null;
        if (t.isIdentifier(property) && !nodePath.node.computed) {
          key = property.name;
        } else if (t.isStringLiteral(property)) {
          key = property.value;
        }
        if (!key || !(key in envFromFile)) {
          return;
        }

        nodePath.replaceWith(t.stringLiteral(envFromFile[key]));
      },
    },
  };
}

module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [inlineDotEnvPlugin, "react-native-reanimated/plugin"],
};
