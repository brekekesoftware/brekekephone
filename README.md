# Brekeke Phone

[App Store](https://apps.apple.com/us/app/brekeke-phone/id1233825750) | [Google Play](https://play.google.com/store/apps/details?id=com.brekeke.phone)

VoIP/SIP softphone for Web, iOS, and Android. A pnpm workspace with two packages: `brekekephone/app` (React Native, also the source of truth for shared app logic) and `brekekephone/web` (Vite web/embed build). Uses [rntwsc](https://github.com/namnm/rntwsc) for Tailwind class names in React Native and shared devtools (format/lint/type-check).

<!-- START doctoc -->

- [Quick access](#quick-access)
- [Documentation](#documentation)
  - [Build, test, and release](#build-test-and-release)
  - [Config and credentials reference](#config-and-credentials-reference)
  - [Feature notes](#feature-notes)
  - [Engineering deep-dive (lowest priority -- only if you need to understand the internals)](#engineering-deep-dive-lowest-priority----only-if-you-need-to-understand-the-internals)

<!-- END doctoc -->

### Quick access

- Recommended OS version as of Apr 2026:
  - [Android 14-15](https://developer.android.com/google/play/requirements/target-sdk)
  - [iOS 26](https://developer.apple.com/ios/submit/)
- [Getting started](./docs/getting-started.md)
- [Building for the App Store and Play Store](./docs/app-store-release.md) -- the most common reason to be here: bump a version or ship a small fix, then get it built, tested, and uploaded

### Documentation

Most changes to this app are small (a version bump, a one-line hotfix) and don't need any of the deep architecture knowledge further down this list. **Build, test, and release** is the path that actually matters day to day; the engineering deep-dive at the bottom is only for when you need to understand _why_ the code does something, not just _how_ to ship it.

#### Build, test, and release

The full path from "I changed one line" to "it's on the store" / "it's on `dev01` for QA":

- [Getting started](./docs/getting-started.md) -- requirements, install, running the app/web dev servers
- [Android build](./docs/android-build.md)
- [iOS build](./docs/ios-build.md)
- [Web and embed](./docs/web-and-embed.md)
- [Format and lint](./docs/format-and-lint.md) -- run before every PR
- [Branching strategy](./docs/branching-strategy.md) -- which branch to work on (`master`/`release`), how they're kept in sync, version branches
- [Makefile reference](./docs/makefile-reference.md) -- what every `make` target actually does
- [Building and deploying to dev01](./docs/dev01-deploy.md) -- internal ad-hoc/testing builds for QA, iOS provisioning profile requirements
- [Building for the App Store and Play Store](./docs/app-store-release.md) -- the official public release path

#### Config and credentials reference

- [Repo layout](./docs/repo-layout.md) -- the three main directories (`brekekephone/`, `dev01/`, `embed-example/`) and what each is for
- [Credentials and config](./docs/credentials-and-config.md) -- keystores, `google-services.json`, TURN config, version bump locations
- [Push notification setup](./docs/push-notification-setup.md)

#### Feature notes

- [Custom branding build](./docs/custom-branding.md)
- [Network proxy setup](./docs/network-proxy-setup.md)
- [Custom ringtone](./docs/custom-ringtone.md)
- [URL scheme - open custom page](./docs/url-scheme-custompage.md)

#### Engineering deep-dive (lowest priority -- only if you need to understand the internals)

Architecture, risk areas, and pitfalls across the whole codebase. Start with [Codebase overview](./docs/codebase-overview.md) if you're new here, otherwise jump straight to the topic you need:

- [Codebase overview](./docs/codebase-overview.md) -- risk areas and a pre-merge checklist for any change that touches app logic, not just build/version
- [Architecture and startup](./docs/architecture-and-startup.md) -- monorepo/pnpm/Vite layout, the `ctx` singleton, MobX 6, why MobX was chosen over Redux, New Architecture/Hermes/Fabric now enabled and what that unlocked
- [Styling and UI](./docs/styling-and-ui.md) -- Tailwind class names via the rntwsc babel compiler, dark mode, orientation support, Reanimated
- [Auth and accounts](./docs/auth-and-accounts.md) -- PBX/SIP/UC state machines, multi-account switch teardown, account persistence
- [MFA](./docs/mfa.md) -- OTP flow, device tokens, PAL client scoping, interaction with active calls and embed
- [Push notifications](./docs/push-notifications.md) -- app init from PN, PN dedupe and `callkeepUuid`
- [Calling and telephony](./docs/calling-and-telephony.md) -- CallKeep/CallKit, the bridgeless native incoming-call UI, Android foreground service, call line header, DTMF, call actions, recents/missed call
- [LPC subsystem](./docs/lpc.md) -- Local Push Connectivity
- [Custom page](./docs/custom-page.md) -- custom page and incoming/missed call handling
- [PBX API and config-driven behavior](./docs/pbx-api-and-config.md) -- the PAL request/retry layer, server probing, MFA method gating, `webphone.*` feature flags
- [i18n](./docs/i18n.md) -- index-based translation system and the `make intl` build step
- [Logging and user notifications](./docs/logging-and-notifications.md) -- debug log capture, toast/alert/banner layers
- [Contacts and chat](./docs/contacts-and-chat.md) -- phonebook/buddy list/PhoneAppli, UC chat state
- [Permissions and ringtone](./docs/permissions-and-ringtone.md) -- platform permission matrix, ringtone subsystem
- [Timers and app state](./docs/timers-and-app-state.md) -- background timers, app state handling
- [SDK and dependencies](./docs/sdk-and-dependencies.md) -- vendored Brekeke SDK, pnpm-native patches, forked native dependencies, pinned versions
- [Web, embed, and navigation](./docs/web-embed-and-navigation.md) -- the Vite web package, embed mode, custom navigation stack
- [Config and build](./docs/config-and-build.md) -- credentials/version config, Makefile-based build and release
- [Quality and testing](./docs/quality-and-testing.md) -- lack of automated tests, current state of type coverage/lint/pre-commit gates
- [Current state and PR guidelines](./docs/current-state-and-pr-guidelines.md) -- how to read `CHANGELOG.md`, things that should not be bundled in one PR
- [TODO](./docs/TODO.md) -- known bugs, dead code, and process/tooling gaps found while working in this codebase
