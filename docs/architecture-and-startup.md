<!-- START doctoc -->

- [Architecture and startup](#architecture-and-startup)
  - [Monorepo layout: `brekekephone/app` and `brekekephone/web`](#monorepo-layout-brekekephoneapp-and-brekekephoneweb)
  - [Startup order and import side effects](#startup-order-and-import-side-effects)
  - [The `ctx = {} as any` singleton](#the-ctx---as-any-singleton)
  - [MobX 6, no more legacy decorators](#mobx-6-no-more-legacy-decorators)
  - [Why MobX instead of Redux](#why-mobx-instead-of-redux)
  - [Old Architecture/Hermes/JSC are GONE -- New Architecture and Hermes are now on](#old-architecturehermesjsc-are-gone----new-architecture-and-hermes-are-now-on)

<!-- END doctoc -->

# Architecture and startup

## Monorepo layout: `brekekephone/app` and `brekekephone/web`

**What looks a bit odd:** the repo root has almost no app code; everything lives under `brekekephone/app/` (React Native) and `brekekephone/web/` (Vite). `brekekephone/web/src/index.ts` is one line: `import '../../app/src'`.

**Why it has to be this way:**

- This is the result of the 3.0.0 migration (see `CHANGELOG.md`): one codebase still has to run on Web, iOS, and Android, but the old single-package layout with `.cracorc.js` aliasing was replaced by two pnpm workspace packages.
- The move to a pnpm workspace was deliberate, not just a rename: before 3.0.0, every dependency (mobile app, web, tooling) lived in one `package.json`, so a version conflict or a native-only package leaking into the web bundle was easy to hit. Splitting into per-package `package.json`s (with pnpm-workspace-level `overrides` for the handful of versions that must match everywhere, like `react`/`react-dom`/`react-native`) keeps each package's dependency graph smaller and easier to reason about. pnpm was also chosen over yarn because it is more efficient (content-addressable store, strict-by-default dependency resolution) and has built-in dependency patching (see [SDK and dependencies](./sdk-and-dependencies.md)), which yarn's patch-package workflow could only approximate.
- `brekekephone/app/src` is the real source of truth for almost all app logic (stores, api, pages, components, utils). `brekekephone/web` only adds a Vite entry point, a handful of web-only shims (`react-native-web-shim.ts`, `toast-android-stub.ts`), and its own `vite.config.ts` that re-aliases native-only packages to `brekekephone/app/src/polyfill/null.ts` -- the same idea as the old `.cracorc.js`, just expressed as Vite `resolve.alias` entries and Babel/Rolldown plugins instead of Craco config.
- `brekekephone/app/babel.config.js` derives its `@/*` import alias from `rntwsc/devtools/babel-config/get-alias`; `vite.config.ts` reuses the exact same alias list and the exact same `babel.config.js` (via a custom Babel-transform Vite plugin) so both platforms compile `src/` identically.

**Things to watch when changing this:**

- If you add a native-only dependency, alias it to `null.ts` in `brekekephone/web/vite.config.ts` the same way existing native-only packages are aliased (react-native-callkeep, react-native-fs, react-native-incall-manager, and others).
- Do not assume `.web.ts` files are picked up "by React Native Web magic" the way CRA/Craco used to hide it; the current mechanism is the explicit `resolve.extensions` list in `vite.config.ts` (`.web.js`, `.web.ts`, `.web.tsx` before the bare ones), duplicated for `optimizeDeps.rolldownOptions.resolve.extensions` because Vite's dependency-scanner uses a separate resolver.
- When changing shared code in `brekekephone/app/src`, run both `pnpm start`/`pnpm android` in `brekekephone/app` and `pnpm start` in `brekekephone/web` to catch a break on either platform.

Related files:

- `brekekephone/app/babel.config.js`
- `brekekephone/app/src/polyfill/*`
- `brekekephone/web/vite.config.ts`
- `brekekephone/web/src/index.ts`

## Startup order and import side effects

**What looks a bit odd:** `brekekephone/app/src/app.tsx` (the actual root component and `initApp`, not under `components/`) and `brekekephone/app/src/stores/ctx-imports.ts` import a lot of files only to run their side effects, in a specific order.

**Why it has to be this way:**

- `src/brekekejs/*` is a vendored plain JavaScript SDK that attaches itself to `window.Brekeke`.
- APIs/stores assign their own instance to the `ctx` singleton at the end of their module.
- `src/api/index.ts` is the event hub, and must be imported last because it registers listeners on `ctx.pbx`, `ctx.sip`, `ctx.uc` and calls into stores that must already be initialized.

**Things to watch when changing this:**

- Do not reorder imports in `ctx-imports.ts` unless you have traced the dependencies fully.
- Adding a new store/API means updating the `Ctx` type and importing it in the right order in `ctx-imports.ts`.
- If you hit a crash like `ctx.xxx undefined`, check the side-effect import order before touching the logic.

Related files:

- `brekekephone/app/src/app.tsx`
- `brekekephone/app/src/stores/ctx.ts`
- `brekekephone/app/src/stores/ctx-imports.ts`
- `brekekephone/app/src/api/index.ts`

## The `ctx = {} as any` singleton

**What looks a bit odd:** `brekekephone/app/src/stores/ctx.ts` is just `export const ctx: Ctx = {} as any`.

**Why it has to be this way:**

- The app uses MobX class stores, API events, and many cross-store actions.
- `ctx` lets stores/UI/API call each other through one shared entry point, avoiding passing stores through props and reducing direct circular imports.
- The trade-off is losing type safety at init time. Forgetting to assign `ctx.auth` or `ctx.call` is a runtime error, not a compile error.

**Things to watch when changing this:**

- Stores talk to each other via `ctx.*`, not by importing the store instance directly.
- UI/store code should not mutate another store's state directly; call that store's action instead.
- If you split a file or refactor a store, keep the `ctx.xxx = new Xxx()` side effect intact.

See "Why MobX instead of Redux" below for why this singleton exists in the first place.

## MobX 6, no more legacy decorators

**What looks a bit odd:** old comments/PRs may still mention `@observable`/`@action` decorators or a `mobx-react` patch for React 19. Neither exists anymore.

**Why it has to be this way, and what changed in 3.0.0:**

- The 3.0.0 migration moved every store off MobX 5 legacy decorators onto MobX 6's `makeAutoObservable` (e.g. `brekekephone/app/src/stores/auth-store.ts` starts with `import { makeAutoObservable } from 'mobx'`). There are zero `@observable`/`@action` decorators left in `src/`.
- `mobx-react` is now `9.2.2` and supports React 19 natively, so the old patch that force-fit an older `mobx-react` onto React 19 is gone; `patches/` has no `mobx-react` entry anymore.
- `brekekephone/app/src/polyfill/mobx.ts` (was `mobx-configure.ts`) still calls `configure({ enforceActions: 'never', computedRequiresReaction: false, observableRequiresReaction: false, reactionRequiresObservable: false, disableErrorBoundaries: false })` and still registers `onReactionError` to `console.error`. Legacy-leaning settings were kept even after the decorator migration, on purpose, to avoid a second large behavioral change at the same time.

**Things to watch when changing this:**

- Any component that reads MobX state must be wrapped with `observer()` from `mobx-react` (confirmed 74 files still do this), not `mobx-react-lite`.
- After an `await`, prefer wrapping observable writes so they are batched, even though `enforceActions: 'never'` means MobX will not throw if you don't.
- Do not bundle a further MobX/React upgrade together with a feature change.

Related files:

- `brekekephone/app/src/polyfill/mobx.ts`
- `brekekephone/app/package.json`

## Why MobX instead of Redux

**What looks a bit odd:** the app uses a MobX singleton (`ctx`) plus init functions instead of the more common React pattern of registering store subscriptions inside component lifecycle. There is no Redux anywhere, even though Redux was the original choice back when the project started.

**Why it has to be this way:**

- The project initially started around 2018-2019 using Redux, with events registered inside component lifecycle (mount/unmount).
- That broke under headless push notification callbacks: the callback can fire before any component has mounted, or after the screen is gone, so lifecycle-bound event registration missed pushes or read stale state. Push notification handling has a critical response time and cannot depend on whether a component happens to be mounted.
- The team migrated to a MobX singleton (`ctx`) plus init functions specifically to keep data consistent independent of component lifecycle, so a headless PN callback always sees fully initialized, up-to-date state regardless of what the UI is doing.
- Later versions of Redux added ways to access the store directly at the singleton level (outside components), which would have solved the original problem too. But by the time that existed, the MobX migration was already done and working correctly, so the team kept MobX instead of migrating back to Redux.

**Things to watch when changing this:**

- Do not reintroduce component-lifecycle-bound event registration for anything that must react to a headless PN callback; initialize it at the `ctx`/singleton level instead.
- If you ever evaluate a different state library, treat the headless PN callback path as a hard requirement, not an edge case: correctness and response time there matter more than ergonomics anywhere else in the app.
- Do not read "there's no Redux" or "this singleton looks like an anti-pattern" as an invitation to refactor toward per-component state; that is the exact failure mode this migration fixed.

Related files:

- `brekekephone/app/src/stores/ctx.ts`
- `brekekephone/app/src/stores/ctx-imports.ts`
- `brekekephone/app/src/utils/push-notification.ios.ts`
- `brekekephone/app/src/utils/push-notification.android.ts`

## Old Architecture/Hermes/JSC are GONE -- New Architecture and Hermes are now on

**What looks a bit odd:** if you read older internal notes, PRs, or comments referencing "old architecture" or "JSC", they are describing a state that no longer exists. This is a full reversal from before the 3.0.0 migration.

**What changed:**

- `brekekephone/app/android/gradle.properties`: `newArchEnabled=true`, `hermesEnabled=true`.
- `brekekephone/app/ios/Podfile`: `use_react_native!(..., :new_arch_enabled => true, :hermes_enabled => true, ...)`.
- This flip is what makes it possible for the Android native incoming-call activity to embed real RN UI (`PageCallManage`) via a Fabric surface/fragment instead of a hand-built, duplicated native call screen -- see [Calling and telephony](./calling-and-telephony.md) for that mechanism in detail.

**Why now:** this was not an optional performance nice-to-have. Starting with React Native 0.82, the framework no longer supports the Old Architecture at all (see the RN blog post on "New Architecture only", reactnative.dev/blog/2025/10/08/react-native-0.82). The app is currently pinned to RN 0.80.1, but enabling New Architecture/Turbo Modules/Hermes/Fabric now, ahead of that forced cutover, means the eventual upgrade to 0.82+ will be an ordinary version bump instead of a second big-bang migration. Every native module dependency had to be upgraded and/or patched specifically for Turbo Module compatibility as part of this same change (see [SDK and dependencies](./sdk-and-dependencies.md)).

**What to still watch for:**

- The app still has many sensitive native modules: WebRTC, CallKeep, PushKit/FCM, LPC, audio routing, ringtone, foreground service. The flip to New Architecture/Hermes/Fabric was done together with the native Kotlin/Swift rewrites (Android native code moved from Java to Kotlin as part of the same migration) and the bridgeless incoming-call surface -- treat all three as one coupled change, not independent toggles.
- If you hit a native-event, FCM-token, CallKeep, WebRTC, timer, or audio bug that looks timing- or bridge-related, consider that New Architecture/bridgeless behavior may be a factor, even though it "used to be JSC/Old Architecture" in older written notes.
- Do not flip Hermes/New Architecture back off in a PR that is not specifically about that; the call-answer path now structurally depends on Fabric being enabled.
- Android target SDK is 35, min SDK 27 (`brekekephone/app/android/build.gradle`); the 16KB page size consideration for newer Android targets still applies.

Related files:

- `brekekephone/app/android/gradle.properties`
- `brekekephone/app/android/build.gradle`
- `brekekephone/app/ios/Podfile`
- `brekekephone/app/ios/BrekekePhone/Info.plist`
