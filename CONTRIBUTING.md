# Contributing to Wave

Thanks for helping improve Wave. This project writes NFC cards, so changes must be reliable on real hardware and easy to review.

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Build and run the iOS dev client:

```bash
npm run ios
```

3. Start Metro for iterative development:

```bash
npm run start
```

## Running iOS Simulator

- Open Xcode and ensure Command Line Tools are configured.
- Run `npm run ios` to build and launch on the default simulator.
- To switch simulator device, use the Simulator app menu or run:

```bash
xcrun simctl list devices
```

## Coding Conventions

- Language: TypeScript.
- Styling: prefer Tailwind classes through NativeWind for new UI work.
- Keep architecture predictable: UI concerns in screens/components, safety logic in dedicated modules.
- Avoid large mixed-purpose functions in write flow code.

## Required Checks

Before opening a PR, run:

```bash
npm run typecheck
npm run lint
npm test
```

Pre-commit hooks run lint + typecheck automatically, but you should still run tests locally.

## Pull Requests

- Use a focused branch per change.
- Fill out the pull request template completely.
- Explicitly call out NFC hardware impact when relevant.
- Include physical-device verification notes for NFC flow changes.

## Commit Style

- Keep commit messages short and descriptive.
- Prefer one concern per commit.

## Reporting Issues

When reporting bugs, include:

- iOS version
- iPhone model
- NFC tag type (NTAG213/215/216)
- Reproduction steps
- Expected vs actual behavior
