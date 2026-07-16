import { ChevronDown, ChevronUp, X } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "../../../../../components/common/Avatar";
import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";

import type { NewMessageContact } from "../types";

type Props = {
  contacts: NewMessageContact[];
  onRemove: (id: string) => void;
  scrollEnabled?: boolean;
};

const SelectedRecipients = ({
  contacts,
  onRemove,
  scrollEnabled = true,
}: Props) => {
  if (contacts.length === 0) {
    return null;
  }

  const [expanded, setExpanded] = useState<boolean>(true);

  const onToggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const keyExtractor = useCallback((item: NewMessageContact) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: NewMessageContact }) => {
      const onRemoveRecipient = () => {
        onRemove(item.id);
      };

      return (
        <View style={styles.recipientChip}>
          <Avatar
            name={item?.contactName}
            size={28}
            fontSize={FontSizes.xs - 1}
          />
          <Text style={styles.recipientName} numberOfLines={1}>
            {item?.contactName}
          </Text>
          <Pressable
            onPress={onRemoveRecipient}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.contactName}`}
          >
            <X size={14} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>
      );
    },
    [onRemove],
  );

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.selectedHeader}
        onPress={onToggleExpanded}
        accessibilityRole="button"
        accessibilityLabel="Toggle selected recipients"
      >
        <Text style={styles.selectedTitle}>Selected</Text>
        <View style={styles.selectedMeta}>
          <Text style={styles.selectedCount}>
            {contacts.length}{" "}
            {contacts.length === 1 ? "recipient" : "recipients"}
          </Text>
          {expanded ? (
            <ChevronUp size={18} color={Colors.primary} strokeWidth={2} />
          ) : (
            <ChevronDown size={18} color={Colors.primary} strokeWidth={2} />
          )}
        </View>
      </Pressable>

      {expanded ? (
        <FlatList
          horizontal
          data={contacts}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          scrollEnabled={scrollEnabled}
          renderItem={renderItem}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedTitle: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  selectedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  selectedCount: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.primary,
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  recipientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    maxWidth: Dimensions.width * 0.5,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingRight: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recipientName: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
});

export default memo(SelectedRecipients);
