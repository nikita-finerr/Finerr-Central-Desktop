const React = require("react");
const { Text } = require("react-native");

function createIconSet() {
  const Icon = ({ name, size = 24, color = "#000", style, ...rest }) =>
    React.createElement(
      Text,
      { ...rest, style: [{ fontSize: size, color, lineHeight: size }, style] },
      typeof name === "string" ? name.slice(0, 1).toUpperCase() : "•",
    );
  Icon.displayName = "VectorIconStub";
  return Icon;
}

module.exports = createIconSet;
module.exports.default = createIconSet;
