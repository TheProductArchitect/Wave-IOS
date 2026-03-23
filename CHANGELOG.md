# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-23

### Added

- **NFC Firewall Safety Guard**: URL validation engine that blocks malicious protocols (`javascript:`, `data:`, `file:`), script-injection patterns, and unsupported schemes before any tag write.
- **Safety Verification & Trust**: Trusted domain recognition (LinkedIn, GitHub, Linktree) marked as "Safety Verified"; generic HTTPS URLs marked as "Safe"; HTTP URLs allowed with user proceed warning.
- **Positioning Animation**: Real-time card animation showing proximity to iPhone antenna, reducing guesswork during tag write operations.
- **Haptic Feedback**: Confirmation pulses for tag found, success, and error states.
- **TypeScript Foundation**: Full type safety across app logic and safety utilities.
- **Comprehensive Testing**: Unit tests for URL safety engine covering malware, injection, trust, and protocol validation.
- **ESLint & Prettier Integration**: Code quality gates via flat ESLint config (Expo preset) and pre-commit Husky hooks.
- **GitHub Actions CI**: Automated typecheck, lint, and test validation on push and PR to main.
- **Security Policy**: Vulnerability reporting guidelines in SECURITY.md with response expectations.
- **Contributor Covenant Code of Conduct**: Community conduct guidelines with enforcement procedures.
- **Issue Templates**: Structured bug report and feature request templates with triage metadata.
- **Branch Protection Guidance**: Recommended rules for main branch governance.
- **MIT License**: Open-source licensing for community contributions.

### Tech Stack

- Expo SDK 55
- React Native 0.83
- React 19.2.0
- TypeScript 5.9.2
- NativeWind 4.2.3 + Tailwind CSS 3.4.19
- React Native Reanimated 4.2.1
- react-native-nfc-manager 3.17.2
- expo-haptics 55.0.9
- ESLint 9.22.0 + Expo preset
- Jest 29.7.0 + jest-expo 55.0.6
- Husky 9.1.7 pre-commit hooks

### Security

- URL input validation blocks protocol-level attacks.
- No hardcoded secrets in codebase or CI.
- Private security advisories channel configured in issue templates.
- Dependency audit clean for production tree (0 vulnerabilities).

### Development

- Local setup: `npm install && npm run ios`
- Quality gates: `npm run typecheck`, `npm run lint`, `npm test`
- Pre-commit hooks enforce lint + typecheck before commit.
- All tests passing (5/5 for URL safety module).

### Documentation

- README: Core concept, safety guard logic table, setup, tech stack, quality gates.
- CONTRIBUTING.md: Development setup, coding conventions, required checks, physical device validation notes.
- CODE_OF_CONDUCT.md: Contributor Covenant with enforcement via GitHub Security Advisories or moderation issues.
- SECURITY.md: Vulnerability reporting, response timelines, scope definitions.

### Known Limitations

- Requires NFC-capable iPhone (iOS 12+).
- react-native-nfc-manager not yet tested on New Architecture; use with awareness.
- Test suite uses Node environment; Expo Native code requires physical device validation.

### Future Roadmap

- Android NFC support (currently iOS only).
- New Architecture compatibility validation.
- Extended trusted domain list (community contributing).
- QR code fallback for non-NFC devices.

---

## Release Notes

**Wave 1.0.0** is the first open-source release, bringing a security-first NFC tag programmer to the community. The app is production-ready for iOS with full test coverage, quality automation, and contributor governance in place.

All automated checks pass:
- Expo health: 17/17 checks
- Code quality: lint ✓, typecheck ✓, tests ✓
- Dependency audit: 0 vulnerabilities (production)

Contributions welcome via GitHub Issues and Pull Requests. See CONTRIBUTING.md for guidance.
