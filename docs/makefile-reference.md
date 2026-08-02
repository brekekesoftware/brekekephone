### Makefile reference

<!-- START doctoc -->

- [Requirements](#requirements)
- [`intl`](#intl)
- [Build and upload to dev01](#build-and-upload-to-dev01)
  - [`phonedev`](#phonedev)
  - [`phone`](#phone)
  - [`web`](#web)
  - [`embed_b`](#embed_b)
  - [`embed_u`](#embed_u)
  - [`dev`](#dev)
- [dev01 utils](#dev01-utils)
  - [`chmod`](#chmod)
  - [`ssl`](#ssl)
  - [`keyhash1` / `keyhash2`](#keyhash1--keyhash2)
- [`clean*`](#clean)
- [`fmt*`](#fmt)

<!-- END doctoc -->

There is no CI in this repo; every target here is a manual step run from a developer's machine, several of them with real `ssh`/`scp`/`sudo` access to the `dev01` server. Read a target before running it, especially the upload/deploy ones -- don't run them just to "see what happens". `dev01` must be reachable via a configured SSH host alias named `dev01` (`~/.ssh/config`) for anything below that touches the server.

#### Requirements

`V := $(shell jq -r ".appVersion" package.json)` at the top of the Makefile means every target that uses `$(V)` needs [`jq`](https://jqlang.org/) installed, and reads the version from the root `package.json`'s `appVersion` field (see [Credentials and config](./credentials-and-config.md#version-bump-locations)).

#### `intl`

```sh
make intl
```

```make
cd ./brekekephone/app
rm -rf ./intl-new-en.local.json
export EXTRACT_INTL=1
npx babel src -x .js,.ts,.tsx -d ./build
rm -rf ./build
node ./intl-build
```

Runs Babel over `brekekephone/app/src` with `EXTRACT_INTL=1` set, which makes `intl-babel-plugin.js` collect every `` intl`...` ``/`` intlDebug`...` `` template it finds into `intl-new-en.local.json` (the Babel output itself, `./build`, is thrown away -- only the plugin's side effect matters). `node ./intl-build` then diffs that scratch file against `src/assets/intl-en.json`, reuses old English->Japanese mappings for unchanged strings, marks new ones with a `**TRANSLATE**` prefix in `intl-ja.json`, and overwrites both files. See [i18n](./i18n.md) for the full mechanics -- this Makefile target is the trigger, that doc explains why it works this way.

Run this after adding/changing any UI text, then translate the new `**TRANSLATE**`-marked entries in `intl-ja.json` by hand.

#### Build and upload to dev01

These targets assume the release IPA was **already built and exported from Xcode** (Archive -> Export, Ad-hoc or Enterprise) to `./build/BrekekePhone/<scheme name>.ipa` at the repo root -- the Makefile does not invoke Xcode itself. See [Building and deploying to dev01](./dev01-deploy.md) for the full walkthrough, including exactly how to produce that IPA and where the matching Android keystore comes from.

##### `phonedev`

```sh
make phonedev
```

Uploads the dev build (`com.brekeke.phonedev` / "Brekeke Phone Dev") from **`master`**:

1. `pnpm i --frozen-lockfile` at the repo root.
2. `scp`s `./build/BrekekePhone/Brekeke Phone Dev.ipa` to `dev01:/var/www/upload/brekeke_phonedev$(V).ipa`, then deletes the local `./build/BrekekePhone` directory.
3. Builds the Android release APK from scratch (`cd brekekephone/app/android && ./gradlew clean && ./gradlew generateCodegenArtifactsFromSchema && ./gradlew assembleRelease`) -- the codegen step is required because New Architecture/Turbo Modules are enabled (see [Architecture and startup](./architecture-and-startup.md)); skipping it can produce a build against stale codegen output.
4. `scp`s the resulting `app-release.apk` to `dev01:/var/www/upload/brekeke_phonedev$(V).apk`.
5. Runs `make chmod` (see below) so the uploaded files are world-readable/writable on the server.

Result: downloadable from `https://dev01.brekeke.com/dev` (served by `dev01/web`, see [Building and deploying to dev01](./dev01-deploy.md)).

##### `phone`

Identical to `phonedev`, but for the **`release`** branch build (`com.brekeke.phone` / "Brekeke Phone") -- same IPA-already-exported assumption, same Android build steps, uploads to `brekeke_phone$(V).ipa`/`.apk` instead. See [Branching strategy](./branching-strategy.md) for what `release` actually is.

##### `web`

```sh
make web
```

1. `pnpm i --frozen-lockfile`, then `cd brekekephone/web && pnpm build` (Vite build + the embed post-processing step, see [Web and embed](./web-and-embed.md)).
2. Renames the build output to `brekeke_phone$(V)`, zips it, and `scp`s the zip to `dev01:/var/www/upload`.
3. Cleans up the local zip/folder.
4. On the server: removes the currently-deployed `/var/www/phone`, unzips the new build in its place. This is what makes `https://dev01.brekeke.com/phone/` serve the new build; the same zip also stays downloadable from `/var/www/upload` via the dev01 download page.
5. Runs `make chmod`.

##### `embed_b`

```sh
make embed_b
```

"Build" only, no upload: builds `brekekephone/web`, then copies its output into `embed-example/react/public/brekeke_phone$(V)` (after removing any previous `brekeke_phone*` there). This lets you run/build the embed example locally against a real freshly-built web bundle without touching the `dev01` server at all.

##### `embed_u`

```sh
make embed_u
```

"Upload": builds `embed-example/react` itself (which is expected to already point at a web bundle placed there by `embed_b`, or otherwise available), zips the output, uploads it, and swaps it into `/var/www/embed` on the server the same way `web` swaps `/var/www/phone`. Result: `https://dev01.brekeke.com/embed/`.

##### `dev`

```sh
make dev
```

Deploys the `dev01` infrastructure itself (the download page and its API), not the app:

1. Builds `dev01/web` (the download page), zips it, uploads it, and swaps it into `/var/www/dev-web` on the server.
2. Copies `dev01/api/index.js`/`package.json` to the server's `/var/www/dev-api`, runs `npm i` there, and restarts it under `pm2` (`pm2 -s delete all && pm2 flush && pm2 -s start --name=dev-api . && pm2 save` -- `flush` clears old logs, `-s` runs pm2 silently, and `save` persists the process list so it survives a reboot).
3. Copies `dev01/api/nginx.conf` to `/etc/nginx/conf.d/dev01.conf` on the server, tests the config (`nginx -t`), and restarts nginx.
4. Runs `make chmod`.

Only run this when you're actually changing the download page, the API, or the nginx routing -- see [Repo layout](./repo-layout.md#dev01) for what each of those pieces does.

#### dev01 utils

##### `chmod`

```sh
make chmod
```

`ssh dev01 "sudo chmod -R a+rwX /var/www"` -- makes everything under `/var/www` world-readable/writable/executable. Every upload target above calls this at the end so the next person's upload (or the web server serving the files) doesn't hit a permission error from a previous upload's more restrictive ownership.

##### `ssl`

```sh
make ssl
```

Runs `dev01/ssl.sh`, which on the server: stops nginx, runs `certbot renew`, restarts nginx, regenerates a `.p12` file from the renewed cert (`tomcat7.p12`, password `tomcat7`), restarts the PBX's own Tomcat so it can be updated with the new cert, then `scp`s the `.p12` back to the local machine (to `../0/brekeke`, i.e. a sibling directory of the repo, not inside this repo). The comments at the bottom of `dev01/ssl.sh` describe the manual step still needed after this: upload the downloaded `.p12` in the PBX admin (`SIP Server > Configuration > SIP > Key and Certificate`) and restart.

##### `keyhash1` / `keyhash2`

```sh
make keyhash1   # from the live cert already on dev01
make keyhash2   # from a local tomcat7.p12 file
```

Both compute the same thing -- the SPKI SHA-256 base64 hash used to pin LPC's TLS connection (`webphone.lpc.keyhash`, see [LPC subsystem](./lpc.md)) -- just from two different sources: `keyhash1` reads the cert directly off the `dev01` server, `keyhash2` reads it from a local `../0/brekeke/tomcat7.p12` file (the same file `make ssl` downloads to). Useful when setting up or renewing LPC for a PBX and you need to confirm what keyhash the app should be configured with, or to debug an LPC TLS-pinning rejection.

#### `clean*`

```sh
make clean         # normal clean + reinstall native deps
make clean_deep     # clean + wipe more caches (slow next build)
make clean_rm       # just remove build artifacts, no reinstall
make clean_deep_rm  # clean_rm + wipe global caches, no reinstall
```

`clean`/`clean_deep` both run `pnpm clean && pnpm dedupe`, then clean the Android Gradle build (`cd brekekephone/app/android && ./gradlew clean`). Their CocoaPods step differs: `clean` just reinstalls (`cd ios && pod install --repo-update`), while `clean_deep` is more destructive -- `pod cache clean --all && pod deintegrate && pod install --repo-update` -- fully wiping the local Pods cache and de-integrating CocoaPods from the Xcode project before reinstalling from scratch. `clean_deep` additionally wipes `~/Library/Caches/CocoaPods`, `~/.gradle/caches`, `~/.gradle/daemon`, and Metro/Haste/react-native temp dirs -- the next build after `clean_deep` will be much slower while everything re-populates, so only reach for it when a normal `clean` didn't fix whatever you were debugging.

Note the `pod install` here is a bare `pod install`, not `bundle exec pod install` -- see [iOS build](./ios-build.md) for why CocoaPods is otherwise managed through Bundler in this repo; if your system's global `pod` version differs from the one pinned in `brekekephone/app/Gemfile`, prefer running `bundle exec pod install --repo-update` yourself instead of `make clean`.

#### `fmt*`

```sh
make fmt       # everything below, in sequence
make fmt_objc
make fmt_swift
make fmt_java
make fmt_kotlin
make fmt_xml
make imagemin
```

`make fmt` runs `pnpm fmt` (JS/TS, see [Format and lint](./format-and-lint.md)) then the five native formatters, each scoped to git-tracked files matching an extension via the `git-ls` helper target (`comm -3 <(git ls-files) <(git ls-files -d)` -- tracked files minus deleted-but-not-yet-staged ones -- piped through `egrep` for the extension list):

- `fmt_objc` -- `.h`/`.m` via `clang-format-11`
- `fmt_swift` -- `.swift` via `swiftformat`
- `fmt_java` -- `.java` via `google-java-format`
- `fmt_kotlin` -- `.kt` via `ktfmt`
- `fmt_xml` -- `.storyboard`/`.xcscheme`/`.xcworkspacedata` via `pnpm dlx prettier --parser=xml`

`imagemin` (not part of `fmt`, run separately) losslessly compresses tracked `.png`/`.jpg`/`.gif`/`.ico` files in place, one at a time, via `imagemin-cli`.

All five native formatters plus `imagemin-cli` need to be installed locally first (see [Format and lint](./format-and-lint.md) for the install command) -- if you don't have all of them, run `pnpm fmt` alone instead of `make fmt`, rather than committing a diff that only formatted some files.
