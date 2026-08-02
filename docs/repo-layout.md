### Repo layout

<!-- START doctoc -->

- [`brekekephone/`](#brekekephone)
- [`dev01/`](#dev01)
- [`embed-example/`](#embed-example)
- [Everything else at the repo root](#everything-else-at-the-repo-root)

<!-- END doctoc -->

At the top level, there are three main application directories, plus shared tooling/config at the repo root.

#### `brekekephone/`

The actual product, as a pnpm workspace with two packages:

- `brekekephone/app` -- the React Native app (iOS + Android). This is the source of truth for almost all app logic; see [Getting started](./getting-started.md), [Android build](./android-build.md), [iOS build](./ios-build.md). Inside its `src/`:
  - `api/` -- SDK wrapper (`pbx.ts`, `sip.ts`, `uc.ts`), event hub `index.ts`, PN token sync, custom page URL.
  - `stores/` -- MobX stores and the `ctx` singleton, navigation, alert/picker/keyboard/toast.
  - `components/` -- shared UI, `root-view.tsx`, `Rn*`-style wrappers.
  - `pages/` -- page components, named `page-xxx.tsx`.
  - `utils/` -- PN parsing, callkeep, permissions, ringtone, deeplink, debug log, timer.
  - `brekekejs/` -- vendored SDK as plain JS plus a hand-written `index.d.ts`.
  - `embed/` -- embed API for the host/Operator Console.
  - `polyfill/` -- polyfill and null modules for web, plus MobX configuration.
  - `assets/` -- images, sound files (ringtones, chat ding), and the `intl-en.json`/`intl-ja.json`/`intl-vi.json` translation arrays (see [i18n](./i18n.md)).
  - `theme/` -- `brekeke.scss`/`brekeke-scss.ts` (Tailwind CSS variables, kept in sync by hand, see [Styling and UI](./styling-and-ui.md)) and `brekeke.ts` (the static `ThemeConfig`).
  - `declarations/` -- ambient TypeScript declarations (`env.d.ts`, `global.ts`).
  - `icons/` -- a handful of svg-based icon wrappers.
  - `android/`, `ios/` (siblings of `src/`, not inside it) -- native code, including the LPC extension and the native incoming call UI (Kotlin/Swift).
- `brekekephone/web` -- the Vite package that builds the web/embed bundle. Its own `src/` is a thin shim that imports `brekekephone/app/src` directly; see [Web and embed](./web-and-embed.md).

For everything about how the app itself works (architecture, auth, calling, LPC, etc.), see the engineering topics linked from the root [README](../README.md).

#### `dev01/`

Infrastructure for `dev01.brekeke.com`, the internal server used to host dev/beta builds for testing (not the App Store/Play Store). See [Building and deploying to dev01](./dev01-deploy.md) for the full workflow. Its own layout:

- `dev01/api/` -- a small Express API (`index.js`) that lists uploaded build files under `/var/www/upload` and generates the iOS OTA-install `.plist` manifest so an IPA can be installed straight from the browser via `itms-services://`.
- `dev01/web/` -- the actual download page shown at `https://dev01.brekeke.com/` (a small Vite/React app, not related to `brekekephone/web`). It lists available Dev/Prod/Web builds by version, with download/install links.
- `dev01/api/nginx.conf` -- the nginx config for the whole server: routes `/upload` (raw files), `/phone` (the deployed web app), `/embed` (the deployed embed bundle), `/dev-api` (proxies to the Express API above), and `/` (the download page).
- `dev01/ssl.sh` -- renews the Let's Encrypt cert on the server and regenerates the `.p12` file the PBX itself needs for its own SIP TLS cert (see `make ssl`/`make keyhash1`/`make keyhash2` in [Makefile reference](./makefile-reference.md)).

#### `embed-example/`

Two minimal example hosts that consume the embed API (`window.Brekeke.Phone.render`, see [Web, embed, and navigation](./web-embed-and-navigation.md)) the way a third-party integrator or Operator Console would:

- `embed-example/react/` -- a small Vite/React app. This is the one built/uploaded by `make embed_b`/`make embed_u` (see [Makefile reference](./makefile-reference.md)) and served at `https://dev01.brekeke.com/embed/`.
- `embed-example/html/` -- a single static `index.html` showing the plainest possible embed usage, no build step.

#### Everything else at the repo root

- `Makefile` -- build/release/format entry points; see [Makefile reference](./makefile-reference.md).
- `patches/` -- dependency patches applied automatically by pnpm; treat as part of the source code (see [SDK and dependencies](./sdk-and-dependencies.md)).
- `docs/` -- this documentation, including `docs/TODO.md` (known bugs, dead code, and process gaps found while working in this codebase).
- `CHANGELOG.md` -- release history, organized by QA issue id (see [Current state and PR guidelines](./current-state-and-pr-guidelines.md)).
- Workspace-level config shared by both `brekekephone` packages: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.js`, `tailwind.config.js`, etc.
