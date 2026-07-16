import { Trash2 } from "lucide-react-native";
import { memo } from "react";
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "../../../../components/common/Button/Button";
import {
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";

type Props = {
  visible: boolean;
  contactName?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const handleCardPress = (event: GestureResponderEvent) => {
  event.stopPropagation();
};

const VoicemailDeleteModal = ({
  visible,
  contactName,
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
        <Pressable style={styles.card} onPress={handleCardPress}>
          <View style={styles.iconWrap}>
            <Trash2 size={22} color={Colors.error} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Delete Voicemail</Text>
          <Text style={styles.message}>
            {contactName
              ? `Delete voicemail from ${contactName}? This cannot be undone.`
              : "Delete this voicemail? This cannot be undone."}
          </Text>
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              containerStyle={styles.cancelBtn}
              textStyle={styles.cancelText}
            />
            <Button
              title="Delete"
              onPress={onConfirm}
              containerStyle={styles.deleteBtn}
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
  deleteBtn: {
    flex: 1,
    backgroundColor: Colors.error,
  },
});

export default memo(VoicemailDeleteModal);
