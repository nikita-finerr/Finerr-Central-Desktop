const React = require("react");
const { View } = require("react-native");

const flexView = React.forwardRef(({ children, style, ...rest }, ref) =>
  React.createElement(
    View,
    { ...rest, ref, style: [{ flex: 1 }, style] },
    children,
  ),
);
flexView.displayName = "ScreensStubView";

const Screen = flexView;
const ScreenStack = flexView;
const ScreenStackItem = flexView;
const ScreenContainer = flexView;
const FullWindowOverlay = flexView;
const ScreenFooter = View;
const ScreenContentWrapper = flexView;
const ScreenStackHeaderSubview = View;
const ScreenStackHeaderLeftView = View;
const ScreenStackHeaderCenterView = View;
const ScreenStackHeaderRightView = View;
const ScreenStackHeaderSearchBarView = View;
const ScreenStackHeaderBackButtonImage = () => null;
const ScreenStackHeaderConfig = () => null;
const SearchBar = () => null;

module.exports = {
  enableScreens: () => {},
  enableFreeze: () => {},
  screensEnabled: () => false,
  freezeEnabled: () => false,
  compatibilityFlags: {
    isNewBackTitleImplementation: false,
    usesHeaderHeightCorrection: false,
  },
  Screen,
  InnerScreen: Screen,
  ScreenContext: React.createContext(Screen),
  ScreenContainer,
  ScreenStack,
  ScreenStackItem,
  FullWindowOverlay,
  ScreenFooter,
  ScreenContentWrapper,
  ScreenStackHeaderConfig,
  ScreenStackHeaderSubview,
  ScreenStackHeaderLeftView,
  ScreenStackHeaderCenterView,
  ScreenStackHeaderRightView,
  ScreenStackHeaderBackButtonImage,
  ScreenStackHeaderSearchBarView,
  SearchBar,
  isSearchBarAvailableForCurrentPlatform: false,
  // Some versions read these.
  NativeScreen: Screen,
  NativeScreenContainer: ScreenContainer,
  NativeScreenNavigationContainer: ScreenContainer,
};
