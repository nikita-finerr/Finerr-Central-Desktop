import { X } from "lucide-react-native";
import { memo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "../../../../../components/common/Avatar";
import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import type { TelnyxFaxNumberDto } from "../../../../../types/fax";
import { getTelnyxFaxContactLabel } from "../data/telnyxFaxContacts";

type Props = {
  contacts: TelnyxFaxNumberDto[];
  onRemove: (id: number) => void;
  scrollEnabled?: boolean;
};

const FaxRecipientCarousel = ({
  contacts,
  onRemove,
  scrollEnabled = true,
}: Props) => {
  if (contacts.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Recipient</Text>
        <Text style={styles.hint}>Search below to add a fax recipient.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Recipient</Text>
      <FlatList
        horizontal
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const label = getTelnyxFaxContactLabel(item);

          return (
            <View style={styles.contactCard}>
              <Pressable
                style={styles.removeButton}
                onPress={() => onRemove(item.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${label}`}
              >
                <X size={12} color={Colors.textSecondary} strokeWidth={2.5} />
              </Pressable>
              <Avatar name={label} size={48} fontSize={FontSizes.sm} />
              <Text style={styles.contactName} numberOfLines={2}>
                {label}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  list: {
    gap: Spacing.md,
    paddingRight: Spacing.sm,
  },
  contactCard: {
    width: 88,
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    zIndex: 1,
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactName: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: FontSizes.xs * 1.35,
  },
});

export default memo(FaxRecipientCarousel);
