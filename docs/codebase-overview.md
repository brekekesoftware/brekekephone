### Codebase overview

<!-- START doctoc -->

- [Quick summary](#quick-summary)
- [Pre-merge checklist for risky changes](#pre-merge-checklist-for-risky-changes)

<!-- END doctoc -->

> Scope: current `master`, app version `3.0.0`. Version 3.0.0 was a full tooling/structure migration (see `CHANGELOG.md`): the repo moved from a single-package yarn/CRA-Craco layout to a pnpm monorepo (`brekekephone/app` for React Native, `brekekephone/web` for the Vite web build), file names moved from camelCase to kebab-case, MobX moved from legacy decorators to `makeAutoObservable`, and New Architecture/Hermes were switched on instead of off. If you are reading old notes, PRs, or comments that predate this migration, treat file paths and some of the invariants in these docs as superseding them.

#### Quick summary

Brekeke Phone is a VoIP/SIP softphone running on Web, iOS, and Android, and it is genuinely hard to work on correctly: it has to keep a real-time call alive and in sync with a remote PBX across foreground, background, locked screen, killed app, and being woken up cold by a push notification, on three platforms with three different sets of native call/telephony APIs (CallKit/PushKit/LPC on iOS, CallKeep/foreground service on Android, WebRTC in the browser). Many places in the code look a bit "odd" not because it was designed to look nice, but because each of those app-lifecycle x platform combinations has its own failure mode, and the code has been shaped by real production regressions, not by aesthetics.

The areas most prone to regressions are login, push notifications, CallKeep/CallKit, SIP/WebRTC, PBX/PAL, UC, MFA, LPC, multi-account, and custom page. These are exactly the areas where state has to survive an app being suspended, killed, or switched mid-call, so a change that looks correct in a quick manual foreground test can still break a specific background/killed/lock-screen path. If you touch one of these areas, test with real flows on a real device, not just lint/build. The codebase has inline `BUG-XXXX` comments (e.g. `BUG-1207`, `BUG-1238`, `BUG-1250`) marking spots that guard a specific past regression -- if you are about to change code near one, read the comment and understand what it prevents before touching it.

For the folder-by-folder breakdown, see [Repo layout](./repo-layout.md). For the deeper "why is this like this" per area, see the topic list in the root [README](../README.md).

#### Pre-merge checklist for risky changes

- Test login/logout, auto-login, switch account.
- Test outgoing and incoming calls in foreground, background, lock screen, killed app.
- Test answer/reject in quick succession, caller cancels quickly, tapping a notification while the app is switching account.
- Test hold/mute/speaker/DTMF/transfer/park if you touch calls.
- Test Android background mic/camera, notification channel, default dialer, target SDK.
- Test iOS CallKit/PushKit/LPC, audio route, missed call notification.
- Test the Vite web build and the embed example if you change shared code (`brekekephone/app/src`), `brekekephone/web`, `brekekephone/app/src/embed`, or a dependency.
- Test chat/UC if you touch the chat store: account with `ucEnabled` on and off, switch account, network loss mid-session.
- If you add or change UI text, run `make intl` and check that the `ja` file is not out of sync.
