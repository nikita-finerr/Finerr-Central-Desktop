import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  Building2,
  ChevronRight,
  Fingerprint,
  Lock,
  LogOut,
  Mail,
  ScanFace,
  UserCheck,
  UserRound,
} from "lucide-react-native";
import { useCallback, useEffect, useState, memo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../../../components/common/Avatar";
import { ScreenHeader } from "../../../components/common/Header";
import { ProfileLogoutModal } from "../../../components/profile";
import {
  AppRoutes,
  Colors,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { clearAuth } from "../../../redux/auth/authSlice";
import type { RootState } from "../../../redux/store";
import { unregisterPushNotifications } from "../../../services/pushNotifications";
import {
  authenticateWithBiometric,
  checkBiometricAvailability,
  getBiometricLabel,
} from "../../../utils/biometric";
import { authStorage } from "../../../utils/storage";
import { showErrorToast } from "../../../utils/toast";

const Profile = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch<any>();
  const insets = useSafeAreaInsets();

  const userData = useSelector((state: RootState) => state.auth.userData);

  const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState<boolean>(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isBiometricAvailable, setIsBiometricAvailable] =
    useState<boolean>(false);

  const BiometricIcon = Platform.OS === "ios" ? ScanFace : Fingerprint;

  useEffect(() => {
    void (async () => {
      const [available, storedKeepMeSignedIn, enabled] = await Promise.all([
        checkBiometricAvailability(),
        authStorage.getKeepMeSignedIn(),
        authStorage.getBiometricEnabled(),
      ]);
      setIsBiometricAvailable(available);
      setKeepMeSignedIn(storedKeepMeSignedIn);
      setIsBiometricEnabled(Boolean(enabled));
    })();
  }, []);

  const toggleKeepMeSignedIn = useCallback(async (value: boolean) => {
    setKeepMeSignedIn(value);
    await authStorage.setKeepMeSignedIn(value);

    if (!value) {
      setIsBiometricEnabled(false);
      await authStorage.setBiometricEnabled(false);
    }
  }, []);

  const toggleBiometric = useCallback(async (value: boolean) => {
    if (!value) {
      setIsBiometricEnabled(false);
      await authStorage.setBiometricEnabled(false);
      return;
    }

    setKeepMeSignedIn(true);
    await authStorage.setKeepMeSignedIn(true);

    const success = await authenticateWithBiometric(
      Platform.OS === "ios"
        ? "Authenticate with Face ID"
        : "Authenticate with Fingerprint",
    );

    if (!success) {
      showErrorToast(`${getBiometricLabel()} authentication failed`);
      return;
    }

    setIsBiometricEnabled(true);
    await authStorage.setBiometricEnabled(true);
  }, []);

  const handleLogout = async () => {
    setLogoutVisible(false);
    await unregisterPushNotifications();
    await authStorage.clearAuth();
    dispatch(clearAuth());
  };

  const onChangePassword = () => {
    navigation.navigate(AppRoutes.ChangePassword);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Profile" description="Your account details" />

      <ScrollView
        contentContainerStyle={styles.content}
        style={{ marginBottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.profileCard}>
          <Avatar
            name={`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}
            size={72}
            fontSize={FontSizes.xxxl}
            backgroundColor={Colors.secondary}
            textColor={Colors.white}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {`${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{userData?.role}</Text>
            </View>
            <View style={styles.organizationRow}>
              <Building2 size={16} color={Colors.secondary} strokeWidth={2} />
              <Text style={styles.organizationText}>
                {userData?.pharmacy?.pharmacyName}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account Information</Text>
        <View style={styles.card}>
          <InfoRow icon={Mail} label="Email" value={userData?.email ?? "-"} />
          <InfoRow
            icon={Building2}
            label="Organization"
            value={userData?.pharmacy?.pharmacyName ?? "-"}
            showDivider
          />
          <InfoRow
            icon={UserRound}
            label="Role"
            value={userData?.role ?? "-"}
            showDivider
          />
        </View>

        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <UserCheck size={18} color={Colors.secondary} strokeWidth={2} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoValue}>Keep Me Signed In</Text>
              <Text style={styles.infoLabel}>
                Stay signed in after closing the app
              </Text>
            </View>
            <Switch
              value={keepMeSignedIn}
              onValueChange={toggleKeepMeSignedIn}
              trackColor={{ false: Colors.border, true: Colors.secondary }}
              thumbColor={Colors.white}
            />
          </View>
          {isBiometricAvailable ? (
            <View style={[styles.infoRow, styles.infoRowDivider]}>
              <View style={styles.infoIcon}>
                <BiometricIcon
                  size={18}
                  color={Colors.secondary}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.infoCopy}>
                <Text style={styles.infoValue}>{getBiometricLabel()}</Text>
                <Text style={styles.infoLabel}>
                  Use {getBiometricLabel()} to unlock the app
                </Text>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: Colors.border, true: Colors.secondary }}
                thumbColor={Colors.white}
              />
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={onChangePassword}
          style={styles.card}
          accessibilityRole="button"
        >
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Lock size={18} color={Colors.secondary} strokeWidth={2} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoValue}>Change Password</Text>
              <Text style={styles.infoLabel}>Update your account password</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} strokeWidth={2} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => setLogoutVisible(true)}
          style={styles.logoutButton}
          accessibilityRole="button"
        >
          <LogOut size={18} color={Colors.error} strokeWidth={2} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <ProfileLogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
};

type InfoRowProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  showDivider?: boolean;
};

const InfoRow = ({ icon: Icon, label, value, showDivider }: InfoRowProps) => {
  return (
    <View style={[styles.infoRow, showDivider && styles.infoRowDivider]}>
      <View style={styles.infoIcon}>
        <Icon size={18} color={Colors.secondary} strokeWidth={2} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: Spacing.sm,
    paddingBottom: globalStyleDefinitions.screenPadding.padding,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    alignItems: "center",
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    gap: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  roleBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: "flex-start",
    backgroundColor: Colors.secondary + "10",
  },
  roleBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
    color: Colors.secondary,
  },
  organizationRow: {
    marginTop: Spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  organizationText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  sectionLabel: {
    marginTop: Spacing.xl,
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginTop: Spacing.sm,
    paddingHorizontal: globalStyleDefinitions.cardInnerPadding.padding,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: globalStyleDefinitions.cardInnerPadding.padding,
  },
  infoRowDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.secondary + "10",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  infoLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
  },
  logoutButton: {
    marginTop: Spacing.xxl,
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error + "80",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  logoutText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.error,
  },
});

export default Profile;
