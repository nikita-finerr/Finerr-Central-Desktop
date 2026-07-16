import { MessageSquare, Phone } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { NavigationProp, useNavigation } from "@react-navigation/native";
import Avatar from "../../../../components/common/Avatar";
import {
  AppRoutes,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useOutboundCall } from "../../../../providers/OutboundCallProvider";
import type { ChatContactDto } from "../../../../types/contact";
import {
  getCallContactName,
  getCallContactPhoneDisplay,
} from "../data/callContacts";

type Props = {
  contact: ChatContactDto;
};

const ContactListCard = ({ contact }: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { canManageCalls, canViewMessages } = usePermissions();
  const { dial } = useOutboundCall();

  const name = getCallContactName(contact);
  const phoneDisplay = getCallContactPhoneDisplay(contact);

  const handlePress = () => {
    navigation.navigate(AppRoutes.ContactProfile, { id: contact.id });
  };

  const handleCall = () => {
    void dial(getCallContactPhoneDisplay(contact), { contactName: name });
  };

  const handleMessage = () => {
    navigation.navigate(AppRoutes.Chat, {
      id: String(contact.id),
      contactName: name,
      phoneNumber: contact.phoneNumber ?? contact.mobileNumber ?? "",
    });
  };

  const showActions = canManageCalls || canViewMessages;

  return (
    <View style={styles.row}>
      <Pressable style={styles.main} onPress={handlePress}>
        <Avatar name={name} size={44} fontSize={FontSizes.sm} />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
          <Text style={styles.phone} numberOfLines={1}>
            {phoneDisplay}
          </Text>
        </View>
      </Pressable>
      {showActions ? (
        <View style={styles.actions}>
          {canManageCalls ? (
            <Pressable
              style={styles.actionBtn}
              onPress={handleCall}
              accessibilityRole="button"
              accessibilityLabel={`Call ${name}`}
            >
              <Phone size={18} color={Colors.secondary} strokeWidth={2} />
            </Pressable>
          ) : null}
          {canViewMessages ? (
            <Pressable
              style={styles.actionBtn}
              onPress={handleMessage}
              accessibilityRole="button"
              accessibilityLabel={`Message ${name}`}
            >
              <MessageSquare
                size={18}
                color={Colors.secondary}
                strokeWidth={2}
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.sm,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minWidth: 0,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  phone: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(ContactListCard);
