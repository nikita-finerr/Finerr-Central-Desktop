const React = require("react");
const { View } = require("react-native");

const LinearGradient = React.forwardRef(
  ({ children, style, colors, ...rest }, ref) => {
    const backgroundColor =
      Array.isArray(colors) && colors.length > 0 ? colors[0] : undefined;

    return React.createElement(
      View,
      {
        ...rest,
        ref,
        style: [{ backgroundColor }, style],
      },
      children,
    );
  },
);
LinearGradient.displayName = "LinearGradient";

module.exports = LinearGradient;
module.exports.default = LinearGradient;
