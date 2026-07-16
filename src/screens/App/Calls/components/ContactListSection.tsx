import { ChevronDown, ChevronUp } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Spacing,
} from "../../../../constants";
import type { CallContactSection } from "../data/callContacts";
import ContactListCard from "./ContactListCard";

type Props = {
  section: CallContactSection;
  expanded: boolean;
  onToggle: () => void;
};

const ContactListSection = ({ section, expanded, onToggle }: Props) => {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.header}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${section.label} contacts`}
      >
        <Text style={styles.heading}>{section.label}</Text>
        {expanded ? (
          <ChevronUp size={18} color={Colors.textSecondary} strokeWidth={2} />
        ) : (
          <ChevronDown size={18} color={Colors.textSecondary} strokeWidth={2} />
        )}
      </Pressable>

      {expanded ? (
        <View style={styles.card}>
          {section.items.map((contact, index) => (
            <View key={contact.id}>
              <ContactListCard contact={contact} />
              {index < section.items.length - 1 ? (
                <View style={styles.separator} />
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xs,
  },
  heading: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    overflow: "hidden",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
});

export default memo(ContactListSection);
