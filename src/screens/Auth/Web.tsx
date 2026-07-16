import { memo } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { Header } from "../../components/common/Header";
import { AuthRoutes, Colors } from "../../constants";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type WebRouteProp = RouteProp<AuthStackParamList, typeof AuthRoutes.Web>;
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const Web = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<WebRouteProp>();
  const { url, title } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.card} barStyle="dark-content" />
      <Header title={title} showBack onBackPress={() => navigation.goBack()} />
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },
});

export default Web;
