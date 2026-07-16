import { Mail, Phone } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import Avatar from "../../../../../components/common/Avatar";
import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { ChatPatientDetailDto } from "../../../../../types/contact";
import {
  getPatientDetailName,
  getPatientDetailPhoneDisplay,
} from "../data/contactProfileUtils";

type Props = {
  patient: ChatPatientDetailDto;
};

const ContactDetailsProfileCard = ({ patient }: Props) => {
  const name = getPatientDetailName(patient);
  const phoneDisplay = getPatientDetailPhoneDisplay(patient);

  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <Avatar name={name} size={56} fontSize={FontSizes.lg} />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
            {name}
          </Text>
          {phoneDisplay ? (
            <View style={styles.detailRow}>
              <Phone size={16} color={Colors.secondary} strokeWidth={2} />
              <Text style={styles.detailText} numberOfLines={1}>
                {phoneDisplay}
              </Text>
            </View>
          ) : null}
          {patient.emailAddress ? (
            <View style={styles.detailRow}>
              <Mail size={16} color={Colors.secondary} strokeWidth={2} />
              <Text style={styles.detailText} numberOfLines={1}>
                {patient.emailAddress}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  main: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
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
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  detailText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
});

export default memo(ContactDetailsProfileCard);
