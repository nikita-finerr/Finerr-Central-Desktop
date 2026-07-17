const React = require("react");
const { ScrollView, View } = require("react-native");

const passthrough = ({ children }) =>
  React.createElement(React.Fragment, null, children);

const KeyboardAwareScrollView = React.forwardRef((props, ref) =>
  React.createElement(ScrollView, { ...props, ref }, props.children),
);
KeyboardAwareScrollView.displayName = "KeyboardAwareScrollView";

module.exports = {
  KeyboardProvider: passthrough,
  KeyboardAwareScrollView,
  KeyboardAvoidingView: View,
  KeyboardStickyView: View,
  KeyboardController: {
    setInputMode: () => {},
    setDefaultMode: () => {},
    dismiss: () => {},
    setFocusTo: () => {},
  },
  useKeyboardHandler: () => {},
  useKeyboardAnimation: () => ({
    height: { value: 0 },
    progress: { value: 0 },
  }),
  useReanimatedKeyboardAnimation: () => ({
    height: { value: 0 },
    progress: { value: 0 },
  }),
  useKeyboardController: () => ({ enabled: false, setEnabled: () => {} }),
  useKeyboardState: () => ({ isVisible: false, height: 0 }),
};
