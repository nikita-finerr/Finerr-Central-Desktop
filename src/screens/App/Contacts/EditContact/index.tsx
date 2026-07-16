import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Calendar, Mail, Phone, UserRound } from "lucide-react-native";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { contactApi } from "../../../../api/contactApi";
import { AuthRoundedField } from "../../../../components/auth";
import CreateHeader from "../../../../components/common/Header/CreateHeader";
import { Colors, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../hooks/usePermissions";
import type { RootState } from "../../../../redux/store";
import type { ChatPatientDetailDto } from "../../../../types/contact";
import { getApiErrorMessage } from "../../../../utils/apiError";
import {
  formatApiDateTime,
  parseApiDateTime,
} from "../../../../utils/dateUtils";
import { normalizePhoneForSendApi } from "../../../../utils/phoneUtils";
import { showErrorToast, showSuccessToast } from "../../../../utils/toast";
import DateOfBirthField from "../components/DateOfBirthField";

type RouteParams = {
  EditContact: {
    patient: ChatPatientDetailDto;
  };
};

const EditContactScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "EditContact">>();
  const insets = useSafeAreaInsets();
  const { canManageContacts } = usePermissions();
  const userId = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy?.userId,
  );

  const [firstName, setFirstName] = useState(
    route.params?.patient?.firstName ?? "",
  );
  const [lastName, setLastName] = useState(
    route.params?.patient?.lastName ?? "",
  );
  const [phoneNumber, setPhoneNumber] = useState(
    route.params?.patient?.phoneNumber ?? "",
  );
  const [mobileNumber, setMobileNumber] = useState(
    route.params?.patient?.mobileNumber ?? "",
  );
  const [email, setEmail] = useState(route.params?.patient?.emailAddress ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(
    route.params?.patient?.dateOfBirth
      ? parseApiDateTime(route.params?.patient?.dateOfBirth)
      : null,
  );
  const [saving, setSaving] = useState(false);

  const canSave =
    canManageContacts &&
    !saving &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    mobileNumber.trim().length > 0;

  const onSave = async () => {
    if (!canSave) {
      return;
    }

    if (!userId) {
      showErrorToast("Unable to update contact.");
      return;
    }

    setSaving(true);

    try {
      const trimmedEmail = email.trim();
      const response = await contactApi.updateChatContact(
        String(route.params?.patient?.id),
        userId,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobileNumber: normalizePhoneForSendApi(mobileNumber),
          phoneNumber: phoneNumber.trim()
            ? normalizePhoneForSendApi(phoneNumber)
            : null,
          emailAddress: trimmedEmail || null,
          dateOfBirth: dateOfBirth ? formatApiDateTime(dateOfBirth) : null,
        },
      );

      if (!response?.success) {
        showErrorToast(
          getApiErrorMessage(response, "Failed to update contact."),
        );
        return;
      }

      showSuccessToast(response.message ?? "Contact updated successfully.");
      navigation.goBack();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Failed to update contact."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <CreateHeader
        title="Edit Contact"
        saveLabel="Save"
        onSave={onSave}
        canSave={canSave}
        loading={saving}
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
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default EditContactScreen;
