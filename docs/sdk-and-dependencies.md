<!-- START doctoc -->

- [SDK and dependencies](#sdk-and-dependencies)
  - [The vendored Brekeke SDK and its API boundary](#the-vendored-brekeke-sdk-and-its-api-boundary)
  - [Dependency patches now use pnpm's built-in mechanism, not `patch-package`](#dependency-patches-now-use-pnpms-built-in-mechanism-not-patch-package)
  - [Dependencies are intentionally pinned](#dependencies-are-intentionally-pinned)

<!-- END doctoc -->

# SDK and dependencies

## The vendored Brekeke SDK and its API boundary

`src/brekekejs/*.js` (`pal.js`, `webrtcclient.js`, `ucclient.js`, `jsonrpc.js`, `phonebook.js`, `webnotification.js`) is plain JS, types are hand-written in `index.d.ts`/`ucclient.d.ts`, and the TypeScript wrapper lives in `src/api`. PBX/PAL, the WebRTC client, and the UC client are Brekeke SDKs with their own history. The app wraps the SDK into `PBX`, `SIP`, `UC` classes, which emit events to the stores. Calling the SDK directly skips retry logic, error handling, and the type boundary.

Stores/UI should not call `window.Brekeke` or `ctx.pbx.client.call_pal()` directly. Adding a new PAL method means adding a wrapper in `src/api/pbx.ts` and a type in `src/brekekejs/index.d.ts`. If you modify the vendored SDK, document the reason clearly and test the Web/OC bundle if relevant.

Related files:

- `brekekephone/app/src/brekekejs/`
- `brekekephone/app/src/api/pbx.ts`
- `brekekephone/app/src/api/sip.ts`
- `brekekephone/app/src/api/uc.ts`

## Dependency patches now use pnpm's built-in mechanism, not `patch-package`

The repo still has many patch files in `patches/`, but there is no `postinstall` script anywhere in `package.json`, no `patch-package` dependency, and the patch filenames dropped their version suffix (e.g. `react-native-callkeep.patch`, not `react-native-callkeep+4.3.16.patch`).

This is a deliberate, direct benefit of the pnpm migration: pnpm has built-in dependency patching via `pnpm-workspace.yaml`'s `patchedDependencies` map (package name -> patch file), applied automatically as part of install. There is no `patch-package` package, no `postinstall` hook, and no version-suffixed filename convention to maintain; pnpm already knows which exact resolved version a patch applies to from the lockfile. Confirmed current `patchedDependencies` entries: `@react-native-documents/picker`, `@react-native/gradle-plugin`, `bezier-easing`, `eslint-plugin-import`, `eslint-plugin-react`, `event-target-shim`, `jssip`, `react-native-callkeep`, `react-native-notifications`, `react-native-splash-screen`, `react-native-voip-push-notification`, `react-native-web`, `react-native-webrtc`, `react-native`, `unicorn-magic`. Most of these exist for the same underlying reasons as before (React 19 compat, CallKeep Android service, JsSIP behavior, WebRTC, notifications, document picker), but a new, large reason was added in 3.0.0: every native module had to be upgraded and/or patched specifically for Turbo Module (New Architecture) compatibility, since the app can no longer run on the Old Architecture (see [Architecture and startup](./architecture-and-startup.md)). If you see a patch whose diff looks unrelated to any previously-known bug, check whether it is New-Architecture-compatibility work before assuming it is dead weight.

A comment worth not taking at face value: "custom fork" claims that turned out to be patches, not forks. `push-notification-parse.ts` has inline comments stating the app depends on "a custom fork of react-native-voip-push-notification to get callkeepUuid" and that "we forked fcm to insert callkeepUuid there as well". Verified this is not a real fork relationship for either half: `react-native-voip-push-notification` is a normal npm dependency whose `callkeepUuid` injection is a regular pnpm patch (`patches/react-native-voip-push-notification.patch`, listed above); there is no dependency named "fcm" in `package.json` at all, so the "we forked fcm" half is plain custom app code (a custom `FirebaseMessagingService` in `BrekekeUtils.kt`), not a forked package. When auditing where `callkeepUuid` injection happens, `patches/` plus that native file is the complete picture; there is no actual forked git dependency to go looking for. See [Push notifications](./push-notifications.md) for the full correction.

Use `pnpm`, not `yarn`/`npm`; patches apply automatically as part of `pnpm install`, no separate step needed. When bumping a patched dependency, read what the patch (or fork) was fixing and port it by hand; pnpm will refuse to silently apply a patch against an incompatible version, but it is still your job to verify the diff still makes sense. An error right after `pnpm i` may be a patch that no longer applies cleanly to a newer resolved version, not an app code issue. When creating a new patch, avoid including build artifacts from `node_modules`.

Related files:

- `pnpm-workspace.yaml`
- `patches/`
- `Makefile`

## Dependencies are intentionally pinned

Versions in `brekekephone/app/package.json`/`brekekephone/web/package.json` are exact, without `^`. There is no `.ncurc.js` anywhere in the repo anymore (it existed before 3.0.0 to block accidental `jssip`/`react-native-webrtc` upgrades via `npm-check-updates`).

`jssip` and `react-native-webrtc` must match the SDK vendored in `src/brekekejs`; bumping them changes SIP/WebRTC behavior. Many packages are patched (or forked) against a specific version (see above). `pnpm-workspace.yaml`'s `overrides` block pins the handful of versions that must match identically across both the `app` and `web` packages regardless of what each package's own `package.json` would otherwise resolve to: `react`/`react-dom` (`19.1.0`), `react-native` (`0.80.1`), plus a couple of transitive-conflict pins (`@typescript-eslint/parser`, `@typescript-eslint/typescript-estree`, `event-target-shim`).

Bumping `jssip`/`react-native-webrtc` is its own task, and requires retesting the whole call flow and the Operator Console bundle. Before bumping any package, check `patches/` and `pnpm-workspace.yaml`'s `patchedDependencies`/`overrides` to see if it is being patched or cross-pinned. There is no `.ncurc.js` gate anymore; nothing will stop an `ncu`-style tool from proposing a `jssip`/`react-native-webrtc` bump automatically. Treat any such proposal with the same caution the old `.ncurc.js` used to enforce, just manually. Use `pnpm` (workspace-aware); engines require `node >= 24.11`, `pnpm >= 11`.

Related files:

- `brekekephone/app/package.json`
- `brekekephone/web/package.json`
- `pnpm-workspace.yaml`
- `patches/`
