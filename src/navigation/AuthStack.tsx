import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthRoutes } from "../constants";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import Login from "../screens/Auth/Login";
import ResetPassword from "../screens/Auth/ResetPassword";
import Web from "../screens/Auth/Web";
import { peekPendingAuthDeepLink } from "../services/appsflyer/pendingAuthDeepLink";

const Stack = createNativeStackNavigator<any>();

export type AuthStackParamList = {
  [AuthRoutes.Login]: undefined;
  [AuthRoutes.ForgotPassword]: undefined;
  [AuthRoutes.ResetPassword]: {
    token?: string;
    email?: string;
  };
  [AuthRoutes.Web]: {
    url: string;
    title: string;
  };
};

const AuthStack = () => {
  const pendingReset = peekPendingAuthDeepLink();
  const resetPasswordParams =
    pendingReset?.route === "ResetPassword" &&
    pendingReset.params.token.trim()
      ? pendingReset.params
      : null;

  return (
    <Stack.Navigator
      initialRouteName={
        resetPasswordParams ? AuthRoutes.ResetPassword : AuthRoutes.Login
      }
      screenOptions={{ headerShown: false, animation: "none" }}
    >
      <Stack.Screen name={AuthRoutes.Login} component={Login} />
      <Stack.Screen
        name={AuthRoutes.ForgotPassword}
        component={ForgotPassword}
      />
      <Stack.Screen
        name={AuthRoutes.ResetPassword}
        component={ResetPassword}
        initialParams={resetPasswordParams ?? undefined}
      />
      <Stack.Screen name={AuthRoutes.Web} component={Web} />
    </Stack.Navigator>
  );
};

export default AuthStack;
