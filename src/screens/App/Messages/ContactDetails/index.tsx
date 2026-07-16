import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, StatusBar } from "react-native";
import { useSelector } from "react-redux";

import { contactApi } from "../../../../api/contactApi";
import { Colors, Fonts, FontSizes, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import type { RootState } from "../../../../redux/store";
import type { ChatContactProfileResponse } from "../../../../types/contact";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { showErrorToast } from "../../../../utils/toast";
import ContactDetailsSkeleton from "./components/ContactDetailsSkeleton";
import ContactProfileHeader from "./components/ContactProfileHeader";
import ContactProfileSummaryCard from "./components/ContactProfileSummaryCard";
import ContactStatsRow from "./components/ContactStatsRow";

type RouteParams = {
  ContactDetails: {
    id: string;
  };
};

const ContactDetails = () => {
  const route = useRoute<RouteProp<RouteParams, "ContactDetails">>();
  const { userData } = useSelector((state: RootState) => state.auth);

  const id = route.params?.id ?? "";

  const [profile, setProfile] = useState<ChatContactProfileResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const userId = userData?.pharmacy?.userId;
    if (!id || !userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await contactApi.getChatContactProfile({
        patientCentralId: id,
        userId,
      });
      setProfile(response);
    } catch (error) {
      setProfile(null);
      showErrorToast(
        getApiErrorMessage(error, "Failed to load contact profile."),
      );
    } finally {
      setLoading(false);
    }
  }, [id, userData?.pharmacy?.userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const contactId = profile ? String(profile.patientCentralId) : id;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ContactProfileHeader profile={profile ?? undefined} />

      {loading ? (
        <ContactDetailsSkeleton />
      ) : profile ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ContactProfileSummaryCard
            fullName={profile?.fullName?.trim() ?? ""}
            emailAddress={profile?.emailAddress ?? ""}
            phoneDisplay={profile?.phoneNumber ?? ""}
          />
          <ContactStatsRow
            calls={profile?.stats?.calls ?? 0}
            voicemails={profile?.stats?.voicemails ?? 0}
            faxes={profile?.stats?.faxes ?? 0}
            contactId={contactId}
          />
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Contact profile unavailable.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: globalStyleDefinitions.screenPadding.padding,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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

export default ContactDetails;
