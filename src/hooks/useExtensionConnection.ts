import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useSelector } from "react-redux";

import {
  extensionSipClient,
  type ExtensionRegistrationState,
} from "../services/extensionSipClient";
import type { RootState } from "../redux/store";
import {
  extensionCredentialsKey,
  getExtensionCredentials,
} from "../utils/extensionCredentials";

const useExtensionConnection = (isAuthenticated: boolean) => {
  const pharmacy = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy,
  );
  const credentials = useMemo(
    () => getExtensionCredentials(pharmacy),
    [pharmacy],
  );
  const credentialsKey = credentials
    ? extensionCredentialsKey(credentials)
    : null;
  const credentialsRef = useRef(credentials);
  credentialsRef.current = credentials;

  const [registrationState, setRegistrationState] =
    useState<ExtensionRegistrationState>(extensionSipClient.state);

  useEffect(() => {
    return extensionSipClient.onStateChange(setRegistrationState);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      extensionSipClient.disconnect();
      return;
    }

    const activeCredentials = credentialsRef.current;
    if (!activeCredentials) {
      return;
    }

    extensionSipClient.connect(activeCredentials);
  }, [credentialsKey, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !credentialsKey) {
      return;
    }

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        return;
      }

      const state = extensionSipClient.state;
      if (
        state === "registered" ||
        state === "failed" ||
        state === "connecting"
      ) {
        return;
      }

      const activeCredentials = credentialsRef.current;
      if (!activeCredentials) {
        return;
      }

      extensionSipClient.connect(activeCredentials);
    });

    return () => subscription.remove();
  }, [credentialsKey, isAuthenticated]);

  return {
    registrationState,
    isExtensionRegistered: registrationState === "registered",
    hasExtensionCredentials: Boolean(credentials),
    extension: credentials?.extension,
    extensionHost: credentials?.host,
  };
};

export default useExtensionConnection;
