import LinearGradient from "react-native-linear-gradient";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { View, Text, Image, StyleSheet, Animated, Easing, StatusBar } from "react-native";
import Svg, { Path, G } from "react-native-svg";

import { BrandGradient, Dimensions, Fonts, Images } from "../../constants";
import { APP_VERSION } from "../../constants/dimensions";

const LOGO_WHITE = Images.logoWhite;
const LOGO_DOT = Images.logoDot;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions;
const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.54, 212);
const LOGO_ASPECT_RATIO = 226 / 60;
const LOGO_HEIGHT = LOGO_WIDTH / LOGO_ASPECT_RATIO;

const DOT_CENTER_X = LOGO_WIDTH * 0.2345;
const DOT_CENTER_Y = LOGO_HEIGHT * 0.1;

const SPLASH_FADE_MS = 500;
export const SPLASH_TOTAL_MS = 2800;

const SPLASH_HERO = {
  purple: BrandGradient[0],
  gradientStart: BrandGradient[0],
  gradientMiddle: BrandGradient[1],
  gradientEnd: BrandGradient[2],
  blue: BrandGradient[2],
};

const ACCENT_BLUE = "#25B5FF";

const WavePattern = ({ drift }: { drift: Animated.Value }) => {
  const waves = [
    `M0 ${SCREEN_HEIGHT * 0.22} C ${SCREEN_WIDTH * 0.25} ${SCREEN_HEIGHT * 0.16}, ${SCREEN_WIDTH * 0.55} ${SCREEN_HEIGHT * 0.28}, ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.2}`,
    `M0 ${SCREEN_HEIGHT * 0.38} C ${SCREEN_WIDTH * 0.3} ${SCREEN_HEIGHT * 0.32}, ${SCREEN_WIDTH * 0.65} ${SCREEN_HEIGHT * 0.44}, ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.36}`,
    `M0 ${SCREEN_HEIGHT * 0.54} C ${SCREEN_WIDTH * 0.2} ${SCREEN_HEIGHT * 0.48}, ${SCREEN_WIDTH * 0.72} ${SCREEN_HEIGHT * 0.6}, ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.52}`,
    `M0 ${SCREEN_HEIGHT * 0.7} C ${SCREEN_WIDTH * 0.35} ${SCREEN_HEIGHT * 0.64}, ${SCREEN_WIDTH * 0.6} ${SCREEN_HEIGHT * 0.76}, ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.68}`,
    `M0 ${SCREEN_HEIGHT * 0.86} C ${SCREEN_WIDTH * 0.28} ${SCREEN_HEIGHT * 0.8}, ${SCREEN_WIDTH * 0.68} ${SCREEN_HEIGHT * 0.92}, ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.84}`,
  ];

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
      pointerEvents="none"
    >
      <Svg width={SCREEN_WIDTH + 20} height={SCREEN_HEIGHT}>
        <G opacity={0.07}>
          {waves.map((d, index) => (
            <Path
              key={index}
              d={d}
              stroke="#FFFFFF"
              strokeWidth={1.2}
              fill="none"
            />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
};

const PulseRing = ({
  progress,
  size,
  color,
}: {
  progress: Animated.Value;
  size: number;
  color: string;
}) => {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 2.6],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.55, 0],
  });

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          opacity,
          transform: [{ scale }],
        },
      ]}
      pointerEvents="none"
    />
  );
};

