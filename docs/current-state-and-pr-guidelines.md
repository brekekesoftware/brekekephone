<!-- START doctoc -->

- [Current state and PR guidelines](#current-state-and-pr-guidelines)
  - [Current state and how to read history](#current-state-and-how-to-read-history)
  - [Things that should not be bundled into one PR](#things-that-should-not-be-bundled-into-one-pr)

<!-- END doctoc -->

# Current state and PR guidelines

## Current state and how to read history

- The app is on `3.0.0` (`package.json`'s `appVersion`, matches `android`/`ios` version fields per [Config and build](./config-and-build.md)). `CHANGELOG.md`'s `3.0.0` entry is exactly the migration this document describes: "Upgrade dev tools and framework to use tailwind and modern code base structure." Older entries (`2.17.x`) predate the monorepo/pnpm/Vite/Tailwind/New-Architecture migration -- their fixes are still real and still relevant to the areas they touch (auth, LPC, MFA, chat notifications), but their file paths and some mechanisms will not match current code; cross-reference against the other per-topic docs rather than assuming a `2.17.x` changelog entry describes today's implementation verbatim.
- `CHANGELOG.md` records entries by QA issue ID. When counting/reconciling fixes, track by issue ID, not by commit, since one commit can bundle multiple issues and vice versa.
- Because 3.0.0 _is_ the current mainline now (not a side branch), the old caution about "porting code from the 3.0 branch to master" no longer applies -- that migration already happened. Do not go looking for a separate `3.0` branch to reconcile against.
- The `2.17.21` hotfix (`master`) and the `3.0.0` migration (this branch) were developed in parallel and have since been merged, with `master`'s bug-fix logic taking priority over this branch's pre-fix code wherever the two touched the same area. The previously-tracked work-in-progress bugs -- custom page going blank after PAL reconnect/account switch (`BUG-1253`/`1254`), `incoming=open` custom pages not loading reliably including missed/background/lock-screen/killed-app calls (`BUG-1257`), UC getting stuck at "Connecting to UC" after a fast account switch (`BUG-1256`), and custom-page runtime leaking to the wrong account on a PN/chat-notification-driven switch (`BUG-1257`) -- are now fixed in this branch too; see [Auth and accounts](./auth-and-accounts.md) and [Custom page](./custom-page.md) for the actual mechanisms (`AuthUC`'s connecting watchdog, `UC.connect()`'s pending-promise rejection, and `auth-store.ts`'s custom-page event queue). Any _other_ previously-tracked WIP bug not in this list should still be re-verified against current `CHANGELOG.md`/issue tracker rather than assumed still open, since the underlying auth/switch/custom-page code has changed substantially.
- The codebase's `BUG-XXXX` inline comments (see the index page) are the most reliable source of "what specific regression does this code prevent" for anything you're about to touch -- prefer them over changelog archaeology when they exist near the code you're editing.

## Things that should not be bundled into one PR

- Upgrading a dependency + fixing a feature.
- Bumping target SDK/iOS settings + refactoring CallKeep.
- Fixing the push notification parser + changing the native payload format (or the forked native dependencies that inject `callkeepUuid`) without a sample payload.
- Fixing MFA + PN sync + multiple-account in one large PR.
- Fixing LPC iOS + Android at the same time, unless they share the same root cause.
- Changing navigation + changing auth/PN.
- Changing the `_api_profiles` schema/persist key + a feature change (the migration should be its own change).
- Adding a new permission + refactoring the call flow.
- Bulk text/i18n changes + logic changes (a large intl diff hides the logic diff; see [i18n](./i18n.md)).
- Converting more `StyleSheet.create` usage to Tailwind classes + changing the behavior of the component being converted (keep pure styling conversions and logic changes as separate diffs so a style refactor doesn't hide a behavior change).
- Changing the bridgeless native incoming-call surface (`IncomingCallActivity`/`IncomingCallRoot`) + changing `PageCallManage` behavior in the same PR as an unrelated main-call-screen feature -- remember both consume the same component now, so a "small" change to one is a change to both entry points.
- Re-enabling the disabled Android call-log write ([Calling and telephony](./calling-and-telephony.md)) bundled with unrelated recents/notification changes -- it touches a separate, Google-Play-scrutinized permission and deserves its own test pass.

If you need to do any of the above, split it into small branches/PRs, and document the invariants and the manual test matrix clearly.
