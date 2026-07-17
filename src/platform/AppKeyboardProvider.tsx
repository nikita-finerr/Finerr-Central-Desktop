import type { ReactNode } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

export const AppKeyboardProvider = ({ children }: { children: ReactNode }) => (
  <KeyboardProvider>{children}</KeyboardProvider>
);
