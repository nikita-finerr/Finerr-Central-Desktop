import { useNavigation } from "@react-navigation/native";
import { Calendar, Mail, Phone, UserRound } from "lucide-react-native";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { contactApi } from "../../../api/contactApi";
import { AuthRoundedField } from "../../../components/auth";
import CreateHeader from "../../../components/common/Header/CreateHeader";
import { Colors, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../hooks/usePermissions";
import type { RootState } from "../../../redux/store";
import { getApiErrorMessage } from "../../../utils/apiError";
import { formatApiDateTime } from "../../../utils/dateUtils";
import { normalizePhoneForSendApi } from "../../../utils/phoneUtils";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import DateOfBirthField from "./components/DateOfBirthField";

const AddContactScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { canManageContacts } = usePermissions();
  const userId = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy?.userId,
  );

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const canCreate =
    canManageContacts &&
    !loading &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phoneNumber.trim().length > 0;

  const onCreate = async () => {
    if (!canCreate) {
      return;
    }

    if (!userId) {
      showErrorToast("Unable to create contact.");
      return;
    }

    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const response = await contactApi.createChatContact(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: normalizePhoneForSendApi(mobileNumber),
        phoneNumber: normalizePhoneForSendApi(phoneNumber),
        emailAddress: trimmedEmail || null,
        dateOfBirth: dateOfBirth ? formatApiDateTime(dateOfBirth) : null,
      });

      if (!response?.success) {
        showErrorToast(
          getApiErrorMessage(response, "Failed to create contact."),
        );
        return;
      }

      showSuccessToast(response.message ?? "Contact created successfully.");
      navigation.goBack();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Failed to create contact."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <CreateHeader
        title="New Contact"
        saveLabel="Create"
        onSave={onCreate}
        canSave={canCreate}
        loading={loading}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        bottomOffset={insets.bottom}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthRoundedField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
          autoCapitalize="words"
          Icon={UserRound}
        />
        <AuthRoundedField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
          autoCapitalize="words"
          Icon={UserRound}
        />
        <AuthRoundedField
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="Enter mobile number"
          Icon={Phone}
          keyboardType="phone-pad"
        />
        <AuthRoundedField
          label="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          Icon={Phone}
          keyboardType="phone-pad"
        />
        <AuthRoundedField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          Icon={Mail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          autoComplete="email"
        />
        <DateOfBirthField
          label="Date of Birth"
          value={dateOfBirth}
          onChange={setDateOfBirth}
          placeholder="Select date of birth"
          Icon={Calendar}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
});

export default AddContactScreen;
