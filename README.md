# Wave: NFC Firewall for Real-World Networking

Wave is an iOS-first Expo app that writes professional profile URLs to NFC cards while enforcing a safety-first validation layer. Think of it as an NFC Firewall: every URL is checked before any tag write can happen.

## Core Idea

Most NFC write tools focus on speed. Wave focuses on speed and safety.

- Input your profile URL.
- Wave runs the Safety Guard rules.
- If the payload is safe, Wave writes to the NFC card.
- If the payload is risky, Wave blocks or warns before hardware write.

## Why It Exists

- Fast in-person sharing: tap and go.
- Security by default: malware and spoofing patterns are filtered before write.
- Predictable hardware UX: guided positioning and status transitions reduce write failure.

## Positioning Animation (How It Helps)

During programming, Wave animates a card moving toward the iPhone antenna area and shows pulse signals when the card is in the sweet spot.

- Reduces guesswork about where to hold the tag.
- Improves first-attempt write success on real devices.
- Uses haptics to confirm found, success, and error transitions.

## Safety Guard Logic Table

| Input Pattern | Action | Safety Level | Notes |
| --- | --- | --- | --- |
| `javascript:`, `data:`, `file:` | Block | Warning | Marked as malware risk |
| Script injection fragments (`<script`, `javascript:` in body) | Block | Warning | Prevents hostile payload patterns |
| Unsupported protocol (not `http`/`https`) | Block | Warning | Unsupported protocol |
| `http://` URL | Allow with warning | Warning | User can explicitly proceed |
| `https://` trusted domains (LinkedIn, Linktree, GitHub) | Allow | Trusted | Marked as Safety Verified |
| `https://` standard domains | Allow | Safe | Valid standard URL |

## Status Flow

- `idle`
- `searching`
- `found`
- `syncing`
- `success` or `error`

## Tech Stack

- Expo SDK 55
- React Native 0.83
- TypeScript
- NativeWind + Tailwind
- React Native Reanimated 4
- react-native-nfc-manager
- expo-haptics

## Local Setup

Prerequisites:

- macOS + Xcode
- Node.js 18+
- npm
- NFC-capable iPhone
- NFC tags (recommended: NTAG215)

Install and run:

```bash
npm install
npm run ios
```

If native build artifacts get stale:

```bash
rm -rf node_modules ios/Pods ios/build
npm install
cd ios && pod install && cd ..
npm run ios
```

## Quality Gates

Every pull request is expected to pass:

- `npm run typecheck`
- `npm run lint`
- `npm test`

CI is configured in [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Security Notes

- Never hardcode API keys or private tokens.
- Use GitHub repository secrets for CI/CD injected credentials.
- Keep local environment variables in ignored `.env` files.
- Follow [SECURITY.md](SECURITY.md) for vulnerability reporting and response expectations.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

For maintainers, branch governance defaults are documented in [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md).

## Code Of Conduct

This project follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
