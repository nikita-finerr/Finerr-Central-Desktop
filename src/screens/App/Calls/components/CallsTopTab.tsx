import LinearGradient from "react-native-linear-gradient";
import { Clock, Users } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  BrandGradient,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

export const CALLS_SECTIONS = [
  { id: "recents", label: "Recents", icon: Clock },
  { id: "contacts", label: "Contacts", icon: Users },
] as const;

export type CallsSection = (typeof CALLS_SECTIONS)[number]["id"];

type Props = {
  value: CallsSection;
  onChange: (id: CallsSection) => void;
};

type TabSegmentProps = {
  segment: (typeof CALLS_SECTIONS)[number];
  isActive: boolean;
  onChange: (id: CallsSection) => void;
};

const TabSegment = ({ segment, isActive, onChange }: TabSegmentProps) => {
  const Icon = segment.icon;

  const content = (
    <>
      <Icon
        size={16}
        color={isActive ? Colors.white : Colors.textSecondary}
        strokeWidth={isActive ? 2 : 1.5}
      />
      <Text
        style={[styles.label, isActive && styles.labelActive]}
        numberOfLines={1}
      >
        {segment.label}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={() => onChange(segment.id)}
      style={styles.segmentCell}
    >
      {isActive ? (
        <LinearGradient
          colors={[...BrandGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.segment}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={styles.segment}>{content}</View>
      )}
    </Pressable>
  );
};

const CallsTopTab = ({ value, onChange }: Props) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={styles.row}>
          {CALLS_SECTIONS.map((segment) => (
            <TabSegment
              key={segment.id}
              segment={segment}
              isActive={segment.id === value}
              onChange={onChange}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    marginTop: Spacing.md,
  },
  track: {
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  segmentCell: {
    flex: 1,
    height: 40,
  },
  segment: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  labelActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.white,
  },
});

export default memo(CallsTopTab);
