import { FileText, Phone, Voicemail } from "lucide-react-native";
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
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";

type StatCardProps = {
  icon: typeof Phone;
  iconColor: string;
  iconBackground: string;
  title: string;
  value: number;
  onPress: () => void;
};

const StatCard = ({
  icon: Icon,
  iconColor,
  iconBackground,
  title,
  value,
  onPress,
}: StatCardProps) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
      <Icon size={18} color={iconColor} strokeWidth={2} />
    </View>

    <Text style={styles.value}>{value}</Text>
    <Text style={styles.title}>{title}</Text>
  </Pressable>
);

type Props = {
  calls: number;
  voicemails: number;
  faxes: number;
  contactId: string;
};

const ContactStatsRow = ({ calls, voicemails, faxes, contactId }: Props) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const onCallPress = () => {
    navigation.navigate(AppRoutes.CallHistory, { id: contactId });
  };

  const onVoicemailPress = () => {
    navigation.navigate(AppRoutes.VoicemailHistory, { id: contactId });
  };

  const onFaxPress = () => {
    navigation.navigate(AppRoutes.FaxHistory, { id: contactId });
  };

  return (
    <View style={styles.row}>
      <StatCard
        icon={Phone}
        iconColor={Colors.success}
        iconBackground={`${Colors.success}14`}
        title="Calls"
        value={calls}
        onPress={onCallPress}
      />
      <StatCard
        icon={Voicemail}
        iconColor={Colors.primary}
        iconBackground={`${Colors.primary}14`}
        title="Voicemails"
        value={voicemails}
        onPress={onVoicemailPress}
      />
      <StatCard
        icon={FileText}
        iconColor={Colors.warning}
        iconBackground={`${Colors.warning}14`}
        title="Faxes"
        value={faxes}
        onPress={onFaxPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
});

export default memo(ContactStatsRow);
