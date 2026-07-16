import { NavigationProp, useNavigation } from "@react-navigation/native";
import { User } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { faxApi } from "../../../../api/faxApi";
import EmptyList from "../../../../components/common/EmptyList";
import CreateHeader from "../../../../components/common/Header/CreateHeader";
import SearchBar from "../../../../components/common/Input/SearchBar";
import { Colors, Dimensions, Radius, Spacing } from "../../../../constants";
import { globalStyleDefinitions } from "../../../../constants/globalStyleDefinitions";
import { usePermissions } from "../../../../hooks/usePermissions";
import type { RootState } from "../../../../redux/store";
import type { TelnyxFaxNumberDto } from "../../../../types/fax";
import { getApiErrorMessage } from "../../../../utils/apiError";
import { normalizePhoneForSendApi } from "../../../../utils/phoneUtils";
import { showErrorToast, showSuccessToast } from "../../../../utils/toast";
import FaxContactSuggestion from "./components/FaxContactSuggestion";
import FaxCoverNoteField from "./components/FaxCoverNoteField";
import FaxDeliveryConfirmation from "./components/FaxDeliveryConfirmation";
import FaxDocumentUpload from "./components/FaxDocumentUpload";
import FaxRecipientCarousel from "./components/FaxRecipientCarousel";
import FaxSecurityBanner from "./components/FaxSecurityBanner";
import {
  getTelnyxFaxContactLabel,
  getTelnyxFaxContactNumber,
  hasTelnyxFaxContactNumber,
  matchesTelnyxFaxContactSearch,
} from "./data/telnyxFaxContacts";
import { pickFaxDocument, type FaxDocument } from "./utils/pickFaxDocument";

const SEARCH_DEBOUNCE_MS = 500;

const SendFaxScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const { canManageFax } = usePermissions();
  const { userData } = useSelector((state: RootState) => state.auth);

  const pharmacyId = userData?.merchantId;
  const fromNumber = userData?.pharmacy?.faxNumber ?? "";

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [faxContacts, setFaxContacts] = useState<TelnyxFaxNumberDto[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<
    TelnyxFaxNumberDto[]
  >([]);
  const [coverNote, setCoverNote] = useState<string>("");
  const [confirmDelivery, setConfirmDelivery] = useState<boolean>(false);
  const [document, setDocument] = useState<FaxDocument | null>(null);
  const [pickingDocument, setPickingDocument] = useState<boolean>(false);
  const [contactsLoading, setContactsLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const contactsRequestRef = useRef(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!pharmacyId) {
      setFaxContacts([]);
      setContactsLoading(false);
      return;
    }

    const requestId = ++contactsRequestRef.current;
    setContactsLoading(true);

    void (async () => {
      try {
        const response = await faxApi.listTelnyxFaxTable({
          pharmacyId,
          includeInactive: false,
        });

        if (requestId !== contactsRequestRef.current) {
          return;
        }

        if (response?.success && response.data) {
          setFaxContacts(
            (response.data.items ?? []).filter(hasTelnyxFaxContactNumber),
          );
        } else {
          setFaxContacts([]);
          showErrorToast(
            getApiErrorMessage(response, "Failed to load fax contacts."),
          );
        }
      } catch (error) {
        if (requestId !== contactsRequestRef.current) {
          return;
        }

        setFaxContacts([]);
        showErrorToast(
          getApiErrorMessage(error, "Failed to load fax contacts."),
        );
      } finally {
        if (requestId === contactsRequestRef.current) {
          setContactsLoading(false);
        }
      }
    })();
  }, [pharmacyId]);

  const suggestions = useMemo(() => {
    const selectedIds = new Set(selectedContacts.map((contact) => contact.id));
    const query = debouncedSearch.trim();

    return faxContacts
      .filter((contact) => !selectedIds.has(contact.id))
      .filter((contact) =>
        query ? matchesTelnyxFaxContactSearch(contact, query) : false,
      );
  }, [debouncedSearch, faxContacts, selectedContacts]);

  const isListOpen = search.trim().length > 0;

  const canSend =
    canManageFax &&
    !sending &&
    selectedContacts.length > 0 &&
    Boolean(document) &&
    Boolean(pharmacyId) &&
    Boolean(fromNumber.trim());

  const addRecipient = useCallback((contact: TelnyxFaxNumberDto) => {
    setSelectedContacts((current) => {
      if (current.some((item) => item.id === contact.id)) {
        return current;
      }

      return [contact, ...current];
    });
    setSearch("");
  }, []);

  const removeRecipient = useCallback((id: number) => {
    setSelectedContacts((current) => current.filter((item) => item.id !== id));
  }, []);

  const onPickDocument = useCallback(async () => {
    setPickingDocument(true);
    try {
      const picked = await pickFaxDocument();
      if (picked) {
        setDocument(picked);
      }
    } finally {
      setPickingDocument(false);
    }
  }, []);

  const sendToContact = useCallback(
    async (contact: TelnyxFaxNumberDto) => {
      if (!pharmacyId || !fromNumber.trim() || !document) {
        showErrorToast("Unable to send fax.");
        return false;
      }

      const phoneNumber = getTelnyxFaxContactNumber(contact);
      const label = getTelnyxFaxContactLabel(contact);

      if (!phoneNumber.trim()) {
        showErrorToast(`${label} has no fax number.`);
        return false;
      }

      try {
        const formData = new FormData();

        formData.append("PharmacyId", String(userData?.pharmacy?.pharmacyId));
        formData.append("ToNumber", normalizePhoneForSendApi(phoneNumber));
        formData.append("FromNumber", fromNumber);

        if (coverNote?.trim()) {
          formData.append("CoverNote", coverNote.trim());
        }

        formData.append(
          "RequestDeliveryConfirmation",
          confirmDelivery ? "true" : "false",
        );

        formData.append("Document", {
          uri: document.uri,
          name: document.name,
          type: document.mimeType ?? "application/octet-stream",
        } as unknown as Blob);

        const response = await faxApi.send(formData);

        if (!response?.success) {
          showErrorToast(
            getApiErrorMessage(response, `Failed to send fax to ${label}.`),
          );
          return false;
        }

        return true;
      } catch (error) {
        showErrorToast(
          getApiErrorMessage(error, `Failed to send fax to ${label}.`),
        );
        return false;
      }
    },
    [confirmDelivery, coverNote, document, fromNumber, pharmacyId],
  );

  const onSend = useCallback(async () => {
    if (!canSend || !document) {
      return;
    }

    setSending(true);

    try {
      for (const contact of selectedContacts) {
        const sent = await sendToContact(contact);
        if (!sent) {
          return;
        }
      }

      showSuccessToast(
        selectedContacts.length === 1
          ? "Fax sent successfully."
          : `${selectedContacts.length} faxes sent successfully.`,
      );
      navigation.goBack();
    } finally {
      setSending(false);
    }
  }, [canSend, document, navigation, selectedContacts, sendToContact]);

  const renderSuggestion = useCallback(
    ({ item }: { item: TelnyxFaxNumberDto }) => (
      <FaxContactSuggestion item={item} onSelect={addRecipient} />
    ),
    [addRecipient],
  );

  const suggestionKeyExtractor = useCallback(
    (item: TelnyxFaxNumberDto) => String(item.id),
    [],
  );

  const SuggestionSeparator = useCallback(
    () => <View style={styles.suggestionSeparator} />,
    [],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <CreateHeader
        title="Send Fax"
        saveLabel="Send"
        onSave={onSend}
        canSave={canSend}
        loading={sending}
      />

      <View style={styles.recipientSection}>
        <FaxRecipientCarousel
          contacts={selectedContacts}
          onRemove={removeRecipient}
          scrollEnabled={!isListOpen}
        />
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search fax contacts..."
          icon={<User size={18} color={Colors.textLight} strokeWidth={2} />}
        />
      </View>

      <View style={styles.body}>
        {isListOpen ? (
          <View style={styles.listOverlay}>
            {contactsLoading ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="small" color={Colors.secondary} />
              </View>
            ) : (
              <FlatList
                data={suggestions}
                keyExtractor={suggestionKeyExtractor}
                renderItem={renderSuggestion}
                ItemSeparatorComponent={SuggestionSeparator}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                ListEmptyComponent={<EmptyList title="No fax contacts found" />}
              />
            )}
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
          <FaxDocumentUpload
            document={document}
            loading={pickingDocument}
            onPress={onPickDocument}
          />

          <FaxCoverNoteField value={coverNote} onChange={setCoverNote} />

          <FaxDeliveryConfirmation
            value={confirmDelivery}
            onValueChange={setConfirmDelivery}
          />

          <FaxSecurityBanner />
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  recipientSection: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.lg,
    backgroundColor: Colors.background,
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
  searchLoading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
  },
  suggestionSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: globalStyleDefinitions.screenPadding.padding + 40 + Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: globalStyleDefinitions.screenPadding.padding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xl,
  },
});

export default SendFaxScreen;
