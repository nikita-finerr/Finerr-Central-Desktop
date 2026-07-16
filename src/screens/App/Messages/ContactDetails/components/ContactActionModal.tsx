import type { LucideIcon } from "lucide-react-native";
import { memo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import { Button } from "../../../../../components/common/Button";

type Props = {
  visible: boolean;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ContactActionModal = ({
  visible,
  icon: Icon,
  iconColor,
  title,
  message,
  confirmLabel,
  confirmColor = Colors.primary,
  onCancel,
  onConfirm,
}: Props) => {
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
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: `${iconColor}10`,
                borderColor: `${iconColor}50`,
              },
            ]}
          >
            <Icon size={22} color={iconColor} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              containerStyle={styles.cancelBtn}
              textStyle={styles.cancelText}
            />
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              containerStyle={[
                styles.confirmBtn,
                { backgroundColor: confirmColor },
              ]}
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
    borderWidth: StyleSheet.hairlineWidth,
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
  confirmBtn: {
    flex: 1,
  },
});

export default memo(ContactActionModal);
