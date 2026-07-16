import { MessageSquare, Phone } from "lucide-react-native";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "../../../../../components/common/Avatar";
import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../../hooks/usePermissions";
import {
  getVoicemailRoleBackground,
  getVoicemailRoleColor,
  getVoicemailRoleLabel,
} from "../../../Voicemail/data/voicemailRecords";
import { formatPhoneDisplay } from "../../../../../utils/formatPhoneNumber";

type Props = {
  contactName: string;
  phone: string;
  onCall: () => void;
  onMessage: () => void;
};

const CallDetailsContactHeader = ({
  contactName,
  phone,
  onCall,
  onMessage,
}: Props) => {
  const { canManageCalls, canViewMessages } = usePermissions();

  const handleCall = useCallback(() => {
    onCall();
  }, [onCall]);

  const handleMessage = useCallback(() => {
    onMessage();
  }, [onMessage]);

  const showActions = canManageCalls || canViewMessages;

  return (
    <View style={styles.wrap}>
      <View style={styles.main}>
        <Avatar name={contactName} size={56} fontSize={FontSizes.lg} />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {contactName}
          </Text>
          <Text style={styles.phone} numberOfLines={1}>
            {formatPhoneDisplay(phone)}
          </Text>
        </View>
      </View>
      {showActions ? (
        <View style={styles.actions}>
          {canManageCalls ? (
            <Pressable
              style={styles.actionBtn}
              onPress={handleCall}
              accessibilityRole="button"
              accessibilityLabel={`Call ${contactName}`}
            >
              <Phone size={18} color={Colors.secondary} strokeWidth={2} />
            </Pressable>
          ) : null}
          {/* {canViewMessages ? (
            <Pressable
              style={styles.actionBtn}
              onPress={handleMessage}
              accessibilityRole="button"
              accessibilityLabel={`Message ${contactName}`}
            >
              <MessageSquare size={18} color={Colors.secondary} strokeWidth={2} />
            </Pressable>
          ) : null} */}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
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
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 0.75 * globalStyleDefinitions.cardInnerPadding.padding,
    paddingVertical: 0.3 * globalStyleDefinitions.cardInnerPadding.padding,
    borderRadius: Radius.md,
  },
  roleBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
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
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(CallDetailsContactHeader);
