import LinearGradient from "react-native-linear-gradient";
import { StyleSheet, View } from "react-native";

import {
  BrandGradient,
  Colors,
  Fonts,
  FontSizes,
  Radius,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { ChatMessageDto } from "../../../../../types/message";
import { memo } from "react";
import HighlightedMessageText from "./HighlightedMessageText";

type Props = {
  item: ChatMessageDto;
  searchQuery?: string;
  isActiveSearchMatch?: boolean;
};

const TextBubble = ({
  item,
  searchQuery = "",
  isActiveSearchMatch = false,
}: Props) => {
  const isOutbound = item.direction === "outbound";
  const isSearching = searchQuery.trim().length > 0;

  if (isOutbound) {
    return (
      <LinearGradient
        colors={[...BrandGradient]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.textBubbleOutbound}
      >
        <HighlightedMessageText
          text={item?.message}
          query={searchQuery}
          isActiveMatch={isActiveSearchMatch}
          isOutbound
          style={styles.textOutbound}
        />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.textBubbleInbound}>
      <HighlightedMessageText
        text={item?.message}
        query={isSearching ? searchQuery : ""}
        isActiveMatch={isActiveSearchMatch}
        style={styles.textInbound}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textBubbleInbound: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    paddingHorizontal: 0.75 * globalStyleDefinitions.cardInnerPadding.padding,
    paddingVertical: 0.75 * globalStyleDefinitions.cardInnerPadding.padding,
    overflow: "hidden",
  },
  textBubbleOutbound: {
    borderRadius: Radius.lg,
    paddingHorizontal: 0.75 * globalStyleDefinitions.cardInnerPadding.padding,
    paddingVertical: 0.75 * globalStyleDefinitions.cardInnerPadding.padding,
    overflow: "hidden",
  },
  textInbound: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm + 5,
    color: Colors.textPrimary,
  },
  textOutbound: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm + 5,
    color: Colors.white,
  },
});

export default memo(TextBubble);
