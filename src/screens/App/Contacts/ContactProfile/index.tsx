import {
  NavigationProp,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { contactApi } from "../../../../api/contactApi";
import { LinearHeader } from "../../../../components/common/Header";
import { Colors, Fonts, FontSizes, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { useOutboundCall } from "../../../../hooks/useOutboundCall";
import { usePermissions } from "../../../../hooks/usePermissions";
import type { RootState } from "../../../../redux/store";
import type { ChatPatientDetailDto } from "../../../../types/contact";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { showErrorToast, showSuccessToast } from "../../../../utils/toast";
import ContactProfileSkeleton from "./components/ContactProfileSkeleton";
import ContactActionButtons from "./components/ContactActionButtons";
import ContactDeleteButton from "./components/ContactDeleteButton";
import ContactDeleteModal from "./components/ContactDeleteModal";
import ContactDetailsProfileCard from "./components/ContactDetailsProfileCard";
import ContactInformationCard from "./components/ContactInformationCard";
import { getPatientDetailName } from "./data/contactProfileUtils";

type RouteParams = {
  ContactProfile: { id: string };
};

const isPatientDetail = (
  response: ChatPatientDetailDto | { status?: number },
): response is ChatPatientDetailDto =>
  typeof (response as ChatPatientDetailDto).id === "number";

const ContactProfile = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "ContactProfile">>();
  const isFocused = useIsFocused();

  const userId = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy?.userId,
  );

  const patientCentralId = route.params?.id ?? "";

  const [patient, setPatient] = useState<ChatPatientDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const { canManageContacts } = usePermissions();

  const loadPatient = useCallback(async () => {
    if (!patientCentralId || !userId) {
      setPatient(null);
      setLoading(false);
      return;
    }

    try {
      const response = await contactApi.getChatContact({
        patientCentralId,
        userId,
      });

      if (!isPatientDetail(response)) {
        setPatient(null);
        showErrorToast(
          getApiErrorMessage(response, "Failed to load contact profile."),
        );
        return;
      }

      setPatient(response);
    } catch (error) {
      setPatient(null);
      showErrorToast(
        getApiErrorMessage(error, "Failed to load contact profile."),
      );
    } finally {
      setLoading(false);
    }
  }, [patientCentralId, userId]);

  useEffect(() => {
    if (patientCentralId && isFocused) {
      loadPatient();
    }
  }, [patientCentralId, isFocused]);

  const handleDeletePress = useCallback(() => {
    setDeleteVisible(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteVisible(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!patient || !userId || deleting) {
      return;
    }

    setDeleting(true);
    setDeleteVisible(false);

    try {
      const response = await contactApi.deleteChatContact({
        patientCentralId: String(patient.id),
        userId,
      });

      if (!response?.success) {
        showErrorToast(
          getApiErrorMessage(response, "Failed to delete contact."),
        );
        return;
      }

      showSuccessToast(response.message ?? "Contact deleted successfully.");
      setDeleteVisible(false);
      navigation.goBack();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Failed to delete contact."));
    } finally {
      setDeleting(false);
    }
  }, [deleting, navigation, patient, userId]);

  return (
    <View style={styles.root}>
      <LinearHeader
        title="Contact Details"
        patient={canManageContacts && patient ? patient : null}
      />

      {loading ? (
        <ContactProfileSkeleton />
      ) : patient ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ContactDetailsProfileCard patient={patient} />
          <ContactActionButtons patient={patient} />
          <ContactInformationCard patient={patient} />
          {canManageContacts ? (
            <ContactDeleteButton onPress={handleDeletePress} />
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Contact not found.</Text>
        </View>
      )}

      <ContactDeleteModal
        visible={deleteVisible}
        contactName={patient ? getPatientDetailName(patient) : ""}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});

export default ContactProfile;
