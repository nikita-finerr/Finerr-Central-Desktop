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
import { formatPhoneDisplay } from "../../../../../utils/formatPhoneNumber";

type Props = {
  fullName: string;
  emailAddress?: string | null;
  phoneDisplay?: string | null;
};

const ContactProfileSummaryCard = ({
  fullName,
  emailAddress,
  phoneDisplay,
}: Props) => {
  return (
    <View style={styles.card}>
      <Avatar name={fullName} size={60} fontSize={FontSizes.xl} />
      <View style={styles.info}>
        <Text style={styles.name}>{fullName}</Text>
        {emailAddress ? (
          <View style={styles.phoneRow}>
            <Mail size={14} color={Colors.textSecondary} strokeWidth={2} />
            <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
              {emailAddress}
            </Text>
          </View>
        ) : null}
        {phoneDisplay ? (
          <View style={styles.phoneRow}>
            <Phone size={14} color={Colors.secondary} strokeWidth={2} />
            <Text style={styles.phone}>{formatPhoneDisplay(phoneDisplay)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  info: {
    flex: 1,
    gap: Spacing.sm,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  phone: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm + 5,
    color: Colors.secondary,
  },
  email: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: FontSizes.sm + 5,
  },
});

export default memo(ContactProfileSummaryCard);
