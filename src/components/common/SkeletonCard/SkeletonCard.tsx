import { memo, useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";

import { Colors } from "../../../constants";

type SkeletonCardProps = {
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  skeletonColor?: string;
};

const SkeletonCard = ({
  style,
  borderRadius = 0,
  skeletonColor,
}: SkeletonCardProps) => {
  const pulse = useRef(new Animated.Value(0.38)).current;
  const fill = skeletonColor ?? Colors.skeleton;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.72,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.32,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.base,
        {
          backgroundColor: fill,
          borderRadius,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});

export default memo(SkeletonCard);