const AnimatedFinerrLogo = ({
  wordmarkOpacity,
  wordmarkScale,
  dotScale,
  dotOpacity,
  dotGlowScale,
  dotGlowOpacity,
  shimmerX,
  logoGlowScale,
  logoGlowOpacity,
  ring1,
  ring2,
}: {
  wordmarkOpacity: Animated.Value;
  wordmarkScale: Animated.Value;
  dotScale: Animated.Value;
  dotOpacity: Animated.Value;
  dotGlowScale: Animated.Value;
  dotGlowOpacity: Animated.Value;
  shimmerX: Animated.Value;
  logoGlowScale: Animated.Value;
  logoGlowOpacity: Animated.Value;
  ring1: Animated.Value;
  ring2: Animated.Value;
}) => {
  const shimmerTranslate = shimmerX.interpolate({
    inputRange: [0, 1],
    outputRange: [-LOGO_WIDTH * 0.4, LOGO_WIDTH * 1.4],
  });

  return (
    <View style={styles.logoStage}>
      <View
        style={[styles.pulseAnchor, { left: DOT_CENTER_X, top: DOT_CENTER_Y }]}
        pointerEvents="none"
      >
        <PulseRing progress={ring1} size={36} color="rgba(255,255,255,0.35)" />
        <PulseRing progress={ring2} size={36} color={ACCENT_BLUE} />
      </View>

      <Animated.View
        style={[
          styles.logoAura,
          {
            opacity: logoGlowOpacity,
            transform: [{ scale: logoGlowScale }],
          },
        ]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.dotGlowBurst,
          {
            left: DOT_CENTER_X - 28,
            top: DOT_CENTER_Y - 28,
            opacity: dotGlowOpacity,
            transform: [{ scale: dotGlowScale }],
          },
        ]}
        pointerEvents="none"
      />

      <View style={styles.logoCanvas}>
        <Animated.View
          style={{
            opacity: wordmarkOpacity,
            transform: [{ scale: wordmarkScale }],
          }}
        >
          <Image
            source={LOGO_WHITE}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Finerr"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.dotLayer,
            {
              opacity: dotOpacity,
              transform: [
                { translateX: DOT_CENTER_X },
                { translateY: DOT_CENTER_Y },
                { scale: dotScale },
                { translateX: -DOT_CENTER_X },
                { translateY: -DOT_CENTER_Y },
              ],
            },
          ]}
        >
          <Image
            source={LOGO_DOT}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.shimmerTrack,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255, 255, 255, 0.05)",
              "rgba(255, 255, 255, 0.42)",
              "rgba(255, 255, 255, 0.05)",
              "transparent",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerBand}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const SplashLoader = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    const animations = [pulse(dot1, 0), pulse(dot2, 120), pulse(dot3, 240)];
    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.loader}>
      <Animated.View style={[styles.loaderDot, { opacity: dot1 }]} />
      <Animated.View style={[styles.loaderDot, { opacity: dot2 }]} />
      <Animated.View style={[styles.loaderDot, { opacity: dot3 }]} />
    </View>
  );
};

type Props = {
  onComplete?: () => void;
  /** When false, splash holds visible after intro animation until navigation is ready. */
  isAppReady?: boolean;
};

