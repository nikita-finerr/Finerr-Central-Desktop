import { clearAuth } from "../redux/auth/authSlice";
import { store } from "../redux/store";
import { unregisterPushNotifications } from "../services/pushNotifications";
import { authStorage } from "./storage";

export const performAppLogout = async (): Promise<void> => {
  await unregisterPushNotifications();
  await authStorage.clearAuth();
  store.dispatch(clearAuth());
};
