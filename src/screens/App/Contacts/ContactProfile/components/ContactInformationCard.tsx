import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { ChatPatientDetailDto } from "../../../../../types/contact";
import { getContactInformationRows } from "../data/contactProfileUtils";
import ContactInformationRow from "./ContactInformationRow";

type Props = {
  patient: ChatPatientDetailDto;
};

const ContactInformationCard = ({ patient }: Props) => {
  const rows = useMemo(
    () => getContactInformationRows(patient),
    [patient],
  );

  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Contact Information</Text>
      <View style={styles.rows}>
        {rows.map((row, index) => (
          <ContactInformationRow
            key={row.key}
            row={row}
            showSeparator={index < rows.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    paddingTop: globalStyleDefinitions.cardInnerPadding.padding,
    gap: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  rows: {
    overflow: "hidden",
  },
});

export default memo(ContactInformationCard);
