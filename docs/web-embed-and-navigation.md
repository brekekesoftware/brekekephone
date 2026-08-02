<!-- START doctoc -->

- [Web, embed, and navigation](#web-embed-and-navigation)
  - [Web build moved from CRA/Craco to Vite (and Tailwind is now the expected styling approach)](#web-build-moved-from-cracraco-to-vite-and-tailwind-is-now-the-expected-styling-approach)
  - [Custom-built navigation](#custom-built-navigation)

<!-- END doctoc -->

# Web, embed, and navigation

## Web build moved from CRA/Craco to Vite (and Tailwind is now the expected styling approach)

**What looks a bit odd:** `brekekephone/web/vite.config.ts` is a large, hand-written config with custom Babel-transform Rolldown/Vite plugins.

**Why it has to be this way:**

- `react-scripts`/CRA (which Craco wrapped) was deprecated years ago and was on a path to break outright with newer Node.js versions (see the React team's own "sunsetting Create React App" post, react.dev/blog/2025/02/14/sunsetting-create-react-app). Vite was adopted for better dev-server performance/speed and because it is the actively maintained option.
- `vite.config.ts` reuses the exact same `brekekephone/app/babel.config.js` (via a custom `brekeke-babel` transform plugin) so `src/` compiles identically for both platforms, and re-implements the same kind of native-module aliasing `.cracorc.js` used to do, but as explicit Vite `resolve.alias` entries (e.g. `react-native-callkeep`, `react-native-fs`, `react-native-incall-manager`, `react-native-splash-screen`, `react-native-background-timer`, `@react-native-documents/picker`, `react-native-notifications` -> `brekekephone/app/src/polyfill/null.ts`).
- `brekekephone/web/package.json` previously kept a leftover `"browserslist": "ie 10-11"` (and a CRA-era `"homepage": "./"` field, unused by Vite since `vite.config.ts` sets `base: './'` directly) from before the Vite migration; both have since been removed as dead config -- Vite/React 19's output never supported IE in the first place.
- The embed API (`window.Brekeke.Phone.render`, exposed via `brekekephone/app/src/embed/expose-embed-api.ts`) still lets a host pass account info, auto-login, device token, control audio devices, and listen to events -- this did not change in the migration.
- **Correction to an old rule:** an older note said "do not add Tailwind" as a project convention. That is now backwards -- Tailwind (via `rntwsc`/`twrnc`) is the _current, adopted_ styling approach; see [Styling and UI](./styling-and-ui.md). Do not block a PR for using Tailwind class names; do still avoid adding `react-router-dom`, `axios`, or React Hook Form/Formik/Zod unless the project's current conventions have changed on those specifically.

**Things to watch when changing this:**

- Changes to `brekekephone/app/babel.config.js`, `brekekephone/web/vite.config.ts`, `brekekephone/app/src/embed/*`, or routing/nav must be tested standalone on web (`pnpm start` in `brekekephone/web`) and in the embed example (`embed-example/react`).
- Vite's dependency optimizer (`optimizeDeps`) uses its own resolver, separate from the main `resolve.alias`/`resolve.extensions` -- some aliasing (like the `toast-android-stub` injection into `react-native-web`) has to be duplicated as a Rolldown plugin specifically because the optimizer bypasses the main alias list.
- The IE target has already been dropped (see above); if you're looking for it expecting to still need to remove it, it's gone.

Related files:

- `brekekephone/web/vite.config.ts`
- `brekekephone/web/embed-build.cjs`
- `brekekephone/app/src/embed/`
- `brekekephone/app/src/embed/expose-embed-api.ts`
- `embed-example/react/`
- `brekekephone/web/package.json`

## Custom-built navigation

**What looks a bit odd:** routes live in `stores/nav.ts` and a custom stacker `RnStacker`; the project does not use `react-navigation` or `react-router-dom`. This did not change in the 3.0.0 migration.

**Why it has to be this way:**

- The app needs to run on Web/RN together and sync with native actions/custom page/call UI.
- The custom stack controls specific flows: the call manage overlay, custom page, MFA modal, Android back button, PN-tap navigation. It also stays confined to the main app root -- the bridgeless incoming-call surface described in [Calling and telephony](./calling-and-telephony.md) deliberately does not mount its own nav stack, and instead calls back into the main root's navigation via `BrekekeUtils.openMainActivity`.

**Things to watch when changing this:**

- Adding a new page means creating a `page-xxx.tsx` and registering `ctx.nav.goToPageXxx()` in `nav.ts`.
- Do not pass a navigation object through props the way newer RN apps do; the current pattern is `ctx.nav`.
- Changing back-button behavior requires testing the Android hardware back button, the call screen (both the main root and the incoming-call surface), and modal alert/picker/keyboard.

Related files:

- `brekekephone/app/src/stores/nav.ts`
- `brekekephone/app/src/stores/rn-stacker.ts`
- `brekekephone/app/src/stores/rn-stacker-root.tsx`
