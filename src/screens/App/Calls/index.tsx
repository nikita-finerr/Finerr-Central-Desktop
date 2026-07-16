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
import { UserPlus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { contactApi } from "../../../api/contactApi";
import { recordingsApi } from "../../../api/recordingsApi";
import ModuleFab from "../../../components/common/Button/ModuleFab";
import EmptyList from "../../../components/common/EmptyList";
import { TabHeader } from "../../../components/common/Header";
import SearchBar from "../../../components/common/Input/SearchBar";
import { AppRoutes, Colors, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { useOutboundCall } from "../../../hooks/useOutboundCall";
import { usePermissions } from "../../../hooks/usePermissions";
import type { RootState } from "../../../redux/store";
import type { ChatContactDto } from "../../../types/contact";
import { getApiErrorMessage } from "../../../utils/apiError";
import { showErrorToast } from "../../../utils/toast";
import CallFilterMenu from "./components/CallFilterMenu";
import CallHistoryCard from "./components/CallHistoryCard";
import CallsContactsSkeletonList from "./components/CallsContactsSkeletonList";
import CallsRecentSkeletonList from "./components/CallsRecentSkeletonList";
import ContactListSection from "./components/ContactListSection";
import CallsTopTab, { type CallsSection } from "./components/CallsTopTab";
import {
  groupCallContactsByLetter,
  hasCallContactPhone,
  type CallContactSection,
} from "./data/callContacts";
import { type CallRecord, type RecentCallsFilter } from "./data/callRecords";
import { mapRecordingsToCallRecords } from "./data/recentRecordings";
import {
  buildRecordingsListQuery,
  matchesCallRecordSearch,
  shouldClientFilterSearch,
} from "./data/recentRecordingsQuery";

const RECORDINGS_PAGE_SIZE = 200;
const CONTACTS_PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 500;

type RecentCallListItemProps = {
  item: CallRecord;
  onOpenCallDetail: (id: string) => void;
};

const RecentCallListItem = ({
  item,
  onOpenCallDetail,
}: RecentCallListItemProps) => (
  <CallHistoryCard item={item} onPress={() => onOpenCallDetail(item.id)} />
);

const SUBTITLES: Record<CallsSection, string> = {
  recents: "Incoming, outgoing, and missed calls",
  contacts: "Patients, providers, and care partners",
};

const CallsScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const isFocused = useIsFocused();

  const { loading: dialing } = useOutboundCall();
  const { canManageContacts } = usePermissions();

  const pharmacy = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy,
  );
  const userId = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy?.userId,
  );

  const [section, setSection] = useState<CallsSection>("recents");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recentCallsFilter, setRecentCallsFilter] =
    useState<RecentCallsFilter>("All");
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [contacts, setContacts] = useState<ChatContactDto[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsRefreshing, setContactsRefreshing] = useState(false);
  const [contactsLoadingMore, setContactsLoadingMore] = useState(false);
  const [contactsHasMore, setContactsHasMore] = useState(false);
  const [contactsPage, setContactsPage] = useState(0);
  const [expandedContactSections, setExpandedContactSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadRecordings = useCallback(
    async (
      offsetToLoad: number,
      reset: boolean,
      options: {
        filter: RecentCallsFilter;
        search: string;
        isRefresh?: boolean;
      },
    ) => {
      const baseUrl = pharmacy?.domainName?.trim();
      const apiKey = pharmacy?.apiKey?.trim();
      const { filter, search, isRefresh = false } = options;

      if (!baseUrl || !apiKey) {
        setLoading(false);
        setLoadingMore(false);
        if (isRefresh) {
          setRefreshing(false);
        }
        if (reset) {
          setRecords([]);
        }
        showErrorToast("Recordings API is not configured for this pharmacy.");
        return;
      }

      try {
        const response = await recordingsApi.list({
          baseUrl,
          apiKey,
          limit: RECORDINGS_PAGE_SIZE,
          offset: offsetToLoad,
          ...buildRecordingsListQuery(filter, search),
        });

        let mapped = mapRecordingsToCallRecords(response.recordings ?? []);

        if (filter === "Missed Calls") {
          mapped = mapped.filter((record) => record.isMissed);
        }

        if (shouldClientFilterSearch(search)) {
          mapped = mapped.filter((record) =>
            matchesCallRecordSearch(record, search),
          );
        }

        setRecords((prev) => (reset ? mapped : [...prev, ...mapped]));
        setHasMore(
          offsetToLoad + (response.recordings?.length ?? 0) <
            (response.total ?? 0),
        );
        setOffset(offsetToLoad);
      } catch (error) {
        showErrorToast(getApiErrorMessage(error, "Failed to load calls."));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        if (isRefresh) {
          setRefreshing(false);
        }
      }
    },
    [pharmacy?.apiKey, pharmacy?.domainName],
  );

  const loadContacts = useCallback(
    async (pageIndex: number, search: string, reset: boolean) => {
      if (!userId) {
        setContactsLoading(false);
        setContactsLoadingMore(false);
        setContactsRefreshing(false);
        return;
      }

      try {
        const response = await contactApi.contacts({
          userId,
          pageIndex,
          pageSize: CONTACTS_PAGE_SIZE,
          ...(search ? { search } : {}),
        });
        const items = (response?.items ?? []).filter(hasCallContactPhone);

        setContacts((prev) => (reset ? items : [...prev, ...items]));
        setContactsHasMore(
          (response?.pageIndex ?? pageIndex) + 1 < (response?.totalPages ?? 0),
        );
        setContactsPage(response?.pageIndex ?? pageIndex);
      } catch (error) {
        showErrorToast(getApiErrorMessage(error, "Failed to load contacts."));
      } finally {
        setContactsLoading(false);
        setContactsLoadingMore(false);
        setContactsRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (section !== "contacts") {
      return;
    }

    setContactsPage(0);
    loadContacts(0, debouncedSearch, true);
  }, [debouncedSearch, loadContacts, section, isFocused]);

  useEffect(() => {
    if (section !== "recents" || !isFocused) {
      return;
    }

    setLoading(true);
    setRecords([]);
    setOffset(0);
    void loadRecordings(0, true, {
      filter: recentCallsFilter,
      search: debouncedSearch,
    });
  }, [debouncedSearch, isFocused, loadRecordings, recentCallsFilter, section]);

  const handleRecentsRefresh = useCallback(() => {
    if (loading || refreshing) {
      return;
    }

    setRefreshing(true);
    void loadRecordings(0, true, {
      filter: recentCallsFilter,
      search: debouncedSearch,
      isRefresh: true,
    });
  }, [debouncedSearch, loadRecordings, loading, recentCallsFilter, refreshing]);

  const contactSections = useMemo(
    () => groupCallContactsByLetter(contacts),
    [contacts],
  );

  useEffect(() => {
    if (section !== "contacts") {
      return;
    }

    setExpandedContactSections((current) => {
      const next = { ...current };

      for (const contactSection of contactSections) {
        if (!(contactSection.key in next)) {
          next[contactSection.key] = true;
        }
      }

      return next;
    });
  }, [contactSections, section]);

  useEffect(() => {
    if (section !== "contacts" || !debouncedSearch) {
      return;
    }

    setExpandedContactSections((current) => {
      const next = { ...current };

      for (const contactSection of contactSections) {
        next[contactSection.key] = true;
      }

      return next;
    });
  }, [contactSections, debouncedSearch, section]);

  const openCallDetail = useCallback(
    (id: string) => navigation.navigate(AppRoutes.CallDetails, { id }),
    [navigation],
  );

  const handleContactsRefresh = useCallback(() => {
    if (contactsLoading || contactsRefreshing) {
      return;
    }

    setContactsRefreshing(true);
    void loadContacts(0, debouncedSearch, true);
  }, [contactsLoading, contactsRefreshing, debouncedSearch, loadContacts]);

  const handleLoadMoreContacts = useCallback(() => {
    if (contactsLoadingMore || !contactsHasMore || contactsLoading) {
      return;
    }

    setContactsLoadingMore(true);
    void loadContacts(contactsPage + 1, debouncedSearch, false);
  }, [
    contactsHasMore,
    contactsLoading,
    contactsLoadingMore,
    contactsPage,
    debouncedSearch,
    loadContacts,
  ]);

  const handleAddContactPress = useCallback(() => {
    navigation.navigate(AppRoutes.AddContact);
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) {
      return;
    }

    setLoadingMore(true);
    void loadRecordings(offset + RECORDINGS_PAGE_SIZE, false, {
      filter: recentCallsFilter,
      search: debouncedSearch,
    });
  }, [
    debouncedSearch,
    hasMore,
    loadRecordings,
    loading,
    loadingMore,
    offset,
    recentCallsFilter,
  ]);

  const recentKeyExtractor = useCallback((item: CallRecord) => item.id, []);

  const contactKeyExtractor = useCallback(
    (item: CallContactSection) => item.key,
    [],
  );

  const toggleContactSection = useCallback((key: string) => {
    setExpandedContactSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  const renderContactSection = useCallback(
    ({ item }: { item: CallContactSection }) => (
      <ContactListSection
        section={item}
        expanded={expandedContactSections[item.key] ?? true}
        onToggle={() => toggleContactSection(item.key)}
      />
    ),
    [expandedContactSections, toggleContactSection],
  );

  const ContactSectionSeparator = useCallback(
    () => <View style={styles.contactSectionSeparator} />,
    [],
  );

  const renderRecent = useCallback(
    function RenderRecent({ item }: { item: CallRecord }) {
      return (
        <RecentCallListItem item={item} onOpenCallDetail={openCallDetail} />
      );
    },
    [openCallDetail],
  );

  const ItemSeparatorComponent = useCallback(() => {
    return <View style={styles.itemSeparator} />;
  }, []);

  const RecentEmptyList = useCallback(() => {
    if (loading) {
      return null;
    }

    return <EmptyList title="No calls found." />;
  }, [loading]);

  const ContactEmptyList = useCallback(() => {
    if (contactsLoading) {
      return null;
    }

    return <EmptyList title="No contacts found." />;
  }, [contactsLoading]);

  const ContactsListFooter = useCallback(() => {
    if (!contactsLoadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }, [contactsLoadingMore]);

  const ListFooterComponent = useCallback(() => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }, [loadingMore]);

  return (
    <View style={styles.root}>
      <TabHeader title="Calls" description={SUBTITLES[section]} />
      <CallsTopTab value={section} onChange={setSection} />

      <View
        style={[
          styles.searchContainer,
          section === "recents" && styles.searchContainerRecents,
        ]}
      >
        <View
          style={section === "recents" ? styles.searchBarContainer : undefined}
        >
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              section === "contacts" ? "Search contacts…" : "Search calls…"
            }
          />
        </View>
        {section === "recents" ? (
          <CallFilterMenu
            value={recentCallsFilter}
            onChange={setRecentCallsFilter}
          />
        ) : null}
      </View>

      {section === "recents" && loading ? (
        <View style={styles.skeletonContainer}>
          <CallsRecentSkeletonList />
        </View>
      ) : null}

      {section === "recents" && !loading ? (
        <FlatList
          data={records}
          keyExtractor={recentKeyExtractor}
          renderItem={renderRecent}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListEmptyComponent={RecentEmptyList}
          ListFooterComponent={ListFooterComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRecentsRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
      ) : null}

      {section === "contacts" && contactsLoading ? (
        <View style={styles.skeletonContainer}>
          <CallsContactsSkeletonList />
        </View>
      ) : null}

      {section === "contacts" && !contactsLoading ? (
        <FlatList
          data={contactSections}
          keyExtractor={contactKeyExtractor}
          renderItem={renderContactSection}
          contentContainerStyle={styles.contactsListContent}
          ItemSeparatorComponent={ContactSectionSeparator}
          ListEmptyComponent={ContactEmptyList}
          ListFooterComponent={ContactsListFooter}
          refreshControl={
            <RefreshControl
              refreshing={contactsRefreshing}
              onRefresh={handleContactsRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMoreContacts}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
      ) : null}

      {section === "contacts" && canManageContacts ? (
        <ModuleFab
          icon={UserPlus}
          label="Add contact"
          onPress={handleAddContactPress}
        />
      ) : null}

      {dialing ? (
        <View style={styles.dialingOverlay} pointerEvents="none">
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : null}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchContainerRecents: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    zIndex: 20,
    overflow: "visible",
  },
  searchBarContainer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: 120,
  },
  contactsListContent: {
    flexGrow: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: 150,
    gap: Spacing.lg,
  },
  contactSectionSeparator: {
    height: Spacing.xs,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    width: "100%",
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: 120,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  dialingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.45)",
  },
});

export default CallsScreen;
