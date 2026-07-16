import { memo, useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors, Fonts, FontSizes, Radius, Spacing } from "../../../../constants";

type Props = {
  visible: boolean;
  onClose: () => void;
  onTransfer: (phoneNumber: string) => void;
};

const TransferModal = ({ visible, onClose, onTransfer }: Props) => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleTransfer = useCallback(() => {
    onTransfer(phoneNumber);
    setPhoneNumber("");
    onClose();
  }, [onClose, onTransfer, phoneNumber]);

  const handleClose = useCallback(() => {
    setPhoneNumber("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Transfer call</Text>
          <Text style={styles.subtitle}>
            The current call will be placed on hold while you connect the transfer.
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            placeholderTextColor={Colors.textLight}
            keyboardType="phone-pad"
            style={styles.input}
            autoFocus
          />
          <View style={styles.actions}>
            <Pressable onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleTransfer} style={styles.transferBtn}>
              <Text style={styles.transferText}>Transfer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: Spacing.xl,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  cancelText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  transferBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.tabActive,
    borderRadius: Radius.md,
  },
  transferText: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    color: Colors.white,
  },
});

export default memo(TransferModal);
