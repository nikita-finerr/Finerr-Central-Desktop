import { RouteProp, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, type LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, type ScrollViewProps, StyleSheet, View, StatusBar } from "react-native";
import {
  KeyboardGestureArea,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { messageApi } from "../../../../api/messageApi";
import { Colors, Dimensions, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../hooks/usePermissions";
import type { RootState } from "../../../../redux/store";
import type { ChatMessageDto } from "../../../../types/message";
import { getApiErrorMessage } from "../../../../utils/apiError";
import {
  normalizePhoneForChatApi,
  normalizePhoneForSendApi,
} from "../../../../utils/phoneUtils";
import { showErrorToast } from "../../../../utils/toast";
import type { MessageAttachment } from "../NewMessage/types";
import ChatAttachmentSheet from "./components/ChatAttachmentSheet";
import ChatComposer from "./components/ChatComposer";
import ChatDateSeparator from "./components/ChatDateSeparator";
import ChatHeader from "./components/ChatHeader";
import ChatMessageItem from "./components/ChatMessageItem";
import ChatScrollToBottomButton from "./components/ChatScrollToBottomButton";
import ChatScrollView from "./components/ChatScrollView";
import ChatSkeletonList from "./components/ChatSkeletonList";
import {
  attachmentsToChatMessages,
  textToChatMessage,
} from "./utils/attachmentsToChatItems";
import { buildChatList, type ChatListItem } from "./utils/buildChatList";
import { getSearchMatchIds } from "./utils/chatSearch";

type RouteParams = {
  Chat: {
    id: string;
    contactName?: string;
    phoneNumber?: string;
    unreadCount?: number;
  };
};

const PAGE_SIZE = 50;
const SCROLL_TO_BOTTOM_THRESHOLD = Dimensions.height * 0.5;
const CHAT_COMPOSER_MIN_HEIGHT = 40;
const CHAT_KEYBOARD_MARGIN = 8;
const CHAT_COMPOSER_NATIVE_ID = "chat-composer-input";

const Chat = () => {
  const route = useRoute<RouteProp<RouteParams, "Chat">>();
  const { canManageMessages } = usePermissions();
  const { bottom } = useSafeAreaInsets();
  const extraContentPadding = useSharedValue(0);

  const { userData } = useSelector((state: RootState) => state.auth);

  const id = route.params?.id ?? "";
  const contactName = route.params?.contactName ?? "Contact";
  const phoneNumber = route.params?.phoneNumber ?? "";

  const [draft, setDraft] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [attachmentSheetVisible, setAttachmentSheetVisible] =
    useState<boolean>(false);
  const [pickingKind, setPickingKind] = useState<"camera" | "gallery" | null>(
    null,
  );
  const [apiMessages, setApiMessages] = useState<ChatMessageDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);

  const flatListRef = useRef<FlatList<ChatListItem>>(null);

  const renderScrollComponent = useCallback(
    (props: ScrollViewProps) => (
      <ChatScrollView {...props} extraContentPadding={extraContentPadding} />
    ),
    [extraContentPadding],
  );

  const onComposerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const height = event.nativeEvent.layout.height;
      extraContentPadding.value = withTiming(
        Math.max(height - CHAT_COMPOSER_MIN_HEIGHT, 0),
        { duration: 250 },
      );
    },
    [extraContentPadding],
  );

  const sourcePhone = useMemo(
    () => normalizePhoneForChatApi(phoneNumber),
    [phoneNumber],
  );

  const fetchPage = useCallback(
    async (pageIndex: number) => {
      if (!userData?.pharmacy?.userId || !sourcePhone) {
        return null;
      }

      return messageApi.listChatMessages({
        userId: userData?.pharmacy?.userId,
        source: sourcePhone,
        senderName: sourcePhone,
        pageIndex,
        pageSize: PAGE_SIZE,
      });
    },
    [userData?.pharmacy?.userId, sourcePhone],
  );

  const loadInitialMessages = async () => {
    if (!userData?.pharmacy?.userId || !sourcePhone) {
      setApiMessages([]);
      setPageIndex(0);
      setHasMore(false);
      setLoading(false);
      return;
    }
    try {
      const response = await fetchPage(0);

      if (!response?.items || !Array.isArray(response.items)) {
        showErrorToast(
          getApiErrorMessage(response, "Failed to load message history."),
        );
        setApiMessages([]);
        setPageIndex(0);
        setHasMore(false);
        return;
      }
      void markConversationRead();
      setApiMessages(response.items);
      setPageIndex(response?.pageIndex ?? 0);
      setHasMore(Boolean(response.hasMore));
    } catch (error) {
      showErrorToast(
        getApiErrorMessage(error, "Failed to load message history."),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const markConversationRead = useCallback(async () => {
    if (!userData?.pharmacy?.userId || !sourcePhone) return;

    try {
      await messageApi.markChatMessagesRead({
        userId: userData.pharmacy.userId,
        source: sourcePhone,
      });
    } catch {}
  }, [sourcePhone, userData?.pharmacy?.userId]);

  useEffect(() => {
    setApiMessages([]);
    setPageIndex(0);
    setHasMore(false);
    void loadInitialMessages();
  }, [sourcePhone, userData?.pharmacy?.userId]);

  const loadMoreMessages = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    const nextPage = pageIndex + 1;
    setLoadingMore(true);

    try {
      const response = await fetchPage(nextPage);

      if (!response?.items || !Array.isArray(response.items)) {
        showErrorToast(
          getApiErrorMessage(response, "Failed to load older messages."),
        );
        return;
      }
      setApiMessages((current) => [...current, ...response.items]);
      setPageIndex(response?.pageIndex ?? nextPage);
      setHasMore(Boolean(response.hasMore));
    } catch (error) {
      showErrorToast(
        getApiErrorMessage(error, "Failed to load older messages."),
      );
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, loading, pageIndex, hasMore, loadingMore]);

  const chatItems = useMemo(() => buildChatList(apiMessages), [apiMessages]);

  const searchMatchIds = useMemo(
    () =>
      isSearchOpen && searchQuery.trim()
        ? getSearchMatchIds(apiMessages, searchQuery)
        : [],
    [apiMessages, isSearchOpen, searchQuery],
  );

  const activeMatchId = searchMatchIds[activeMatchIndex] ?? null;

  const scrollToMessage = useCallback(
    (messageId: string) => {
      const index = chatItems.findIndex(
        (item) => item.type === "message" && item.id === messageId,
      );
      if (index < 0) return;

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      });
    },
    [chatItems],
  );

  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim()) {
      setActiveMatchIndex(0);
      return;
    }

    const lastIndex = Math.max(searchMatchIds.length - 1, 0);
    setActiveMatchIndex(lastIndex);
    const matchId = searchMatchIds[lastIndex];
    if (matchId) {
      scrollToMessage(matchId);
    }
  }, [isSearchOpen, scrollToMessage, searchMatchIds, searchQuery]);

  const appendLocalMessages = useCallback((messages: ChatMessageDto[]) => {
    if (messages.length === 0) return;
    setApiMessages((current) => [...messages, ...current]);
  }, []);

  const removeLocalMessagesByRefIds = useCallback((refIds: string[]) => {
    if (refIds.length === 0) return;
    const refIdSet = new Set(refIds);
    setApiMessages((current) =>
      current.filter((message) => !refIdSet.has(message.refId)),
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string, attachments: MessageAttachment[] = []) => {
      if (!canManageMessages) {
        return false;
      }

      if (!userData?.pharmacy?.userId || !phoneNumber.trim()) {
        showErrorToast("Unable to send message.");
        return false;
      }

      const trimmedText = text.trim();
      if (!trimmedText && attachments.length === 0) {
        return false;
      }

      const mobileNumber = normalizePhoneForSendApi(phoneNumber);
      const pendingMessages =
        attachments.length > 0
          ? attachmentsToChatMessages(attachments, userData, mobileNumber)
          : trimmedText
            ? [textToChatMessage(trimmedText, userData, mobileNumber)]
            : [];
      const pendingRefIds = pendingMessages.map((message) => message.refId);

      if (pendingMessages.length > 0) {
        appendLocalMessages(pendingMessages);
      }

      try {
        const formData = new FormData();
        formData.append("mobileNumber", mobileNumber);

        if (text?.trim()) {
          formData.append("text", text.trim());
        }

        for (const file of attachments) {
          formData.append("mmsFiles", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType ?? "application/octet-stream",
          } as unknown as Blob);
        }
        const response =
          attachments.length > 0
            ? await messageApi.sendChatMessageMultipart({
                userId: userData?.pharmacy?.userId,
                formData,
              })
            : await messageApi.sendChatMessage(userData?.pharmacy?.userId, {
                mobileNumber,
                text: trimmedText,
              });

        if (!response?.success) {
          removeLocalMessagesByRefIds(pendingRefIds);
          showErrorToast(
            getApiErrorMessage(response, "Failed to send message."),
          );
          return false;
        }
        return true;
      } catch (error) {
        removeLocalMessagesByRefIds(pendingRefIds);
        showErrorToast(getApiErrorMessage(error, "Failed to send message."));
        return false;
      }
    },
    [
      appendLocalMessages,
      canManageMessages,
      removeLocalMessagesByRefIds,
      userData,
      phoneNumber,
    ],
  );

  const onSend = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const sent = await sendMessage(text);
    if (!sent) {
      setDraft(text);
    }
  }, [draft, sendMessage]);

  const onAttach = useCallback(
    (attachments: MessageAttachment[]) => {
      if (!canManageMessages || attachments.length === 0) return;

      void sendMessage("", attachments);
    },
    [canManageMessages, sendMessage],
  );

  const onAttachPress = () => {
    if (!canManageMessages) return;

    setAttachmentSheetVisible(true);
  };

  const onCloseAttachmentSheet = () => {
    setAttachmentSheetVisible(false);
  };

  const onPickEnd = () => {
    setAttachmentSheetVisible(false);
    setPickingKind(null);
  };

  const onSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const onSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setActiveMatchIndex(0);
    Keyboard.dismiss();
  }, []);

  const onPrevMatch = useCallback(() => {
    if (activeMatchIndex <= 0) return;

    const nextIndex = activeMatchIndex - 1;
    const messageId = searchMatchIds[nextIndex];
    if (!messageId) return;

    setActiveMatchIndex(nextIndex);
    scrollToMessage(messageId);
  }, [activeMatchIndex, scrollToMessage, searchMatchIds]);

  const onNextMatch = useCallback(() => {
    if (activeMatchIndex >= searchMatchIds.length - 1) return;

    const nextIndex = activeMatchIndex + 1;
    const messageId = searchMatchIds[nextIndex];
    if (!messageId) return;

    setActiveMatchIndex(nextIndex);
    scrollToMessage(messageId);
  }, [activeMatchIndex, scrollToMessage, searchMatchIds]);

  const renderItem = useCallback(
    ({ item }: { item: ChatListItem }) => {
      if (item.type === "date") {
        return <ChatDateSeparator label={item.label} />;
      }

      const isActiveSearchMatch = isSearchOpen && item.id === activeMatchId;

      return (
        <ChatMessageItem
          item={item.data}
          searchQuery={isSearchOpen ? searchQuery : ""}
          isSearchActive={isSearchOpen}
          isActiveSearchMatch={isActiveSearchMatch}
        />
      );
    },
    [activeMatchId, isSearchOpen, searchQuery],
  );

  const keyExtractor = useCallback(
    (item: ChatListItem, index: number) => item.id + index,
    [],
  );

  const scrollToLatest = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollToBottom(false);
  }, []);

  const onListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setShowScrollToBottom(offsetY > SCROLL_TO_BOTTOM_THRESHOLD);
    },
    [],
  );

  const onScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 100);
  }, []);

  const handleEndReached = useCallback(() => {
    if (!hasMore) {
      return;
    }

    void loadMoreMessages();
  }, [hasMore, loadMoreMessages]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInitialMessages();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ChatHeader
        conversation={{
          id: id,
          contactName,
          phone: phoneNumber,
        }}
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        matchCount={searchMatchIds.length}
        activeMatchIndex={activeMatchIndex}
        onSearchOpen={onSearchOpen}
        onSearchClose={onSearchClose}
        onSearchChange={setSearchQuery}
        onPrevMatch={onPrevMatch}
        onNextMatch={onNextMatch}
      />

      <KeyboardGestureArea
        interpolator="ios"
        style={styles.keyboardArea}
        textInputNativeID={CHAT_COMPOSER_NATIVE_ID}
      >
        <View style={styles.listContainer}>
          {loading ? (
            <ChatSkeletonList />
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={chatItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                inverted
                renderScrollComponent={renderScrollComponent}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                scrollEventThrottle={16}
                onScroll={onListScroll}
                onScrollToIndexFailed={onScrollToIndexFailed}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.2}
                ListFooterComponent={
                  loadingMore ? (
                    <View style={styles.footerLoader}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                  ) : null
                }
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
              {!isSearchOpen ? (
                <ChatScrollToBottomButton
                  visible={showScrollToBottom}
                  onPress={scrollToLatest}
                />
              ) : null}
            </>
          )}
        </View>

        {!isSearchOpen ? (
          <KeyboardStickyView>
            <ChatComposer
              value={draft}
              onChangeText={setDraft}
              onAttachPress={onAttachPress}
              onSendPress={onSend}
              enabled={canManageMessages}
              nativeID={CHAT_COMPOSER_NATIVE_ID}
              onComposerLayout={onComposerLayout}
            />
          </KeyboardStickyView>
        ) : null}
      </KeyboardGestureArea>

      {canManageMessages ? (
        <ChatAttachmentSheet
          visible={attachmentSheetVisible}
          loadingKind={pickingKind}
          onClose={onCloseAttachmentSheet}
          onAttach={onAttach}
          onPickStart={setPickingKind}
          onPickEnd={onPickEnd}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardArea: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
});

export default Chat;
