import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";

import { MainRoutes } from "../constants";
import type { RootState } from "../redux/store";
import { peekPendingAuthDeepLink } from "../services/appsflyer/pendingAuthDeepLink";
import AppStack from "./AppStack";
import AuthStack from "./AuthStack";
import { navigationRef } from "./navigationRef";

const Stack = createNativeStackNavigator<any>();

type Props = {
  onReady?: () => void;
};

const AppNavigator = ({ onReady }: Props) => {
  const userData = useSelector((state: RootState) => state.auth.userData);
  const isAuthenticated = userData != null;
  const pendingReset = peekPendingAuthDeepLink();
  const authStackKey =
    pendingReset?.route === "ResetPassword"
      ? `reset-${pendingReset.params.token}`
      : "auth";

  return (
    <NavigationContainer ref={navigationRef} onReady={onReady}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: "none" }}
      >
        {isAuthenticated ? (
          <Stack.Screen name={MainRoutes.App} component={AppStack} />
        ) : (
          <Stack.Screen
            key={authStackKey}
            name={MainRoutes.Auth}
            component={AuthStack}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
