import { NavigationProp, useNavigation } from "@react-navigation/native";
import { memo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Fonts, FontSizes } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";

interface CreateHeaderProps {
  title: string;
  onSave: () => void;
  canSave: boolean;
  loading: boolean;
  saveLabel?: string;
}

const CreateHeader = ({
  title,
  onSave,
  canSave,
  loading,
  saveLabel = "Save",
}: CreateHeaderProps) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const onCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onCancel}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
      >
        <Text style={styles.headerAction}>Cancel</Text>
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={saveLabel}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={Colors.secondary}
            style={styles.headerActionLoader}
          />
        ) : (
          <Text
            style={[
              styles.headerAction,
              !canSave && styles.headerActionDisabled,
            ]}
          >
            {saveLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingVertical: 0.75 * globalStyleDefinitions.screenPadding.padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  headerAction: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.secondary,
  },
  headerActionDisabled: {
    color: Colors.textLight,
  },
  headerActionLoader: {
    width: 38,
  },
});

export default memo(CreateHeader);
