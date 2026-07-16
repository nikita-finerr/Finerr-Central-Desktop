import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserPlus } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { contactApi } from "../../../../api/contactApi";
import { messageApi } from "../../../../api/messageApi";
import EmptyList from "../../../../components/common/EmptyList";
import CreateHeader from "../../../../components/common/Header/CreateHeader";
import SearchBar from "../../../../components/common/Input/SearchBar";
import {
  AppRoutes,
  Colors,
  Dimensions,
  Fonts,
  FontSizes,
  Radius,
  Spacing,
} from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../hooks/usePermissions";
import type { RootState } from "../../../../redux/store";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { normalizePhoneForSendApi } from "../../../../utils/phoneUtils";
import { showErrorToast } from "../../../../utils/toast";
import AttachmentOptions from "./components/AttachmentOptions";
import MessageAttachmentsList from "./components/MessageAttachmentsList";
import MessageComposer from "./components/MessageComposer";
import MessageContactCard from "./components/MessageContactCard";
import SecurityBanner from "./components/SecurityBanner";
import SelectedRecipients from "./components/SelectedRecipients";
import type { MessageAttachment, NewMessageContact } from "./types";
import { mapChatContactToNewMessageContact } from "./utils/mapChatContact";

const MESSAGE_CHAR_LIMIT = 1000;
const SEARCH_DEBOUNCE_MS = 500;
const CONTACTS_PAGE_SIZE = 50;

