import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRoutes } from "../constants";
import ActiveCall from "../screens/App/ActiveCall";
import CallDetails from "../screens/App/Calls/CallDetails";
import AddContact from "../screens/App/Contacts/AddContact";
import EditContact from "../screens/App/Contacts/EditContact";
import SendFax from "../screens/App/Fax/SendFax";
import CallHistory from "../screens/App/Messages/ContactDetails/CallHistory";
import Chat from "../screens/App/Messages/Chat";
import FaxHistory from "../screens/App/Messages/ContactDetails/FaxHistory";
import NewMessage from "../screens/App/Messages/NewMessage";
import VoicemailTranscript from "../screens/App/Voicemail/Transcript";
import Notifications from "../screens/App/Notifications";
import Profile from "../screens/App/Profile";
import ChangePassword from "../screens/App/Profile/ChangePassword";
import AppTabs from "./AppTabs";
import ContactDetails from "../screens/App/Messages/ContactDetails";
import ContactProfile from "../screens/App/Contacts/ContactProfile";
import VoicemailHistory from "../screens/App/Messages/ContactDetails/VoicemailHistory";

const Stack = createNativeStackNavigator<any>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name={AppRoutes.Tabs} component={AppTabs} />
      <Stack.Screen name={AppRoutes.Profile} component={Profile} />
      <Stack.Screen name={AppRoutes.Chat} component={Chat} />
      <Stack.Screen name={AppRoutes.NewMessage} component={NewMessage} />
      <Stack.Screen name={AppRoutes.SendFax} component={SendFax} />
      <Stack.Screen
        name={AppRoutes.ContactDetails}
        component={ContactDetails}
      />
      <Stack.Screen name={AppRoutes.CallHistory} component={CallHistory} />
      <Stack.Screen
        name={AppRoutes.VoicemailHistory}
        component={VoicemailHistory}
      />
      <Stack.Screen
        name={AppRoutes.VoicemailTranscript}
        component={VoicemailTranscript}
      />
      <Stack.Screen name={AppRoutes.FaxHistory} component={FaxHistory} />
      <Stack.Screen name={AppRoutes.CallDetails} component={CallDetails} />
      <Stack.Screen
        name={AppRoutes.ActiveCall}
        component={ActiveCall}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name={AppRoutes.ContactProfile}
        component={ContactProfile}
      />
      <Stack.Screen name={AppRoutes.AddContact} component={AddContact} />
      <Stack.Screen name={AppRoutes.EditContact} component={EditContact} />
      <Stack.Screen
        name={AppRoutes.ChangePassword}
        component={ChangePassword}
      />
      <Stack.Screen name={AppRoutes.Notifications} component={Notifications} />
    </Stack.Navigator>
  );
};

export default AppStack;
