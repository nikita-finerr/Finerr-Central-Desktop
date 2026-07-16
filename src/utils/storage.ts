import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../types/auth";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "@access_token",
  BIOMETRIC_ENABLED: "@biometric_enabled",
  KEEP_ME_SIGNED_IN: "@keep_me_signed_in",
  USER_DATA: "@user_data",
} as const;

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};

export const authStorage = {
  getAccessToken: () => storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) =>
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
  removeAccessToken: () => storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),

  getBiometricEnabled: () =>
    storage.getItem<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED),
  setBiometricEnabled: (enabled: boolean) =>
    storage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled),
  removeBiometricEnabled: () =>
    storage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED),

  getKeepMeSignedIn: async () => {
    const value = await storage.getItem<boolean>(STORAGE_KEYS.KEEP_ME_SIGNED_IN);
    return value ?? true;
  },
  setKeepMeSignedIn: (enabled: boolean) =>
    storage.setItem(STORAGE_KEYS.KEEP_ME_SIGNED_IN, enabled),

  getUserData: () => storage.getItem<UserData>(STORAGE_KEYS.USER_DATA),
  setUserData: (userData: UserData) =>
    storage.setItem(STORAGE_KEYS.USER_DATA, userData),
  removeUserData: () => storage.removeItem(STORAGE_KEYS.USER_DATA),

  clearSession: async () => {
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      storage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
  },

  clearAuth: async () => {
    await Promise.all([
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      storage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
      storage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
  },
};

export { STORAGE_KEYS };
