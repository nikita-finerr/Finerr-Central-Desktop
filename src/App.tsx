import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import * as Bootsplash from "react-native-bootsplash";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider, useSelector } from "react-redux";

import { AppSplashScreen, BiometricUnlock } from "./components/auth";
import CallBanner from "./components/call/CallBanner";
import { useOutboundCall } from "./hooks/useOutboundCall";
import useExtensionConnection from "./hooks/useExtensionConnection";
import usePushNotifications from "./hooks/usePushNotifications";
import { useAppsFlyerDeepLinking } from "./hooks/useAppsFlyerDeepLinking";
import AppNavigator from "./navigation/AppNavigator";
import { OutboundCallProvider } from "./providers/OutboundCallProvider";
import { setUserData } from "./redux/auth/authSlice";
import type { RootState } from "./redux/store";
import { store } from "./redux/store";
import { checkBiometricAvailability } from "./utils/biometric";
import { authStorage } from "./utils/storage";
import { toastConfig } from "./utils/toastConfig";

const AppRoot = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.userData != null,
  );
  const [navigationReady, setNavigationReady] = useState(false);
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [biometricRequired, setBiometricRequired] = useState(false);
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);

  const isAppReady =
    navigationReady && (!biometricRequired || biometricUnlocked);

  usePushNotifications(isAuthenticated);
  useExtensionConnection(isAuthenticated);
  useAppsFlyerDeepLinking(navigationReady);
  const { isIncomingRinging, activeCall } = useOutboundCall();

  useEffect(() => {
    if (!isIncomingRinging && activeCall?.direction !== "inbound") {
      return;
    }

    setSplashDismissed(true);
    setBiometricUnlocked(true);
  }, [activeCall?.direction, isIncomingRinging]);

  useEffect(() => {
    void (async () => {
      const token = await authStorage.getAccessToken();
      const biometricEnabled = await authStorage.getBiometricEnabled();
      const biometricAvailable = await checkBiometricAvailability();
      const userData = await authStorage.getUserData();

      if (userData) {
        store.dispatch(setUserData(userData));
      }

      if (token && biometricEnabled && biometricAvailable) {
        setBiometricRequired(true);
      } else if (biometricEnabled && !biometricAvailable) {
        await authStorage.setBiometricEnabled(false);
      }
    })();
  }, []);

  useEffect(() => {
    Bootsplash.hide().catch(() => {});
  }, []);

  const showBiometricOverlay =
    !splashDismissed && biometricRequired && !biometricUnlocked;

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <AppNavigator onReady={() => setNavigationReady(true)} />
        <CallBanner />
        {!splashDismissed ? (
          <View style={styles.splashOverlay}>
            <AppSplashScreen
              isAppReady={isAppReady}
              onComplete={() => setSplashDismissed(true)}
            />
            {showBiometricOverlay ? (
              <View style={styles.biometricOverlay}>
                <BiometricUnlock
                  onUnlocked={() => setBiometricUnlocked(true)}
                  onLogout={() => {
                    setBiometricRequired(false);
                    setBiometricUnlocked(false);
                  }}
                />
              </View>
            ) : null}
          </View>
        ) : null}
        <StatusBar style="auto" />
        <Toast config={toastConfig} />
      </View>
    </SafeAreaProvider>
  );
};

const App = () => {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <KeyboardProvider>
        <OutboundCallProvider>
          <AppRoot />
        </OutboundCallProvider>
      </KeyboardProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  biometricOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 11,
  },
});

export default App;
