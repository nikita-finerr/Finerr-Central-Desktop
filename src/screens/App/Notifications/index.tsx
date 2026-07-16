import {useCallback, useEffect, useMemo, useState, memo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { notificationApi } from "../../../api/notificationApi";
import { Colors, Spacing } from "../../../constants";
import { globalStyleDefinitions } from "../../../constants/globalStyleDefinitions";
import { setUnreadCount } from "../../../redux/notification/notificationSlice";
import type { AppDispatch } from "../../../redux/store";
import type { Notification } from "../../../types/notification";
import { getApiErrorMessage } from "../../../utils/apiError";
import { showErrorToast } from "../../../utils/toast";
import { ScreenHeader } from "../../../components/common/Header";
import NotificationCard from "./components/NotificationCard";
import NotificationEmptyList from "./components/NotificationEmptyList";
import NotificationSkeletonList from "./components/NotificationSkeletonList";
import SectionHeader from "./components/SectionHeader";
import {
  flattenNotificationSections,
  groupNotificationsBySection,
  type NotificationListRow,
} from "./utils";

const PAGE_SIZE = 20;

const Notifications = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    void loadNotifications(page);
  }, []);

  const loadNotifications = useCallback(
    async (page: number) => {
      try {
        const response = await notificationApi.list({
          page,
          pageSize: PAGE_SIZE,
        });

        if (response?.success && Array.isArray(response.data)) {
          setNotifications((prev) => [...prev, ...response.data]);
          dispatch(setUnreadCount(response.unreadCount ?? 0));
          setHasMore(response.page < response.totalPages);
          setPage(response.page);
        } else {
          showErrorToast(
            getApiErrorMessage(response, "Failed to load notifications"),
          );
        }
      } catch (error) {
        showErrorToast(
          getApiErrorMessage(error, "Failed to load notifications"),
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [dispatch],
  );

  const listData = useMemo(() => {
    const sections = groupNotificationsBySection(notifications);
    return flattenNotificationSections(sections);
  }, [notifications]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    void loadNotifications(page + 1);
  }, [hasMore, loadNotifications, loading, loadingMore, page]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationListRow }) => {
      if (item?.type === "header") {
        return <SectionHeader label={item.label} />;
      }

      return (
        <NotificationCard
          notification={item.notification}
          setNotifications={setNotifications}
        />
      );
    },
    [setNotifications, notifications],
  );

  const keyExtractor = useCallback(
    (item: NotificationListRow, index: number) => item.key + index.toString(),
    [],
  );

  const isEmpty = !loading && notifications.length === 0;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Notifications"
        description="Stay updated with your activity"
      />
      {loading ? (
        <NotificationSkeletonList />
      ) : isEmpty ? (
        <NotificationEmptyList />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingBottom: Spacing.xxl,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default Notifications;
