import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Fonts, FontSizes } from "../../constants";
import { getAvatarColors, getNameInitials } from "../../utils/avatarColors";

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

const Avatar = ({
  name = "",
  size = 50,
  backgroundColor,
  textColor,
  fontSize = FontSizes.md,
}: AvatarProps) => {
  const initials = getNameInitials(name);
  const colors = useMemo(() => getAvatarColors(name), [name]);

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor ?? colors.backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          {
            fontSize,
            color: textColor ?? colors.textColor,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    textAlign: "center",
    letterSpacing: 1,
    fontFamily: Fonts.semiBold,
  },
});

export default memo(Avatar);
