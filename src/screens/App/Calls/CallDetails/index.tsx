import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { callApi } from "../../../../api/callApi";
import { recordingsApi } from "../../../../api/recordingsApi";
import { LinearHeader } from "../../../../components/common/Header";
import {
  AppRoutes,
  Colors,
  Fonts,
  FontSizes,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { useOutboundCall } from "../../../../hooks/useOutboundCall";
import type { RootState } from "../../../../redux/store";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { mapCallDtoToRecord } from "../../../../utils/callMappers";
import { showErrorToast } from "../../../../utils/toast";
import type { CallRecord } from "../data/callRecords";
import { mapRecordingToCallRecord } from "../data/recentRecordings";
import CallDetailsContactHeader from "./components/CallDetailsContactHeader";
import CallDetailsSkeleton from "./components/CallDetailsSkeleton";
import CallInformationCard from "./components/CallInformationCard";

type RouteParams = {
  CallDetails: { id: string };
};

const CallDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, "CallDetails">>();
  const { dial } = useOutboundCall();
  const pharmacy = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy,
  );

  const [record, setRecord] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const callId = route.params?.id ?? "";

  useEffect(() => {
    let cancelled = false;

    const loadCall = async () => {
      if (!callId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const baseUrl = pharmacy?.domainName?.trim();
      const apiKey = pharmacy?.apiKey?.trim();

      try {
        if (baseUrl && apiKey) {
          const recording = await recordingsApi.getById({
            baseUrl,
            apiKey,
            id: callId,
          });

          if (cancelled) {
            return;
          }

          setRecord(mapRecordingToCallRecord(recording));
          return;
        }

        const response = await callApi.getById(callId);
        if (cancelled) {
          return;
        }

        if (response?.success && response.data) {
          setRecord(mapCallDtoToRecord(response.data));
        } else {
          setRecord(null);
          showErrorToast(getApiErrorMessage(response, "Failed to load call."));
        }
      } catch (error) {
        if (!cancelled) {
          setRecord(null);
          showErrorToast(getApiErrorMessage(error, "Failed to load call."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCall();

    return () => {
      cancelled = true;
    };
  }, [callId, pharmacy?.apiKey, pharmacy?.domainName]);

  const handleCall = useCallback(() => {
    if (!record) {
      return;
    }

    void dial(record.phone, { contactName: record.contactName });
  }, [dial, record]);

  const handleMessage = useCallback(() => {
    if (!record?.id) {
      return;
    }

    navigation.navigate(AppRoutes.Chat, { id: record.id });
  }, [navigation, record]);

  const content = useMemo(() => {
    if (loading) {
      return <CallDetailsSkeleton />;
    }

    if (!record) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Call not found.</Text>
        </View>
      );
    }

    return (
      <>
        <CallDetailsContactHeader
          contactName={record.contactName}
          phone={record.phone}
          onCall={handleCall}
          onMessage={handleMessage}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CallInformationCard record={record} />
        </ScrollView>
      </>
    );
  }, [handleCall, handleMessage, loading, record]);

  return (
    <View style={styles.root}>
      <LinearHeader title="Call Details" patient={null} />
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
  },
  centered: {
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

export default CallDetailsScreen;
