import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { SquarePen } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { messageApi } from "../../../api/messageApi";
import ModuleFab from "../../../components/common/Button/ModuleFab";
import EmptyList from "../../../components/common/EmptyList";
import { TabHeader } from "../../../components/common/Header";
import SearchBar from "../../../components/common/Input/SearchBar";
import { AppRoutes, Colors, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../hooks/usePermissions";
import { setUnreadCount } from "../../../redux/message/messageSlice";
import type { AppDispatch, RootState } from "../../../redux/store";
import type { SmsConversation } from "../../../types/message";
import { getApiErrorMessage } from "../../../utils/apiError";
import { showErrorToast } from "../../../utils/toast";
import MessagesSkeletonList from "./components/MessagesSkeletonList";
import SMSContactCard from "./components/SMSContactCard";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

const Messages = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const isFocused = useIsFocused();

  const pharmacy = useSelector((state: RootState) => state.auth.userData);
  const { canManageMessages } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [conversations, setConversations] = useState<SmsConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadConversations = useCallback(
    async (
      pageToLoad: number,
      search: string,
      reset: boolean,
      isRefresh = false,
    ) => {
      if (!pharmacy?.merchantId) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        return;
      }

      const requestId = ++requestIdRef.current;

      try {
        const response = await messageApi.listSmsConversations({
          PharmacyId: pharmacy?.merchantId,
          Search: search || "",
          Page: pageToLoad,
          PageSize: PAGE_SIZE,
        });
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (response?.success && Array.isArray(response.data)) {
          setConversations((prev) =>
            reset ? response.data : [...prev, ...response.data],
          );
          dispatch(setUnreadCount(response.totalUnreadCount ?? 0));
          setHasMore(response.page < response.totalPages);
          setPage(response.page);
        } else {
          showErrorToast(
            getApiErrorMessage(response, "Failed to load messages"),
          );
        }
      } catch (error) {
        showErrorToast(getApiErrorMessage(error, "Failed to load messages"));
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
    [dispatch, pharmacy?.merchantId],
  );

  useEffect(() => {
    if (isFocused) {
      setPage(0);
      void loadConversations(0, debouncedSearch, true);
    }
  }, [debouncedSearch, loadConversations, isFocused]);

  const onNewMessagePress = () => {
    navigation.navigate(AppRoutes.NewMessage);
  };

  const renderItem = useCallback(({ item }: { item: SmsConversation }) => {
    return <SMSContactCard item={item} />;
  }, []);

  const ItemSepratorComponent = useCallback(() => {
    return <View style={styles.itemSeparator} />;
  }, []);

  const keyExtractor = useCallback(
    (item: SmsConversation) => item?.id?.toString(),
    [],
  );

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return null;
    }

    return <EmptyList title="No messages found." />;
  }, [loading]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    void loadConversations(page + 1, debouncedSearch, false);
  }, [
    debouncedSearch,
    hasMore,
    loadConversations,
    loading,
    loadingMore,
    page,
    refreshing,
  ]);

  const onRefresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }

    setRefreshing(true);
    void loadConversations(0, debouncedSearch, true, true);
  }, [debouncedSearch, loadConversations, loading, refreshing]);

  return (
    <View style={styles.safeArea}>
      <TabHeader
        title="Messages"
        description="Stay connected with messaging."
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search messages..."
          />
        </View>
        {loading ? (
          <MessagesSkeletonList />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            ItemSeparatorComponent={ItemSepratorComponent}
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
        {canManageMessages ? (
          <ModuleFab
            icon={SquarePen}
            label="New Message"
            onPress={onNewMessagePress}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    width: "100%",
  },
  searchContainer: {
    paddingBottom: Spacing.md,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default Messages;
