import { Search } from "lucide-react-native";
import { memo } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Colors, Fonts, FontSizes, Radius, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
};

const SearchBar = ({ value, onChangeText, placeholder, icon }: Props) => {
  return (
    <View style={styles.searchContainer}>
      {icon ?? <Search size={18} color={Colors.textLight} strokeWidth={2} />}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        accessibilityLabel="Search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    height: 40,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    lineHeight: FontSizes.md + 5,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
});

export default memo(SearchBar);
