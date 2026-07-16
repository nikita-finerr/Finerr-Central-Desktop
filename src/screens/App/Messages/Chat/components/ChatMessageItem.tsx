import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Spacing,
} from "../../../../../constants";
import type { ChatMessageDto } from "../../../../../types/message";
import { getMessageTime } from "../utils/buildChatList";
import { messageMatchesSearch } from "../utils/chatSearch";
import { hasMmsMedia } from "../utils/mmsMediaUrl";
import ImageBubble from "./ImageBubble";
import TextBubble from "./TextBubble";

type Props = {
  item: ChatMessageDto;
  searchQuery?: string;
  isSearchActive?: boolean;
  isActiveSearchMatch?: boolean;
};

const ChatMessageItem = ({
  item,
  searchQuery = "",
  isSearchActive = false,
  isActiveSearchMatch = false,
}: Props) => {
  const isOutbound = item.direction === "outbound";
  const time = getMessageTime(item.receivedDate);
  const isMatch = messageMatchesSearch(item, searchQuery);
  const shouldDim = isSearchActive && searchQuery.trim().length > 0 && !isMatch;
  const hasMedia = hasMmsMedia(item.mmsMediaUrl);

  const bubble = hasMedia ? (
      <ImageBubble
        item={item}
        isSearchMatch={isMatch}
        isActiveSearchMatch={isActiveSearchMatch}
      />
    ) : (
      <TextBubble
        item={item}
        searchQuery={searchQuery}
        isActiveSearchMatch={isActiveSearchMatch}
      />
    );

  if (isOutbound) {
    return (
      <View
        style={[styles.outboundWrap, shouldDim && styles.dimmed]}
        accessibilityLabel={isActiveSearchMatch ? "Active search result" : undefined}
      >
        {bubble}
        <Text style={[styles.time, { textAlign: "right" }]}>{time}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.inboundWrap, shouldDim && styles.dimmed]}
      accessibilityLabel={isActiveSearchMatch ? "Active search result" : undefined}
    >
      {bubble}
      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  outboundWrap: {
    alignSelf: "flex-end",
    maxWidth: Dimensions.width * 0.75,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs - 1,
    color: Colors.textSecondary,
  },
  inboundWrap: {
    alignSelf: "flex-start",
    gap: Spacing.xs,
    maxWidth: Dimensions.width * 0.75,
    marginBottom: Spacing.md,
  },
  dimmed: {
    opacity: 0.35,
  },
});

export default memo(ChatMessageItem);
