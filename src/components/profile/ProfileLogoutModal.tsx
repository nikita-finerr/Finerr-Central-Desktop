import { LogOut } from "lucide-react-native";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../constants";
import { globalStyleDefinitions } from "../../constants/globalStyleDefinitions";
import { Button } from "../common/Button";
import { memo } from "react";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ProfileLogoutModal = ({ visible, onCancel, onConfirm }: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.iconWrap}>
            <LogOut size={22} color={Colors.error} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Logout</Text>
          <Text style={styles.message}>Are you sure you want to logout?</Text>
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              containerStyle={styles.cancelBtn}
              textStyle={styles.cancelText}
            />
            <Button
              title="Logout"
              onPress={onConfirm}
              containerStyle={styles.logoutBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.black + "40",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
  },
  card: {
    width: Dimensions.width - 3 * globalStyleDefinitions.screenPadding.padding,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
    paddingTop: 2 * globalStyleDefinitions.cardInnerPadding.padding,
    paddingBottom: Spacing.xl,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.error + "10",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.error + "50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xxl,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  cancelText: {
    color: Colors.textPrimary,
  },
  logoutBtn: {
    flex: 1,
    backgroundColor: Colors.error,
  },
});

export default memo(ProfileLogoutModal);
