import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

import type { RootState } from "../redux/store";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

type Props = {
  onReady?: () => void;
};

/**
 * macOS root navigator — avoids @react-navigation/native-stack which depends
 * on react-native-screens native views that are not linked on macOS.
 */
const AppNavigator = ({ onReady }: Props) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.userData != null,
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <View style={styles.root}>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default AppNavigator;
