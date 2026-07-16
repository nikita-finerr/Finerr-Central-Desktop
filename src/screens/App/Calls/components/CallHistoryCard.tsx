import { Phone } from "lucide-react-native";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "../../../../components/common/Avatar";
import {
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useOutboundCall } from "../../../../hooks/useOutboundCall";
import type { CallRecord } from "../data/callRecords";
import {
  getCallStatusMeta,
  getCallTimeLabel,
  type CallStatusKind,
} from "./CallUtils";

type Props = {
  item: CallRecord;
  onPress: () => void;
};

const getStatusLabelStyle = (kind: CallStatusKind) => {
  switch (kind) {
    case "missed":
      return styles.statusMissed;
    case "incoming":
      return styles.statusIncoming;
    case "outgoing":
      return styles.statusOutgoing;
  }
};

const hasDialablePhone = (phone: string): boolean =>
  phone.replace(/\D/g, "").length >= 3;

const CallHistoryCard = ({ item, onPress }: Props) => {
  const { canManageCalls } = usePermissions();
  const { dial } = useOutboundCall();

  const status = getCallStatusMeta(item);
  const timeLabel = getCallTimeLabel(item.timestamp);
  const StatusIcon = status.Icon;
  const statusLabelStyle = getStatusLabelStyle(status.kind);
  const showCallButton = canManageCalls && hasDialablePhone(item.phone);

  const handleCall = useCallback(() => {
    void dial(item.phone, { contactName: item.contactName });
  }, [dial, item.contactName, item.phone]);

  return (
    <View style={styles.row}>
      <Pressable style={styles.main} onPress={onPress}>
        <Avatar name={item.contactName} size={44} fontSize={FontSizes.sm} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.name, item.isMissed && styles.nameMissed]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.contactName}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <StatusIcon size={14} color={status.color} strokeWidth={2} />
            <Text style={[styles.statusLabel, statusLabelStyle]}>
              {status.label}
            </Text>
            {status.durationLabel.length > 0 ? (
              <Text style={styles.duration}> • {status.durationLabel}</Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <Text style={styles.timestamp}>{timeLabel}</Text>

      {showCallButton ? (
        <Pressable
          style={styles.actionBtn}
          onPress={handleCall}
          accessibilityRole="button"
          accessibilityLabel={`Call ${item.contactName}`}
        >
          <Phone size={18} color={Colors.secondary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minWidth: 0,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  nameMissed: {
    color: Colors.error,
  },
  timestamp: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusLabel: {
    marginLeft: Spacing.xs,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
  },
  statusMissed: {
    color: Colors.error,
  },
  statusIncoming: {
    color: Colors.success,
  },
  statusOutgoing: {
    color: Colors.secondary,
  },
  duration: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(CallHistoryCard);
