<!-- START doctoc -->

- [Config and build](#config-and-build)
  - [Config, credentials, and build version](#config-credentials-and-build-version)
  - [Build, release, and deploy live in the Makefile (paths updated for the monorepo)](#build-release-and-deploy-live-in-the-makefile-paths-updated-for-the-monorepo)

<!-- END doctoc -->

# Config and build

> This file focuses on _why_ config/build are shaped this way. For the practical "how do I actually run this" reference, see [Credentials and config](./credentials-and-config.md) and [Makefile reference](./makefile-reference.md) instead -- they cover the same files/targets in more day-to-day-usable detail and are kept more current.

## Config, credentials, and build version

**What looks a bit odd:** important build/runtime files are gitignored, such as `google-services.json`, the release keystore, and `src/api/turn-config.local.ts` (renamed from `turnConfig.ts`; the `.local.` in the name follows the same gitignore convention as `intl-new-en.local.json`, see [i18n](./i18n.md)).

**Why it has to be this way:**

- These are secrets or config that vary per brand/customer/build environment.
- A TURN server is usually not required; it can be `export default null` to turn TURN off.
- Firebase/APNs/keystore/provisioning should not live in git.

**Things to watch when changing this:**

- A release build error may be a missing local secret, not a source code issue.
- Changing the bundle id/application id/product name must stay in sync across Android, iOS, Firebase, APNs, PBX push config, and LPC app group/entitlement where relevant.
- The version currently lives in the root `package.json`'s `appVersion` (`3.0.0`), Android's `versionName`/`versionCode`, and iOS's `CFBundleShortVersionString`; a release must keep these in sync. `CHANGELOG.md` is organized by this same `appVersion`.

Related files:

- `README.md`
- `.gitignore`
- `brekekephone/app/android/app/build.gradle`
- `brekekephone/app/ios/BrekekePhone/Info.plist`

## Build, release, and deploy live in the Makefile (paths updated for the monorepo)

**What looks a bit odd:** the root `Makefile` still contains build, format, uploading to a server, and even a command to compute the TLS keyhash -- but every target that touches app/web code now `cd`s into `./brekekephone/app` or `./brekekephone/web` first, and uses `pnpm` instead of `yarn`.

**Why it has to be this way:**

- There is no CI in the repo, so release is a manual process recorded as make targets.
- The web build's post-processing step for embed moved from a Makefile-level `node .embed` call into the web package's own `pnpm build` script (`brekekephone/web/package.json`: `"build": "vite build && node ./embed-build.cjs"`), so `pnpm build` inside `brekekephone/web` is already the full build, not just a Vite build that the Makefile has to post-process separately.
- LPC needs `webphone.lpc.keyhash` (SPKI SHA256 base64) when setting up or renewing a cert, hence `make keyhash1` (from a cert on the server) and `make keyhash2` (from a local p12 file) -- unchanged.
- `make intl` still clears the Babel cache and rebuilds label files, but now runs from inside `brekekephone/app` and produces `intl-new-en.local.json` there (see [i18n](./i18n.md) for the full pipeline).

**Things to watch when changing this:**

- The `phone`, `phonedev`, `web`, `embed_b`, `embed_u`, `dev` targets `scp`/`ssh`/`sudo` into a real server. Read them carefully before running; do not run them just to "try".
- `make clean_deep_rm` wipes global caches (`~/.gradle`, DerivedData); the next build will be very slow.
- The iOS IPA is built from Xcode to a path outside the repo, then uploaded; the make target does not build the IPA itself.
- `make intl` clears the babel cache and rebuilds labels; skipping this step means new text will not be in the intl files.
- `make fmt` still formats native code (objc/swift/java/kotlin/xml via `clang-format-11`/`swiftformat`/`google-java-format`/`ktfmt`) in addition to `pnpm fmt` for JS/TS -- Android native code being Kotlin now (not Java) does not change this command, since `fmt_kotlin` already existed for `.kt` files.

Related files:

- `Makefile`
- `brekekephone/web/embed-build.cjs`
- `brekekephone/app/intl-build.js`
- `dev01/`
