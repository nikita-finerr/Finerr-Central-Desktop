import { MessageSquare, Phone } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  AppRoutes,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { usePermissions } from "../../../../../hooks/usePermissions";
import { useOutboundCall } from "../../../../../providers/OutboundCallProvider";
import { ChatPatientDetailDto } from "../../../../../types/contact";
import {
  getPatientDetailName,
  getPatientDetailPhone,
} from "../data/contactProfileUtils";

type Props = {
  patient: ChatPatientDetailDto | null;
};

const ContactActionButtons = ({ patient }: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { canManageCalls, canViewMessages } = usePermissions();
  const { dial } = useOutboundCall();

  const handleCall = () => {
    if (!patient) {
      return;
    }

    void dial(getPatientDetailPhone(patient ?? {}), {
      contactName: getPatientDetailName(patient),
    });
  };

  const handleMessage = () => {
    if (!patient) {
      return;
    }

    navigation.navigate(AppRoutes.Chat, {
      id: String(patient?.id),
      contactName: getPatientDetailName(patient ?? {}),
      phoneNumber: getPatientDetailPhone(patient ?? {}),
    });
  };

  if (!canManageCalls && !canViewMessages) {
    return null;
  }

  return (
    <View style={styles.row}>
      {canManageCalls ? (
        <Pressable
          style={styles.actionCard}
          onPress={handleCall}
          accessibilityRole="button"
          accessibilityLabel="Call contact"
        >
          <View style={styles.iconWrap}>
            <Phone size={20} color={Colors.secondary} strokeWidth={2} />
          </View>
          <Text style={styles.label}>Call</Text>
        </Pressable>
      ) : null}
      {canViewMessages ? (
        <Pressable
          style={styles.actionCard}
          onPress={handleMessage}
          accessibilityRole="button"
          accessibilityLabel="Message contact"
        >
          <View style={styles.iconWrap}>
            <MessageSquare size={20} color={Colors.secondary} strokeWidth={2} />
          </View>
          <Text style={styles.label}>Message</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: `${Colors.secondary}14`,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
});

export default memo(ContactActionButtons);
