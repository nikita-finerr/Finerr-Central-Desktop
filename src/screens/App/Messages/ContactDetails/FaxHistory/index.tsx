import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View, StatusBar } from "react-native";
import { useSelector } from "react-redux";

import { contactApi } from "../../../../../api/contactApi";
import EmptyList from "../../../../../components/common/EmptyList";
import { LinearHeader } from "../../../../../components/common/Header";
import SearchBar from "../../../../../components/common/Input/SearchBar";
import { Colors, Spacing } from "../../../../../constants";
import { globalStyleDefinitions } from "../../../../../constants/globalStyleDefinitions";
import type { RootState } from "../../../../../redux/store";
import type { ContactFaxItemDto } from "../../../../../types/contact";
import { getApiErrorMessage } from "../../../../../utils/apiError";
import { showErrorToast } from "../../../../../utils/toast";
import FaxHistoryFilterTabs from "./components/FaxHistoryFilterTabs";
import FaxHistorySectionCard from "./components/FaxHistorySection";
import FaxHistorySkeletonList from "./components/FaxHistorySkeletonList";
import {
  getFaxFilterParam,
  groupContactFaxItems,
  matchesFaxSearch,
  type FaxHistoryFilter,
  type FaxHistorySection,
} from "./data/faxHistory";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 500;

type RouteParams = {
  FaxHistory: { id?: string };
};

const FaxHistory = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "FaxHistory">>();
  const contactId = route.params?.id;
  const pharmacyId = useSelector(
    (state: RootState) => state.auth.userData?.merchantId ?? 0,
  );

  const [filter, setFilter] = useState<FaxHistoryFilter>("");
  const [faxes, setFaxes] = useState<ContactFaxItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadFaxes = useCallback(
    async (
      pageToLoad: number,
      activeFilter: FaxHistoryFilter,
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

      const filterParam = getFaxFilterParam(activeFilter);

      try {
        const response = await contactApi.listFaxes(contactId, {
          PharmacyId: pharmacyId,
          Page: pageToLoad,
          PageSize: PAGE_SIZE,
          ...(filterParam ? { Filter: filterParam } : {}),
        });

        if (response?.success) {
          const items = response.items ?? [];
          setFaxes((current) => (reset ? items : [...current, ...items]));
          setHasMore(response.page < response.totalPages);
          setPage(response.page);
        } else {
          showErrorToast(
            getApiErrorMessage(response, "Failed to load fax history."),
          );
        }
      } catch (error) {
        showErrorToast(
          getApiErrorMessage(error, "Failed to load fax history."),
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        if (isRefresh) {
          setRefreshing(false);
        }
      }
    },
    [contactId, pharmacyId],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    void loadFaxes(1, filter, true);
  }, [contactId, filter, loadFaxes]);

  const sections = useMemo(() => groupContactFaxItems(faxes), [faxes]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    void loadFaxes(page + 1, filter, false);
  }, [filter, hasMore, loadFaxes, loading, loadingMore, page, refreshing]);

  const onRefresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }

    setRefreshing(true);
    void loadFaxes(1, filter, true, true);
  }, [filter, loadFaxes, loading, refreshing]);

  const keyExtractor = useCallback(
    (section: FaxHistorySection) => section.key,
    [],
  );

  const renderSection = useCallback(
    ({ item }: { item: FaxHistorySection }) => (
      <FaxHistorySectionCard section={item} />
    ),
    [],
  );

  const ItemSeparatorComponent = useCallback(() => {
    return <View style={styles.sectionSeparator} />;
  }, []);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return null;
    }

    return <EmptyList title="No faxes found." />;
  }, [loading]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearHeader title="Fax History" onBackPress={handleBackPress} />
      <FaxHistoryFilterTabs value={filter} onChange={setFilter} />

      {loading ? (
        <FaxHistorySkeletonList />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={keyExtractor}
          renderItem={renderSection}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

export default FaxHistory;
