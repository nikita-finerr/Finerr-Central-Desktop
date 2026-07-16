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
import { Printer } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { faxApi } from "../../../api/faxApi";
import ModuleFab from "../../../components/common/Button/ModuleFab";
import EmptyList from "../../../components/common/EmptyList";
import { TabHeader } from "../../../components/common/Header";
import SearchBar from "../../../components/common/Input/SearchBar";
import { AppRoutes, Colors, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../hooks/usePermissions";
import { setUnreadCount } from "../../../redux/fax/faxSlice";
import type { AppDispatch, RootState } from "../../../redux/store";
import type { FaxDto, FaxListParams } from "../../../types/fax";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  downloadFaxDocument,
  getFaxDocumentUrl,
} from "../../../utils/downloadFaxDocument";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import type { FaxFilter } from "../Messages/data/faxRecords";
import { getDocumentName } from "../Messages/data/faxRecords";
import AttachmentPreviewModal from "../Messages/NewMessage/components/AttachmentPreviewModal";
import type { MessageAttachment } from "../Messages/NewMessage/types";
import { isPdfAttachment } from "../Messages/NewMessage/utils/attachmentPreview";
import FaxCard from "./components/FaxCard";
import FaxFilterMenu from "./components/FaxFilterMenu";
import FaxSkeletonList from "./components/FaxSkeletonList";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 500;

const buildFaxListParams = (
  pharmacyId: number,
  filter: FaxFilter,
  search: string,
  page: number,
  pageSize: number,
): FaxListParams => {
  const params: FaxListParams = {
    PharmacyId: pharmacyId,
    Page: page,
    PageSize: pageSize,
  };

  if (search.trim()) {
    params.Search = search.trim();
  }

  if (filter === "sent") {
    params.Direction = "outgoing";
  } else if (filter === "received") {
    params.Direction = "incoming";
  } else if (filter === "failed") {
    params.StatusFilter = "failed";
  }

  return params;
};

const FaxScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const isFocused = useIsFocused();
  const { canManageFax } = usePermissions();
  const pharmacy = useSelector((state: RootState) => state.auth.userData);
  const faxUnreadCount = useSelector(
    (state: RootState) => state.fax.unreadCount,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [faxFilter, setFaxFilter] = useState<FaxFilter>("all");
  const [faxes, setFaxes] = useState<FaxDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [previewAttachment, setPreviewAttachment] =
    useState<MessageAttachment | null>(null);
  const [resendingIds, setResendingIds] = useState<Record<number, boolean>>({});

  const closePreview = useCallback(() => {
    setPreviewAttachment(null);
  }, []);

  const markFaxAsRead = useCallback(
    (item: FaxDto) => {
      if (item.isRead) {
        return;
      }

      setFaxes((current) =>
        current.map((fax) =>
          fax.id === item.id ? { ...fax, isRead: true } : fax,
        ),
      );
      dispatch(setUnreadCount(Math.max(0, faxUnreadCount - 1)));

      void faxApi.markRead(item.id, {
        pharmacyId: pharmacy?.pharmacy?.pharmacyId ?? 0,
        ...(item.telnyxFaxId ? { telnyxFaxId: item.telnyxFaxId } : {}),
      });
    },
    [dispatch, faxUnreadCount, pharmacy?.pharmacy?.pharmacyId],
  );

  const openDocumentPreview = useCallback(
    (item: FaxDto) => {
      const url = getFaxDocumentUrl(item);
      if (!url) {
        showErrorToast("Document unavailable.");
        return;
      }

      markFaxAsRead(item);

      const name = getDocumentName(item);
      const isImage = Boolean(
        item.imagePreviewUrl && !isPdfAttachment(null, name),
      );

      setPreviewAttachment({
        id: String(item.id),
        uri: url,
        name,
        mimeType: isImage ? "image/jpeg" : "application/pdf",
        kind: isImage ? "image" : "pdf",
      });
    },
    [markFaxAsRead],
  );

  const handleDownloadPress = useCallback((item: FaxDto) => {
    void downloadFaxDocument(item);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadFaxes = useCallback(
    async (
      pageToLoad: number,
      search: string,
      filter: FaxFilter,
      reset: boolean,
    ) => {
      if (!pharmacy?.merchantId) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        return;
      }

      try {
        const response = await faxApi.list(
          buildFaxListParams(
            pharmacy?.pharmacy?.pharmacyId ?? 0,
            filter,
            search,
            pageToLoad,
            PAGE_SIZE,
          ),
        );

        if (response?.success && response.data?.items) {
          const items = response.data.items;
          setFaxes((current) => (reset ? items : [...current, ...items]));
          dispatch(setUnreadCount(response.data.unreadCount ?? 0));
          setHasMore(response.data.page < response.data.totalPages);
          setPage(response.data.page);
        } else {
          showErrorToast(getApiErrorMessage(response, "Failed to load faxes."));
        }
      } catch (error) {
        showErrorToast(getApiErrorMessage(error, "Failed to load faxes."));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [dispatch, pharmacy?.merchantId],
  );

  const handleResendPress = useCallback(
    async (item: FaxDto) => {
      if (!canManageFax) {
        return;
      }

      let alreadyResending = false;
      setResendingIds((current) => {
        if (current[item.id]) {
          alreadyResending = true;
          return current;
        }

        return { ...current, [item.id]: true };
      });

      if (alreadyResending) {
        return;
      }

      try {
        const response = await faxApi.resend(item.id, {
          pharmacyId: pharmacy?.pharmacy?.pharmacyId ?? 0,
        });

        if (!response?.success) {
          showErrorToast(getApiErrorMessage(response, "Failed to resend fax."));
          return;
        }

        showSuccessToast("Fax resend started.");

        setFaxes((current) =>
          current.map((fax) =>
            fax.id === item.id
              ? {
                  ...fax,
                  status: "queued",
                  updatedAt: new Date().toISOString(),
                }
              : fax,
          ),
        );
      } catch (error) {
        showErrorToast(getApiErrorMessage(error, "Failed to resend fax."));
      } finally {
        setResendingIds((current) => {
          const next = { ...current };
          delete next[item.id];
          return next;
        });
      }
    },
    [canManageFax, debouncedSearch, faxFilter, loadFaxes],
  );

  useEffect(() => {
    if (!isFocused) return;

    setLoading(true);
    setPage(1);
    void loadFaxes(0, debouncedSearch, faxFilter, true);
  }, [debouncedSearch, faxFilter, isFocused, loadFaxes]);

  const onSendFaxPress = () => {
    navigation.navigate(AppRoutes.SendFax);
  };

  const renderItem = useCallback(
    ({ item }: { item: FaxDto }) => (
      <FaxCard
        item={item}
        onDocumentPress={openDocumentPreview}
        onDownloadPress={handleDownloadPress}
        onResendPress={canManageFax ? handleResendPress : undefined}
        resending={Boolean(resendingIds[item.id])}
      />
    ),
    [
      canManageFax,
      handleDownloadPress,
      handleResendPress,
      openDocumentPreview,
      resendingIds,
    ],
  );

  const ItemSepratorComponent = useCallback(() => {
    return <View style={styles.itemSeparator} />;
  }, []);

  const keyExtractor = useCallback((item: FaxDto) => String(item.id), []);

  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return null;
    }

    return <EmptyList title="No faxes found." />;
  }, [loading]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }

    setLoadingMore(true);
    void loadFaxes(page + 1, debouncedSearch, faxFilter, false);
  }, [
    debouncedSearch,
    faxFilter,
    hasMore,
    loadFaxes,
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
    void loadFaxes(1, debouncedSearch, faxFilter, true);
  }, [debouncedSearch, faxFilter, loadFaxes, loading, refreshing]);

  return (
    <View style={styles.root}>
      <TabHeader
        title="Fax"
        description="Send and receive secure fax documents."
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search faxes..."
            />
          </View>
          <FaxFilterMenu value={faxFilter} onChange={setFaxFilter} />
        </View>
        {loading ? (
          <FaxSkeletonList />
        ) : (
          <FlatList
            data={faxes}
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
        {canManageFax ? (
          <ModuleFab icon={Printer} label="Send Fax" onPress={onSendFaxPress} />
        ) : null}
      </View>

      <AttachmentPreviewModal
        attachment={previewAttachment}
        onClose={closePreview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    overflow: "visible",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 170,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    width: "100%",
  },
  searchContainer: {
    paddingBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    zIndex: 20,
    overflow: "visible",
  },
  searchBarContainer: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default FaxScreen;