const NewMessage = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const { canManageMessages } = usePermissions();
  const { userData } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [contacts, setContacts] = useState<NewMessageContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<NewMessageContact[]>(
    [],
  );
  const [message, setMessage] = useState<string>("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [pickingKind, setPickingKind] = useState<"images" | "camera" | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const userId = userData?.pharmacy?.userId;
    if (!debouncedSearch || !userId) {
      setContacts([]);
      setSearchLoading(false);
      return;
    }

    const requestId = ++searchRequestRef.current;
    setSearchLoading(true);

    void (async () => {
      try {
        const response = await contactApi.contacts({
          userId,
          search: debouncedSearch,
          pageIndex: 0,
          pageSize: CONTACTS_PAGE_SIZE,
        });

        if (requestId !== searchRequestRef.current) {
          return;
        }

        const items = (response?.items ?? [])
          .map(mapChatContactToNewMessageContact)
          .filter((contact) => contact.phoneNumber.length > 0);

        setContacts(items);
      } catch (error) {
        if (requestId !== searchRequestRef.current) {
          return;
        }

        setContacts([]);
        showErrorToast(getApiErrorMessage(error, "Failed to load contacts."));
      } finally {
        if (requestId === searchRequestRef.current) {
          setSearchLoading(false);
        }
      }
    })();
  }, [debouncedSearch, userData?.pharmacy?.userId]);

  const suggestions = useMemo(() => {
    const selectedIds = new Set(selectedContacts.map((contact) => contact.id));
    return contacts.filter((contact) => !selectedIds.has(contact.id));
  }, [contacts, selectedContacts]);

  const isListOpen = search.trim().length > 0;

  const canCreate =
    canManageMessages &&
    !sending &&
    selectedContacts.length > 0 &&
    (message.trim().length > 0 || attachments.length > 0) &&
    message.length <= MESSAGE_CHAR_LIMIT;

  const sendToContact = useCallback(
    async (
      contact: NewMessageContact,
      text: string,
      messageAttachments: MessageAttachment[],
    ) => {
      const userId = userData?.pharmacy?.userId;
      if (!userId || !contact.phoneNumber.trim()) {
        showErrorToast("Unable to send message.");
        return false;
      }

      const trimmedText = text.trim();
      const mobileNumber = normalizePhoneForSendApi(contact.phoneNumber);

      try {
        if (messageAttachments.length > 0) {
          const formData = new FormData();
          formData.append("mobileNumber", mobileNumber);

          if (trimmedText) {
            formData.append("text", trimmedText);
          }

          for (const file of messageAttachments) {
            formData.append("mmsFiles", {
              uri: file.uri,
              name: file.name,
              type: file.mimeType ?? "application/octet-stream",
            } as unknown as Blob);
          }

          const response = await messageApi.sendChatMessageMultipart({
            userId,
            formData,
          });

          if (!response?.success) {
            showErrorToast(
              getApiErrorMessage(
                response,
                `Failed to send message to ${contact.contactName}.`,
              ),
            );
            return false;
          }

          return true;
        }

        const response = await messageApi.sendChatMessage(userId, {
          mobileNumber,
          text: trimmedText,
        });

        if (!response?.success) {
          showErrorToast(
            getApiErrorMessage(
              response,
              `Failed to send message to ${contact.contactName}.`,
            ),
          );
          return false;
        }

        return true;
      } catch (error) {
        showErrorToast(
          getApiErrorMessage(
            error,
            `Failed to send message to ${contact.contactName}.`,
          ),
        );
        return false;
      }
    },
    [userData?.pharmacy?.userId],
  );

  const onCreate = useCallback(async () => {
    if (!canManageMessages || selectedContacts.length === 0 || sending) {
      return;
    }

    const trimmedText = message.trim();
    if (!trimmedText && attachments.length === 0) {
      return;
    }

    setSending(true);

    try {
      for (const contact of selectedContacts) {
        const sent = await sendToContact(contact, trimmedText, attachments);
        if (!sent) {
          return;
        }
      }

      navigation.goBack();
    } finally {
      setSending(false);
    }
  }, [
    attachments,
    canManageMessages,
    message,
    navigation,
    selectedContacts,
    sendToContact,
    sending,
  ]);

  const addRecipient = useCallback((contact: NewMessageContact) => {
    setSelectedContacts((current) =>
      current.some((item) => item.id === contact.id)
        ? current
        : [contact, ...current],
    );
    setSearch("");
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setSelectedContacts((current) => current.filter((item) => item.id !== id));
  }, []);

  const onMessageChange = useCallback((text: string) => {
    if (text.length <= MESSAGE_CHAR_LIMIT) {
      setMessage(text);
    }
  }, []);

  const onAttach = useCallback((items: MessageAttachment[]) => {
    setAttachments((current) => [...current, ...items]);
  }, []);

  const onRemoveAttachment = useCallback((id: string) => {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }, []);

  const renderSuggestion = useCallback(
    ({ item }: { item: NewMessageContact }) => (
      <MessageContactCard item={item} addRecipient={addRecipient} />
    ),
    [addRecipient],
  );

  const suggestionKeyExtractor = useCallback(
    (item: NewMessageContact) => item.id,
    [],
  );

  const SuggestionSeparator = useCallback(
    () => <View style={styles.suggestionSeparator} />,
    [],
  );

  const ListEmptyComponent = useCallback(() => {
    if (searchLoading || debouncedSearch?.trim().length === 0) {
      return (
        <View style={styles.searchLoader}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      );
    }

    return <EmptyList title="No contacts found" />;
  }, [searchLoading, debouncedSearch]);

  const onAddContact = () => {
    navigation.navigate(AppRoutes.AddContact);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <CreateHeader
        title="New Message"
        saveLabel="Create"
        onSave={onCreate}
        canSave={canCreate}
        loading={sending}
      />

      <View style={styles.toSection}>
        <Text style={styles.sectionLabel}>To</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search contacts, phone numbers, or groups"
            />
          </View>
          <Pressable
            style={styles.addContactButton}
            onPress={onAddContact}
            accessibilityRole="button"
            accessibilityLabel="Add contact"
          >
            <UserPlus size={20} color={Colors.secondary} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {isListOpen ? (
          <View style={styles.listOverlay}>
            <FlatList
              data={suggestions}
              keyExtractor={suggestionKeyExtractor}
              renderItem={renderSuggestion}
              ItemSeparatorComponent={SuggestionSeparator}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              ListEmptyComponent={ListEmptyComponent}
            />
          </View>
        ) : null}

        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          bottomOffset={insets.bottom}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isListOpen}
          pointerEvents={isListOpen ? "none" : "auto"}
        >
          <SelectedRecipients
            contacts={selectedContacts}
            onRemove={removeRecipient}
            scrollEnabled={!isListOpen}
          />

          <MessageComposer
            message={message}
            onChange={onMessageChange}
            disabled={isListOpen}
          />

          <MessageAttachmentsList
            attachments={attachments}
            onRemove={onRemoveAttachment}
          />

          <AttachmentOptions
            disabled={isListOpen}
            loadingKind={pickingKind}
            onAttach={onAttach}
            onPickStart={setPickingKind}
            onPickEnd={() => setPickingKind(null)}
          />

          <SecurityBanner />
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  toSection: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    zIndex: 2,
  },
  body: {
    flex: 1,
    position: "relative",
  },
  listOverlay: {
    position: "absolute",
    top: 0,
    left: globalStyleDefinitions.screenPadding.padding,
    right: globalStyleDefinitions.screenPadding.padding,
    zIndex: 10,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    maxHeight: Dimensions.height * 0.5,
  },
  suggestionSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: globalStyleDefinitions.screenPadding.padding + 40 + Spacing.md,
  },
  searchLoader: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchField: {
    flex: 1,
  },
  addContactButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default NewMessage;
