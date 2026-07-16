import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect, useMemo, type ComponentType } from "react";
import { useDispatch, useSelector } from "react-redux";

import { notificationApi } from "../api/notificationApi";
import { faxApi } from "../api/faxApi";
import { messageApi } from "../api/messageApi";
import { profileApi } from "../api/profileApi";
import { AppRoutes, Colors } from "../constants";
import { usePermissions } from "../hooks/usePermissions";
import { setUserData } from "../redux/auth/authSlice";
import { setUnreadCount as setFaxUnreadCount } from "../redux/fax/faxSlice";
import { setUnreadCount as setMessageUnreadCount } from "../redux/message/messageSlice";
import { setUnreadCount as setNotificationUnreadCount } from "../redux/notification/notificationSlice";
import type { AppDispatch, RootState } from "../redux/store";
import CallsScreen from "../screens/App/Calls";
import DialPad from "../screens/App/DialPad";
import FaxScreen from "../screens/App/Fax";
import Messages from "../screens/App/Messages";
import VoiceMailScreen from "../screens/App/Voicemail";
import AppTabBar from "./AppTabBar";

const Tab = createBottomTabNavigator();

const AppTabs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const pharmacyId = useSelector(
    (state: RootState) => state.auth.userData?.pharmacy?.pharmacyId,
  );
  const {
    canViewMessages,
    canViewCalls,
    canManageCalls,
    canViewFax,
    canViewVoicemail,
  } = usePermissions();

  const visibleTabs = useMemo(() => {
    const tabs: { name: string; component: ComponentType }[] = [];

    if (canViewMessages) {
      tabs.push({ name: AppRoutes.Messages, component: Messages });
    }
    if (canViewCalls) {
      tabs.push({ name: AppRoutes.Calls, component: CallsScreen });
    }
    if (canManageCalls) {
      tabs.push({ name: AppRoutes.DialPad, component: DialPad });
    }
    if (canViewFax) {
      tabs.push({ name: AppRoutes.Fax, component: FaxScreen });
    }
    if (canViewVoicemail) {
      tabs.push({ name: AppRoutes.VoiceMail, component: VoiceMailScreen });
    }

    return tabs;
  }, [
    canManageCalls,
    canViewCalls,
    canViewFax,
    canViewMessages,
    canViewVoicemail,
  ]);

  useEffect(() => {
    void getProfile();
    void fetchNotificationUnreadCount();
    if (pharmacyId && canViewMessages) {
      void fetchMessageUnreadCount(pharmacyId);
    }
    if (pharmacyId && canViewFax) {
      void fetchFaxUnreadCount(pharmacyId);
    }
  }, [canViewFax, canViewMessages, pharmacyId]);

  const getProfile = async () => {
    const response = await profileApi.getProfile();
    if (response?.success) {
      dispatch(setUserData(response.data));
    }
  };

  const fetchNotificationUnreadCount = async () => {
    const response = await notificationApi.list({ page: 0, pageSize: 20 });
    if (response?.success) {
      dispatch(setNotificationUnreadCount(response?.unreadCount ?? 0));
    }
  };

  const fetchMessageUnreadCount = async (pharmacyId: number) => {
    const response = await messageApi.listSmsConversations({
      PharmacyId: pharmacyId,
      Page: 0,
      PageSize: 1,
    });
    if (response?.success) {
      dispatch(setMessageUnreadCount(response?.totalUnreadCount ?? 0));
    }
  };

  const fetchFaxUnreadCount = async (pharmacyId: number) => {
    const response = await faxApi.list({
      PharmacyId: pharmacyId,
      Page: 0,
      PageSize: 1,
    });
    if (response?.success) {
      dispatch(setFaxUnreadCount(response.data?.unreadCount ?? 0));
    }
  };

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <Tab.Navigator
      key={visibleTabs.length}
      initialRouteName={visibleTabs[0].name}
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 0,
        },
        animation: "none",
      }}
    >
      {visibleTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ title: tab.name }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default AppTabs;