const AppSplashScreen = ({ onComplete, isAppReady = true }: Props) => {
  const waveDrift = useRef(new Animated.Value(0)).current;
  const orbPulse = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkScale = useRef(new Animated.Value(0.92)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const dotGlowScale = useRef(new Animated.Value(0)).current;
  const dotGlowOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(0)).current;
  const logoGlowScale = useRef(new Animated.Value(0.85)).current;
  const logoGlowOpacity = useRef(new Animated.Value(0)).current;
  const tagline1Opacity = useRef(new Animated.Value(0)).current;
  const tagline1Y = useRef(new Animated.Value(12)).current;
  const tagline2Opacity = useRef(new Animated.Value(0)).current;
  const tagline2Y = useRef(new Animated.Value(10)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const [introComplete, setIntroComplete] = useState(false);
  const hasDismissed = useRef(false);

  const dismissSplash = useCallback(() => {
    if (hasDismissed.current) return;
    hasDismissed.current = true;

    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: SPLASH_FADE_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onComplete?.();
      }
    });
  }, [onComplete, screenOpacity]);

  useEffect(() => {
    if (introComplete && isAppReady) {
      dismissSplash();
    }
  }, [introComplete, isAppReady, dismissSplash]);

  useEffect(() => {
    let animationDone = false;
    let minTimeDone = false;

    const markIntroComplete = () => {
      if (animationDone && minTimeDone) {
        setIntroComplete(true);
      }
    };

    const minIntroTimer = setTimeout(() => {
      minTimeDone = true;
      markIntroComplete();
    }, SPLASH_TOTAL_MS - SPLASH_FADE_MS);

    const ambientLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(waveDrift, {
          toValue: 1,
          duration: 4800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(waveDrift, {
          toValue: 0,
          duration: 4800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const ringPulse = (value: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration: 880,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

    const sequence = Animated.parallel([
      ringPulse(ring1, 0),
      ringPulse(ring2, 520),
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkScale, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoGlowOpacity, {
        toValue: 0.75,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(460),
        Animated.parallel([
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(dotScale, {
            toValue: 1,
            friction: 5,
            tension: 190,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(420),
        Animated.parallel([
          Animated.timing(dotGlowOpacity, {
            toValue: 0.9,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(dotGlowScale, {
            toValue: 1,
            duration: 480,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(dotGlowOpacity, {
          toValue: 0,
          duration: 340,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(780),
        Animated.timing(shimmerX, {
          toValue: 1,
          duration: 620,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(860),
        Animated.timing(logoGlowScale, {
          toValue: 1.07,
          duration: 380,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoGlowScale, {
          toValue: 1,
          duration: 380,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(1180),
        Animated.parallel([
          Animated.timing(tagline1Opacity, {
            toValue: 1,
            duration: 440,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(tagline1Y, {
            toValue: 0,
            duration: 440,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(1340),
        Animated.parallel([
          Animated.timing(tagline2Opacity, {
            toValue: 1,
            duration: 440,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(tagline2Y, {
            toValue: 0,
            duration: 440,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(1520),
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    ambientLoop.start();
    waveLoop.start();
    sequence.start(({ finished }) => {
      if (finished) {
        animationDone = true;
        markIntroComplete();
      }
    });

    return () => {
      clearTimeout(minIntroTimer);
      ambientLoop.stop();
      waveLoop.stop();
      sequence.stop();
    };
  }, [
    dotGlowOpacity,
    dotGlowScale,
    dotOpacity,
    dotScale,
    footerOpacity,
    logoGlowOpacity,
    logoGlowScale,
    orbPulse,
    ring1,
    ring2,
    shimmerX,
    tagline1Opacity,
    tagline1Y,
    tagline2Opacity,
    tagline2Y,
    waveDrift,
    wordmarkOpacity,
    wordmarkScale,
  ]);

  const orbScale = orbPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const orbOpacity = orbPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.14, 0.22],
  });

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
        <LinearGradient
          colors={[
            SPLASH_HERO.purple,
            SPLASH_HERO.gradientStart,
            SPLASH_HERO.gradientMiddle,
            SPLASH_HERO.gradientEnd,
            SPLASH_HERO.blue,
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />

        <WavePattern drift={waveDrift} />

        <Animated.View
          style={[
            styles.ambientOrbTop,
            { opacity: orbOpacity, transform: [{ scale: orbScale }] },
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            styles.ambientOrbCenter,
            {
              opacity: orbOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.06, 0.1],
              }),
              transform: [{ scale: orbScale }],
            },
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            styles.ambientOrbBottom,
            { opacity: orbOpacity, transform: [{ scale: orbScale }] },
          ]}
          pointerEvents="none"
        />

        <View style={styles.stage}>
          <AnimatedFinerrLogo
            wordmarkOpacity={wordmarkOpacity}
            wordmarkScale={wordmarkScale}
            dotScale={dotScale}
            dotOpacity={dotOpacity}
            dotGlowScale={dotGlowScale}
            dotGlowOpacity={dotGlowOpacity}
            shimmerX={shimmerX}
            logoGlowScale={logoGlowScale}
            logoGlowOpacity={logoGlowOpacity}
            ring1={ring1}
            ring2={ring2}
          />

          <View style={styles.taglineWrap}>
            <Animated.Text
              style={[
                styles.taglinePrimary,
                {
                  opacity: tagline1Opacity,
                  transform: [{ translateY: tagline1Y }],
                },
              ]}
            >
              One Platform.
            </Animated.Text>
            <Animated.Text
              style={[
                styles.taglineSecondary,
                {
                  opacity: tagline2Opacity,
                  transform: [{ translateY: tagline2Y }],
                },
              ]}
            >
              Every Conversation.
            </Animated.Text>
          </View>
        </View>

        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <SplashLoader />
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  ambientOrbTop: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(167, 139, 250, 0.16)",
  },
  ambientOrbCenter: {
    position: "absolute",
    top: "38%",
    left: "50%",
    width: 320,
    height: 320,
    marginLeft: -160,
    marginTop: -160,
    borderRadius: 160,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  ambientOrbBottom: {
    position: "absolute",
    bottom: -120,
    left: -90,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(91, 140, 255, 0.14)",
  },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoStage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  logoAura: {
    position: "absolute",
    width: LOGO_WIDTH + 72,
    height: LOGO_HEIGHT + 40,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 36,
  },
  dotGlowBurst: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(37, 181, 255, 0.35)",
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 22,
    zIndex: 1,
  },
  pulseAnchor: {
    position: "absolute",
    zIndex: 0,
  },
  pulseRing: {
    position: "absolute",
    marginLeft: -18,
    marginTop: -18,
    borderWidth: 1.5,
  },
  logoCanvas: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    overflow: "hidden",
  },
  dotLayer: {
    ...StyleSheet.absoluteFill,
  },
  logoImage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  shimmerTrack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: LOGO_WIDTH * 0.55,
  },
  shimmerBand: {
    flex: 1,
  },
  taglineWrap: {
    marginTop: 36,
    alignItems: "center",
    gap: 4,
  },
  taglinePrimary: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: "#FFFFFF",
    textAlign: "center",
  },
  taglineSecondary: {
    fontFamily: Fonts.regular,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: "rgba(255, 255, 255, 0.82)",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 12,
  },
  loader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  loaderDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  version: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: "rgba(255, 255, 255, 0.45)",
    textAlign: "center",
  },
});

export default memo(AppSplashScreen);
