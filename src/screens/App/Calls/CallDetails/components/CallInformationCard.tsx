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
import type { CallRecord } from "../../data/callRecords";
import { getCallInformationRows } from "../data/callDetailsUtils";
import CallInformationRow from "./CallInformationRow";

type Props = {
  record: CallRecord;
};

const CallInformationCard = ({ record }: Props) => {
  const rows = useMemo(() => getCallInformationRows(record), [record]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Call Information</Text>
      <View style={styles.rows}>
        {rows.map((row, index) => (
          <CallInformationRow
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

export default memo(CallInformationCard);
