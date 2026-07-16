import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View, StatusBar } from "react-native";
import { useSelector } from "react-redux";
import { contactApi } from "../../../../../api/contactApi";
import EmptyList from "../../../../../components/common/EmptyList";
import { LinearHeader } from "../../../../../components/common/Header";
import { AppRoutes, Colors, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { RootState } from "../../../../../redux/store";
import type { ContactVoicemailItemDto } from "../../../../../types/contact";
import { getApiErrorMessage } from "../../../../../utils/apiError";
import { showErrorToast } from "../../../../../utils/toast";
import VoicemailHistorySectionCard from "./components/VoicemailHistorySection";
import VoicemailHistorySkeletonList from "./components/VoicemailHistorySkeletonList";
import VoicemailHistoryTab from "./components/VoicemailHistoryTab";
import {
  getVoicemailFilterParam,
  groupContactVoicemailItems,
  type VoicemailHistoryFilter,
  type VoicemailHistorySection,
} from "./data/voicemailHistory";

const PAGE_SIZE = 25;

type RouteParams = {
  VoicemailHistory: { id?: string };
};

const VoicemailHistory = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "VoicemailHistory">>();
  const contactId = route.params?.id;
  const pharmacyId = useSelector(
    (state: RootState) => state.auth.userData?.merchantId ?? 0,
  );

  const [filter, setFilter] =
    useState<VoicemailHistoryFilter>("All Voicemails");
  const [voicemails, setVoicemails] = useState<ContactVoicemailItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadVoicemails = useCallback(
    async (
      pageToLoad: number,
      activeFilter: VoicemailHistoryFilter,
      reset: boolean,
      isRefresh = false,
    ) => {
      if (!contactId || !pharmacyId) {
        setLoading(false);
        setLoadingMore(false);
        if (isRefresh) {
          setRefreshing(false);
        }
        return;
      }

      const filterParam = getVoicemailFilterParam(activeFilter);

      try {
        const response = await contactApi.listVoicemails(contactId, {
          PharmacyId: pharmacyId,
          Page: pageToLoad,
          PageSize: PAGE_SIZE,
          ...(filterParam ? { Filter: filterParam } : {}),
        });

        if (response?.success) {
          const items = response.items ?? [];
          setVoicemails((current) => (reset ? items : [...current, ...items]));
          setHasMore(response.page < response.totalPages);
          setPage(response.page);
        } else {
          showErrorToast(
            getApiErrorMessage(response, "Failed to load voicemail history."),
          );
        }
      } catch (error) {
        showErrorToast(
          getApiErrorMessage(error, "Failed to load voicemail history."),
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [contactId, pharmacyId],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    void loadVoicemails(1, filter, true);
  }, [contactId, filter, loadVoicemails]);

  const sections = useMemo(
    () => groupContactVoicemailItems(voicemails),
    [voicemails],
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleItemPress = useCallback(
    (item: ContactVoicemailItemDto) => {
      navigation.navigate(AppRoutes.VoicemailTranscript, {
        id: String(item.id),
      });
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    void loadVoicemails(page + 1, filter, false);
  }, [filter, hasMore, loadVoicemails, loading, loadingMore, page, refreshing]);

  const onRefresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }

    setRefreshing(true);
    void loadVoicemails(1, filter, true, true);
  }, [filter, loadVoicemails, loading, refreshing]);

  const keyExtractor = useCallback(
    (section: VoicemailHistorySection) => section.key,
    [],
  );

  const renderSection = useCallback(
    ({ item }: { item: VoicemailHistorySection }) => {
      return (
        <VoicemailHistorySectionCard
          section={item}
          onItemPress={handleItemPress}
        />
      );
    },
    [handleItemPress],
  );

  const ItemSeparatorComponent = useCallback(() => {
    return <View style={styles.sectionSeparator} />;
  }, []);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return null;
    }

    return <EmptyList title="No voicemails found." />;
  }, [loading]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearHeader title="Voicemail History" onBackPress={handleBackPress} />
      <VoicemailHistoryTab value={filter} onChange={setFilter} />
      {loading ? (
        <VoicemailHistorySkeletonList />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={keyExtractor}
          renderItem={renderSection}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  list: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
    gap: Spacing.lg,
  },
  sectionSeparator: { height: Spacing.xs },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default VoicemailHistory;
