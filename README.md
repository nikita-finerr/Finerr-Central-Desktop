# Finerr Central (React Native CLI)

React Native CLI port of the Finerr Central app (messages, calls, fax, voicemail).

## Requirements

- Node `>= 22.11`
- Xcode / CocoaPods (iOS)
- Android Studio / JDK 17 (Android)
- Firebase `google-services.json` / `GoogleService-Info.plist` (already copied into native projects)

## Setup

```bash
cd FinerrCentral
cp .env.example .env
# Fill DEV_HOST / BASE_URL / AppsFlyer keys as needed

npm install
npx react-native-asset

# iOS
cd ios && bundle install && bundle exec pod install && cd ..
```

## Run

```bash
npm start
npm run android
# or
npm run ios
```

## Env vars (`.env`)

| Key | Purpose |
| --- | --- |
| `DEV_HOST` / `DEV_PORT` | Dev API host (used when `__DEV__`) |
| `BASE_URL` | Production API base URL |
| `PRIVACY_URL` / `TERMS_URL` | Legal WebViews |
| `APP_SCHEME` | Deep link scheme (`finerrcentral`) |
| `ONELINK_HOST` / `ONELINK_PATH_PREFIX` | AppsFlyer OneLink |
| `APPSFLYER_DEV_KEY` / `APPSFLYER_APP_ID` | AppsFlyer |
| `TELNYX_PUSH_ENV` | `debug` \| `production` |

Values are read through `react-native-config` in `src/constants/env.ts`.

## What changed from Expo

| Expo | React Native CLI |
| --- | --- |
| `expo` entry / EAS | `AppRegistry` + `react-native run-*` |
| `expo-*` modules | Community packages (`image-picker`, `fs`, `notifee`, etc.) |
| `@expo/vector-icons` | `react-native-vector-icons` |
| `@expo-google-fonts/inter` | Linked TTF assets in `assets/fonts` |
| `EXPO_PUBLIC_*` | `.env` via `react-native-config` |
| Config plugins | Manual Android/iOS config |

Native call bridge (`FinerrCallBridge`) and JsSIP + WebRTC calling path are preserved.
