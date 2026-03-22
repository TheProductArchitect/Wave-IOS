# Wave

Wave is an iOS-first Expo app for programming NFC cards with profile or portfolio URLs. It is designed for fast in-person networking: type your link, tap an NTAG215 card to your phone, and write the URL in seconds.

## GitHub Description

A modern iOS Expo app for securely programming NTAG215 NFC cards with profile URLs.

## What It Does

- Programs NFC tags with URL payloads using `react-native-nfc-manager`.
- Uses a security validation engine before write operations.
- Flags risky patterns (for example `javascript:`/`data:` protocols and script injection patterns).
- Allows `http://` links as a warning path so users can still proceed intentionally.
- Detects trusted domains (LinkedIn, Linktree, GitHub) and marks them as verified.
- Guides card positioning with animated visual feedback during write flow.
- Uses haptics for key hardware state transitions (found, success, error).
- Shows actionable error recovery tips for timeout, incompatibility, and cancellation states.

## Tech Stack

- Expo SDK 55
- React Native 0.83
- TypeScript
- React Native Reanimated 4
- react-native-nfc-manager
- expo-haptics
- NativeWind + Tailwind

## Requirements

- macOS with Xcode (for iOS build and native modules)
- Node.js 18+
- npm
- An NFC-capable iPhone
- NFC tags (recommended: NTAG215)

## Getting Started

```bash
npm install
npm run ios
```

If Metro cache or native module resolution behaves unexpectedly, clean build artifacts and reinstall pods:

```bash
rm -rf node_modules ios/Pods ios/build
npm install
cd ios && pod install && cd ..
npm run ios
```

## How To Use

1. Open the app and tap **GET STARTED**.
2. Enter your target URL.
3. Confirm validation feedback:
   - Trusted domains show as safety verified.
   - `http://` URLs show a warning but can still proceed.
4. Tap **PROGRAM TAG**.
5. Hold the NFC card at the top-back edge of your iPhone until sync completes.

## Validation Rules (Summary)

- Blocks malicious schemes such as `javascript:`, `data:`, and `file:`.
- Blocks script-injection style input patterns.
- Rejects unsupported protocols.
- Accepts `https://` URLs.
- Accepts `http://` URLs with warning-level caution.

## Status Flow

During programming, hardware flow progresses through:

- `idle`
- `searching`
- `found`
- `syncing`
- `success` or `error`

## iOS Share Support

Project configuration includes iOS share extension activation rules for web URLs in `app.json`.

## Repository

- Name: `wave`
- Visibility: private

## License

No license file has been added yet.
