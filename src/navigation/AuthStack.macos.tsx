import {
  NavigationContext,
  NavigationRouteContext,
} from "@react-navigation/native";
import { useMemo, useState, type ComponentType } from "react";
import { StyleSheet, View } from "react-native";

import { AuthRoutes } from "../constants";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import Login from "../screens/Auth/Login";
import ResetPassword from "../screens/Auth/ResetPassword";
import Web from "../screens/Auth/Web";
import { peekPendingAuthDeepLink } from "../services/appsflyer/pendingAuthDeepLink";

type ScreenName = (typeof AuthRoutes)[keyof typeof AuthRoutes];

type NavState = {
  name: ScreenName;
  params?: Record<string, unknown>;
};

/**
 * Lightweight auth navigator for macOS — native-stack + screens stub often
 * mounts an empty tree, which leaves only the splash purple background.
 */
const AuthStack = () => {
  const pendingReset = peekPendingAuthDeepLink();
  const [screen, setScreen] = useState<NavState>(() => {
    if (
      pendingReset?.route === "ResetPassword" &&
      pendingReset.params.token.trim()
    ) {
      return {
        name: AuthRoutes.ResetPassword,
        params: pendingReset.params as unknown as Record<string, unknown>,
      };
    }
    return { name: AuthRoutes.Login };
  });

  const navigation = useMemo(
    () => ({
      navigate: (name: ScreenName, params?: Record<string, unknown>) => {
        setScreen({ name, params });
      },
      goBack: () => setScreen({ name: AuthRoutes.Login }),
      canGoBack: () => screen.name !== AuthRoutes.Login,
      getParent: () => undefined,
      setOptions: () => {},
      addListener: () => () => {},
      removeListener: () => {},
      dispatch: () => {},
      reset: () => setScreen({ name: AuthRoutes.Login }),
      isFocused: () => true,
      getId: () => undefined,
      getState: () => ({
        type: "stack",
        key: "auth",
        index: 0,
        routeNames: [screen.name],
        routes: [{ key: screen.name, name: screen.name, params: screen.params }],
        stale: false,
      }),
    }),
    [screen.name, screen.params],
  );

  const route = useMemo(
    () => ({
      key: screen.name,
      name: screen.name,
      params: screen.params,
    }),
    [screen.name, screen.params],
  );

  let Screen: ComponentType<any> = Login;
  if (screen.name === AuthRoutes.ForgotPassword) {
    Screen = ForgotPassword;
  } else if (screen.name === AuthRoutes.ResetPassword) {
    Screen = ResetPassword;
  } else if (screen.name === AuthRoutes.Web) {
    Screen = Web;
  }

  return (
    <NavigationContext.Provider value={navigation as never}>
      <NavigationRouteContext.Provider value={route as never}>
        <View style={styles.root}>
          <Screen navigation={navigation} route={route} />
        </View>
      </NavigationRouteContext.Provider>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AuthStack;
