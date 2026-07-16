import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View, StatusBar } from "react-native";
import { useSelector } from "react-redux";

import { contactApi } from "../../../../../api/contactApi";
import EmptyList from "../../../../../components/common/EmptyList";
import { LinearHeader } from "../../../../../components/common/Header";
import { AppRoutes, Colors, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { RootState } from "../../../../../redux/store";
import type { ContactCallItemDto } from "../../../../../types/contact";
import { getApiErrorMessage } from "../../../../../utils/apiError";
import { showErrorToast } from "../../../../../utils/toast";
import CallHistoryFilterTabs from "./components/CallHistoryFilterTabs";
import CallHistorySectionCard from "./components/CallHistorySection";
import CallHistorySkeletonList from "./components/CallHistorySkeletonList";
import {
  getCallFilterParam,
  groupContactCallItems,
  type CallHistoryFilter,
  type CallHistorySection,
} from "./data/callHistory";

const PAGE_SIZE = 25;

type RouteParams = {
  CallHistory: { id?: string };
};

const CallHistory = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "CallHistory">>();
  const contactId = route.params?.id;
  const pharmacyId = useSelector(
    (state: RootState) => state.auth.userData?.merchantId ?? 0,
  );

  const [filter, setFilter] = useState<CallHistoryFilter>("All Calls");
  const [calls, setCalls] = useState<ContactCallItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const requestIdRef = useRef(0);

  const loadCalls = useCallback(
    async (
      pageToLoad: number,
      activeFilter: CallHistoryFilter,
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

      const requestId = ++requestIdRef.current;
      const filterParam = getCallFilterParam(activeFilter);

      try {
        const response = await contactApi.listCalls(contactId, {
          PharmacyId: pharmacyId,
          Page: pageToLoad,
          PageSize: PAGE_SIZE,
          ...(filterParam ? { Filter: filterParam } : {}),
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        if (response?.success) {
          const items = response.items ?? [];
          setCalls((current) => (reset ? items : [...current, ...items]));
          setHasMore(response.page < response.totalPages);
          setPage(response.page);
        } else {
          showErrorToast(
            getApiErrorMessage(response, "Failed to load call history."),
          );
        }
      } catch (error) {
        showErrorToast(
          getApiErrorMessage(error, "Failed to load call history."),
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          if (isRefresh) {
            setRefreshing(false);
          }
        }
      }
    },
    [contactId, pharmacyId],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    void loadCalls(1, filter, true);
  }, [contactId, filter, loadCalls]);

  const sections = useMemo(() => groupContactCallItems(calls), [calls]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleItemPress = useCallback(
    (item: ContactCallItemDto) => {
      navigation.navigate(AppRoutes.CallDetails, { id: String(item.id) });
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    void loadCalls(page + 1, filter, false);
  }, [filter, hasMore, loadCalls, loading, loadingMore, page, refreshing]);

  const onRefresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }

    setRefreshing(true);
    void loadCalls(1, filter, true, true);
  }, [filter, loadCalls, loading, refreshing]);

  const keyExtractor = useCallback(
    (section: CallHistorySection) => section.key,
    [],
  );

  const renderSection = useCallback(
    ({ item }: { item: CallHistorySection }) => {
      return (
        <CallHistorySectionCard section={item} onItemPress={handleItemPress} />
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

    return <EmptyList title="No calls found." />;
  }, [loading]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearHeader title="Call History" onBackPress={handleBackPress} />
      <CallHistoryFilterTabs value={filter} onChange={setFilter} />
      {loading ? (
        <CallHistorySkeletonList />
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
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
    gap: Spacing.lg,
  },
  sectionSeparator: {
    height: Spacing.xs,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default CallHistory;
