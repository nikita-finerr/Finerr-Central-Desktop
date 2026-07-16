import { Image, StyleSheet } from "react-native";

import { Images } from "../../constants";
import { memo } from "react";

const LOGO_ASPECT_RATIO = 226 / 60;

type Props = {
  width?: number;
};

const FinerrLogoMark = ({ width = 148 }: Props) => {
  return (
    <Image
      source={Images.logo}
      style={[styles.logo, { width, height: width / LOGO_ASPECT_RATIO }]}
      resizeMode="contain"
      accessibilityLabel="Finerr"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    alignSelf: "center",
  },
});

export default memo(FinerrLogoMark);
