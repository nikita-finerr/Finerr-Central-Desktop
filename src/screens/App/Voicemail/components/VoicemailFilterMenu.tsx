import {
  BellDot,
  Check,
  CheckCircle2,
  Funnel,
  Voicemail,
  type LucideIcon,
} from "lucide-react-native";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
  Typography,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import {
  getVoicemailFilterColor,
  type VoicemailFilter,
} from "../data/voicemailRecords";

type FilterOption = {
  id: VoicemailFilter;
  label: string;
  icon: LucideIcon;
  color: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  {
    id: "All",
    label: "All",
    icon: Voicemail,
    color: getVoicemailFilterColor("All"),
  },
  {
    id: "Unread",
    label: "Unread",
    icon: BellDot,
    color: getVoicemailFilterColor("Unread"),
  },
  {
    id: "Read",
    label: "Read",
    icon: CheckCircle2,
    color: getVoicemailFilterColor("Read"),
  },
];

type Props = {
  value: VoicemailFilter;
  onChange: (filter: VoicemailFilter) => void;
  onOpenChange?: (open: boolean) => void;
};

const RadioIndicator = ({ selected }: { selected: boolean }) => {
  if (selected) {
    return (
      <View style={styles.radioSelected}>
        <Check size={12} color={Colors.white} strokeWidth={3} />
      </View>
    );
  }

  return <View style={styles.radioUnselected} />;
};

type FilterOptionRowProps = {
  option: FilterOption;
  selected: boolean;
  isLastOption: boolean;
  onSelect: (filter: VoicemailFilter) => void;
};

const FilterOptionRow = ({
  option,
  selected,
  isLastOption,
  onSelect,
}: FilterOptionRowProps) => {
  const Icon = option.icon;

  const onPress = useCallback(() => {
    onSelect(option.id);
  }, [onSelect, option.id]);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, !isLastOption && styles.optionBorder]}
      accessibilityRole="menuitem"
      accessibilityState={{ selected }}
    >
      <Icon size={20} color={option.color} strokeWidth={2} />
      <Text style={styles.optionLabel}>{option.label}</Text>
      <RadioIndicator selected={selected} />
    </Pressable>
  );
};

const VoicemailFilterMenu = ({ value, onChange, onOpenChange }: Props) => {
  const menuAnim = useRef(new Animated.Value(0)).current;

  const [open, setOpen] = useState<boolean>(false);

  const isFiltered = value !== "All";

  const setMenuOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuAnim, open]);

  const close = useCallback(() => setMenuOpen(false), [setMenuOpen]);

  const handleSelect = useCallback(
    (filter: VoicemailFilter) => {
      onChange(filter);
      close();
    },
    [close, onChange],
  );

  const handleClear = useCallback(() => {
    onChange("All");
    close();
  }, [close, onChange]);

  const onToggleFilterMenu = () => {
    setMenuOpen(!open);
  };

  return (
    <View style={[styles.host, open && styles.hostOpen]}>
      <Pressable
        onPress={onToggleFilterMenu}
        style={styles.filterBtn}
        accessibilityRole="button"
        accessibilityLabel="Filter voicemails"
        accessibilityState={{ expanded: open }}
      >
        <Funnel size={20} color={Colors.textPrimary} strokeWidth={2} />
        {isFiltered ? <View style={styles.filterBadge} /> : null}
      </Pressable>

      {open ? (
        <View style={styles.dropdownLayer} pointerEvents="box-none">
          <Pressable
            style={styles.backdrop}
            onPress={close}
            accessibilityLabel="Close filter menu"
          />

          <View style={styles.menuShadow}>
            <Animated.View
              style={[
                styles.menuInner,
                {
                  opacity: menuAnim,
                  transform: [
                    {
                      translateY: menuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-Spacing.sm, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {FILTER_OPTIONS.map((option, index) => (
                <FilterOptionRow
                  key={option.id}
                  option={option}
                  selected={option.id === value}
                  isLastOption={index === FILTER_OPTIONS.length - 1}
                  onSelect={handleSelect}
                />
              ))}

              <View style={styles.divider} />

              <Pressable
                onPress={handleClear}
                style={styles.clearBtn}
                accessibilityRole="button"
                accessibilityLabel="Clear filter"
              >
                <Text style={styles.clearBtnText}>Clear filter</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "relative",
    zIndex: 1,
  },
  hostOpen: {
    zIndex: 30,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  filterBadge: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    position: "absolute",
    top: 0,
    right: 0,
  },
  dropdownLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 31,
    overflow: "visible",
  },
  backdrop: {
    position: "absolute",
    backgroundColor: Colors.transparent,
    width: Dimensions.width * 2,
    height: Dimensions.height * 2,
    top: -Dimensions.height,
    left: -Dimensions.width,
  },
  menuShadow: {
    position: "absolute",
    top: 45,
    right: 0,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  menuInner: {
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: globalStyleDefinitions.cardInnerPadding.padding,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionLabel: {
    flex: 1,
    ...Typography.body,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginRight: Spacing.xl,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  clearBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
    backgroundColor: Colors.white,
  },
  clearBtnText: {
    ...Typography.body,
    fontFamily: Fonts.semiBold,
    color: Colors.secondary,
  },
});

export default memo(VoicemailFilterMenu);
