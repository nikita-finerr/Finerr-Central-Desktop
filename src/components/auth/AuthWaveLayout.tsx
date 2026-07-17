import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { memo, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { G, Path } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";

import { BrandGradient, Colors, Dimensions, Spacing } from "../../constants";
import FinerrLogoMark from "./FinerrLogoMark";

const WAVE_HEIGHT = Dimensions.height * 0.035;
const HEADER_HEIGHT =
  Platform.OS === "macos"
    ? Math.min(Dimensions.height * 0.14, 120)
    : Dimensions.height * 0.2;
const BANNER_HEIGHT = HEADER_HEIGHT + WAVE_HEIGHT;
const LOGO_WIDTH =
  Platform.OS === "macos"
    ? Math.min(Dimensions.width * 0.28, 180)
    : Dimensions.width * 0.38;
const CONTENT_TOP_SPACING = Dimensions.height * 0.033;
const PINNED_FOOTER_SCROLL_PADDING =
  Platform.OS === "macos"
    ? Math.max(Dimensions.height * 0.1, 72)
    : Dimensions.height * 0.14;
const PATTERN_OPACITY = 0.14;

const TopographicPattern = () => {
  const lines = [
    "M-20 48 C 60 20, 140 76, 220 48 S 380 20, 460 48 S 620 76, 700 48",
    "M-20 88 C 80 58, 160 118, 260 88 S 420 58, 520 88 S 680 118, 780 88",
    "M-20 128 C 70 98, 150 158, 250 128 S 410 98, 510 128 S 670 158, 770 128",
    "M-20 168 C 90 138, 170 198, 270 168 S 430 138, 530 168 S 690 198, 790 168",
    "M-20 208 C 65 178, 145 238, 245 208 S 405 178, 505 208 S 665 238, 765 208",
  ];

  return (
    <Svg width={Dimensions.width} height={BANNER_HEIGHT} style={styles.pattern}>
      <G opacity={PATTERN_OPACITY}>
        {lines.map((d, index) => (
          <Path
            key={index}
            d={d}
            stroke="#FFFFFF"
            strokeWidth={1.1}
            fill="none"
          />
        ))}
      </G>
    </Svg>
  );
};

const createWavePath = (): string => {
  const width = Dimensions.width;
  const fillDepth = WAVE_HEIGHT + 8;
  const leftControlY = WAVE_HEIGHT * -0.25;
  const rightControlY = WAVE_HEIGHT * 2;

  return [
    `M 0 ${WAVE_HEIGHT}`,
    `C ${width * 0.22} ${leftControlY}, ${width * 0.78} ${rightControlY}, ${width} ${WAVE_HEIGHT}`,
    `L ${width} ${fillDepth}`,
    `L 0 ${fillDepth}`,
    "Z",
  ].join(" ");
};

const WaveDivider = () => {
  const fillDepth = WAVE_HEIGHT + 8;

  return (
    <Svg
      width={Dimensions.width}
      height={fillDepth}
      style={styles.wave}
      pointerEvents="none"
    >
      <Path d={createWavePath()} fill={Colors.card} />
    </Svg>
  );
};

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

const AuthWaveLayout = ({ children, footer }: Props) => {
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = PINNED_FOOTER_SCROLL_PADDING + insets.bottom;
  const isMacos = Platform.OS === "macos";

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          { height: BANNER_HEIGHT, paddingTop: insets.top + Spacing.md },
        ]}
      >
        <LinearGradient
          colors={[...BrandGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <TopographicPattern />
        <View
          style={[styles.logoWrap, { paddingBottom: WAVE_HEIGHT + Spacing.md }]}
        >
          <FinerrLogoMark width={LOGO_WIDTH} />
        </View>
        <WaveDivider />
      </View>

      <View style={styles.body}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: CONTENT_TOP_SPACING,
              paddingBottom: scrollBottomPadding,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={isMacos}
          bounces={!isMacos}
        >
          {children}
        </KeyboardAwareScrollView>

        {footer ? (
          <View
            style={[
              styles.pinnedFooter,
              {
                paddingBottom: Math.max(insets.bottom, Spacing.md) + Spacing.sm,
              },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  header: {
    overflow: "hidden",
  },
  pattern: {
    ...StyleSheet.absoluteFill,
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wave: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxxl - 4,
  },
  pinnedFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xxxl - 4,
    paddingTop: Spacing.md,
    backgroundColor: Colors.card,
  },
});

export default memo(AuthWaveLayout);
