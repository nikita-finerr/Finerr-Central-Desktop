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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { voicemailApi } from "../../../api/voicemailApi";
import EmptyList from "../../../components/common/EmptyList";
import { TabHeader } from "../../../components/common/Header";
import SearchBar from "../../../components/common/Input/SearchBar";
import { Colors, Radius, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { useOutboundCall } from "../../../hooks/useOutboundCall";
import type { RootState } from "../../../redux/store";
import type { VoicemailMessageDto } from "../../../types/voicemail";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  getPharmacyPbxConfig,
  type PharmacyPbxConfig,
} from "../../../utils/pharmacyPbxConfig";
import { showErrorToast, showSuccessToast } from "../../../utils/toast";
import VoicemailCard from "./components/VoicemailCard";
import VoicemailDeleteModal from "./components/VoicemailDeleteModal";
import VoicemailFilterMenu from "./components/VoicemailFilterMenu";
import VoicemailSkeletonList from "./components/VoicemailSkeletonList";
import {
  filterVoicemailMessages,
  getVoicemailCallerName,
  getVoicemailCallerPhone,
  type VoicemailFilter,
} from "./data/voicemailRecords";

const VOICEMAIL_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 500;

const VoiceMailScreen = () => {
  const isFocused = useIsFocused();
  const pharmacy = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy,
  );
  const pbxConfig = useMemo(() => getPharmacyPbxConfig(pharmacy), [pharmacy]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [voicemailFilter, setVoicemailFilter] =
    useState<VoicemailFilter>("All");
  const [messages, setMessages] = useState<VoicemailMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<VoicemailMessageDto | null>(
    null,
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadVoicemails = useCallback(
    async (
      offsetToLoad: number,
      reset: boolean,
      options: { search: string; isRefresh?: boolean },
    ) => {
      const { search, isRefresh = false } = options;

      if (!pbxConfig) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setMessages([]);
        showErrorToast("Voicemail API is not configured for this pharmacy.");
        return;
      }

      try {
        const response = await voicemailApi.list({
          ...pbxConfig,
          limit: VOICEMAIL_PAGE_SIZE,
          offset: offsetToLoad,
          includeDeleted: false,
          extension: pharmacy?.sipExtension?.toString(),
        });

        let nextMessages = response.messages ?? [];

        if (search) {
          const normalized = search.toLowerCase();
          nextMessages = nextMessages.filter((message) => {
            const callerName = getVoicemailCallerName(message).toLowerCase();
            const phone = getVoicemailCallerPhone(message);
            return (
              callerName.includes(normalized) || phone.includes(normalized)
            );
          });
        }

        setMessages((prev) =>
          reset ? nextMessages : [...prev, ...nextMessages],
        );
        setHasMore(
          offsetToLoad + (response.messages?.length ?? 0) <
            (response.total ?? 0),
        );
        setOffset(offsetToLoad);
      } catch (error) {
        showErrorToast(getApiErrorMessage(error, "Failed to load voicemails."));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        if (isRefresh) {
          setRefreshing(false);
        }
      }
    },
    [pbxConfig],
  );

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    setLoading(true);
    void loadVoicemails(0, true, { search: debouncedSearch });
  }, [debouncedSearch, isFocused, loadVoicemails]);

  const voicemails = useMemo(
    () => filterVoicemailMessages(messages, voicemailFilter, ""),
    [messages, voicemailFilter],
  );

  const handleMessageUpdated = (updated: VoicemailMessageDto) => {
    setMessages((current) =>
      current.map((message) => (message.id === updated.id ? updated : message)),
    );
  };

  const handleDelete = (item: VoicemailMessageDto) => {
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !pbxConfig || deleting) {
      return;
    }

    setDeleting(true);
    try {
      await voicemailApi.delete({
        ...pbxConfig,
        id: deleteTarget.id,
      });
      setMessages((current) =>
        current.filter((message) => message.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      showSuccessToast("Voicemail deleted.");
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, "Failed to delete voicemail."));
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }

    setRefreshing(true);
    void loadVoicemails(0, true, { search: debouncedSearch, isRefresh: true });
  }, [debouncedSearch, loadVoicemails, loading, refreshing]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading || debouncedSearch) {
      return;
    }

    setLoadingMore(true);
    void loadVoicemails(offset + VOICEMAIL_PAGE_SIZE, false, {
      search: debouncedSearch,
    });
  }, [debouncedSearch, hasMore, loadVoicemails, loading, loadingMore, offset]);

  const renderItem = useCallback(
    ({ item }: { item: VoicemailMessageDto }) => (
      <VoicemailCard
        item={item}
        pbxConfig={pbxConfig}
        onDelete={() => handleDelete(item)}
        onMessageUpdated={(updated) => handleMessageUpdated(updated)}
      />
    ),
    [pbxConfig],
  );

  const ItemSeparatorComponent = useCallback(() => {
    return <View style={styles.itemSeparator} />;
  }, []);

  const keyExtractor = useCallback((item: VoicemailMessageDto) => item.id, []);

  const ListEmptyComponent = useCallback(() => {
    return <EmptyList title="No voicemails found." />;
  }, []);

  return (
    <View style={styles.root}>
      <TabHeader
        title="Voicemail"
        description="Review and manage your voicemail."
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search voicemail…"
          />
        </View>
        <VoicemailFilterMenu
          value={voicemailFilter}
          onChange={setVoicemailFilter}
        />
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <VoicemailSkeletonList />
        ) : (
          <FlatList
            data={voicemails}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
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

      <VoicemailDeleteModal
        visible={deleteTarget != null}
        contactName={
          deleteTarget ? getVoicemailCallerName(deleteTarget) : undefined
        }
        onCancel={handleCancelDelete}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    zIndex: 20,
    overflow: "visible",
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: 120,
  },
  itemSeparator: {
    height: Spacing.md,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default VoiceMailScreen;
