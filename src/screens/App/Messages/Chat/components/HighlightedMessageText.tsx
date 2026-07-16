import { memo, useCallback, useMemo } from "react";
import { Linking, StyleSheet, Text, type TextStyle } from "react-native";

import { Colors, Fonts } from "../../../../../constants";
import { splitTextByQuery } from "../utils/chatSearch";
import { parseMessageText } from "../utils/parseMessageText";

type Props = {
  text: string;
  query: string;
  isActiveMatch: boolean;
  isOutbound?: boolean;
  style: TextStyle;
};

const HighlightedMessageText = ({
  text,
  query,
  isActiveMatch,
  isOutbound = false,
  style,
}: Props) => {
  const parts = useMemo(() => parseMessageText(text), [text]);
  const normalizedQuery = query.trim();

  const openLink = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore unsupported URLs.
    }
  }, []);

  const renderTextSegment = useCallback(
    (segment: string, keyPrefix: string) => {
      if (!normalizedQuery) {
        return segment;
      }

      return splitTextByQuery(segment, normalizedQuery).map((part, index) =>
        part.match ? (
          <Text
            key={`${keyPrefix}-match-${index}`}
            style={[styles.highlight, isActiveMatch && styles.highlightActive]}
          >
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      );
    },
    [isActiveMatch, normalizedQuery],
  );

  return (
    <Text style={style}>
      {parts?.map((part, index) => {
        if (part?.type === "link" && part?.url) {
          return (
            <Text
              key={`link-${index}-${part.url}`}
              style={[
                isOutbound ? styles.linkOutbound : styles.linkInbound,
                part?.boldLink && styles?.boldLink,
              ]}
              onPress={() => void openLink(part.url!)}
              accessibilityRole="link"
            >
              {renderTextSegment(part?.text, `link-${index}`)}
            </Text>
          );
        }

        return (
          <Text key={`text-${index}`}>
            {renderTextSegment(part?.text, `text-${index}`)}
          </Text>
        );
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: Colors.warning + "55",
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
  },
  highlightActive: {
    backgroundColor: Colors.warning,
  },
  linkInbound: {
    color: Colors.secondary,
    textDecorationLine: "underline",
  },
  linkOutbound: {
    color: Colors.white,
    textDecorationLine: "underline",
  },
  boldLink: {
    fontFamily: Fonts.semiBold,
  },
});

export default memo(HighlightedMessageText);
