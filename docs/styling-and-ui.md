<!-- START doctoc -->

- [Styling and UI](#styling-and-ui)
  - [Tailwind class names via the rntwsc babel compiler, not RN `StyleSheet`](#tailwind-class-names-via-the-rntwsc-babel-compiler-not-rn-stylesheet)
  - [Why rntwsc instead of NativeWind or UniWind](#why-rntwsc-instead-of-nativewind-or-uniwind)
  - [Dark mode](#dark-mode)
  - [Orientation (portrait/landscape) support](#orientation-portraitlandscape-support)
  - [`react-native-reanimated` is present, but only transitively so far](#react-native-reanimated-is-present-but-only-transitively-so-far)
  - [Native incoming-call screen reuses the RN UI instead of duplicating it](#native-incoming-call-screen-reuses-the-rn-ui-instead-of-duplicating-it)

<!-- END doctoc -->

# Styling and UI

## Tailwind class names via the rntwsc babel compiler, not RN `StyleSheet`

Components use a `className` prop with Tailwind-style utility strings (`className="absolute inset-0"`) instead of a `StyleSheet.create({...})` object, even though this is React Native.

This is part of the 3.0.0 migration: the old `StyleSheet.create` + `style={css.myView}` pattern was converted to Tailwind class names, compiled by `rntwsc`'s Babel plugin (`twPlugin`, wired in `brekekephone/app/babel.config.js`) into the equivalent RN styles at build time. The goal was shorter, more readable UI code and to align with how most of the frontend community styles UI now. Example of the conversion, from the migration notes:

```jsx
// Before
const css = StyleSheet.create({
  myView: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
})
const App = () => <View style={css.myView} />

// After
const App = () => <View className='absolute inset-0' />
```

`twrnc` (the underlying RN-Tailwind engine) and `rntwsc/tw/twrnc-config` provide the base Tailwind theme; `brekekephone/app/src/twrnc-config.ts` extends it with a few app-specific tokens (e.g. `borderRadius.card/input/button`). Since `className` strings are stripped/compiled by Babel, they only work where the babel pipeline runs (app and the Vite web build both route through the same `babel.config.js`, see [Architecture and startup](./architecture-and-startup.md)). Anything that bypasses that pipeline (a raw script, a differently-configured bundler) will not understand `className`.

Do not build a dynamic/concatenated class name string at runtime and expect the Babel plugin to pick it up; like the `intl` tagged template (see [i18n](./i18n.md)), static-analysis-based extraction needs a literal string. New UI code should default to `className`, not reintroduce `StyleSheet.create`, unless there is a concrete reason (e.g. a value that must be computed at runtime and cannot be a static Tailwind class). `eslint-plugin-react`/`eslint-plugin-import` are patched (see [SDK and dependencies](./sdk-and-dependencies.md)) partly to support linting this pattern correctly; if you upgrade either, re-check the patch still applies.

Related files:

- `brekekephone/app/babel.config.js`
- `brekekephone/app/src/twrnc-config.ts`
- `brekekephone/app/tailwind.config.js`

## Why rntwsc instead of NativeWind or UniWind

At the time this was implemented, Brekeke Phone was still on the React Native Old Architecture, with Turbo Modules, Hermes, and Fabric all off. NativeWind and UniWind (the two more widely known Tailwind-for-React-Native libraries) were tried first, but both failed to build or were not supported in that configuration.

Since the same author already maintained `rntwsc`, an existing open source Babel transpiler (MIT licensed) that compiles Tailwind class names into React Native styles, it was brought into Brekeke Phone instead of blocking the Tailwind conversion on NativeWind/UniWind support. This is a devtools/build-time dependency, not something carrying app business logic, so the risk of adopting it was mostly limited to the styling layer itself.

3.0.0 later upgraded the app to New Architecture with Turbo Modules, Hermes, and Fabric all on (see [Architecture and startup](./architecture-and-startup.md)), which is the configuration NativeWind/UniWind actually expect. If `rntwsc` ever stops being the right fit, migrating to NativeWind or UniWind is a realistic option now, and should be a low-cost change: both use the same `className` convention as `rntwsc`, so component code would not need to be rewritten, mainly just the import paths and build config that wire the Tailwind compiler in.

## Dark mode

Dark mode support is threaded through `rntwsc/dark-mode`, composing an explicit user preference with the OS-level color scheme, rather than a single app-level boolean. Dark mode is a new feature added as part of the 3.0.0 UI work. `rntwsc/dark-mode/config` exposes `useDarkModeState`/`darkModeCompose`/`toClassNameDarkModeState`; `useDarkModeUser` (from `rntwsc/dark-mode/index.native`) holds the user's explicit choice (system/light/dark), and it is composed with `useColorScheme()` (the OS setting) so "follow system" and an explicit override both work through the same code path. Theme-dependent values (e.g. `getThemeVariables(theme, darkModeState.dark)`, called from `useThemeVariables()` in `brekekephone/app/src/utils/rn-core-hooks.ts`, not in `theme/brekeke.ts`, which only exports the static `ThemeConfig` object) read the composed dark state, not the raw OS value, so a user's explicit choice always wins over the OS setting.

Test both "follow system" and an explicit light/dark override, and test switching the OS setting while the app is foregrounded and backgrounded. Any place still holding a local `useColorScheme()` value directly (bypassing the composed dark-mode state) will not respect a user's explicit in-app override; prefer the composed hook.

Related files:

- `brekekephone/app/src/utils/rn-core-hooks.ts`
- `brekekephone/app/src/theme/brekeke.ts`

## Orientation (portrait/landscape) support

There is a dedicated `useOrientation` hook (`EOrientation.Portrait`/`EOrientation.Landscape`) used specifically by the call-manage page, rather than the app being locked to portrait everywhere. Landscape support for the call screen (particularly useful for video calls) is another new piece of 3.0.0 UI work. `useOrientation` (`brekekephone/app/src/utils/use-orientation.ts`) derives orientation from `Dimensions.get('window')` and listens for `Dimensions` change events, rather than relying on a native orientation API, because the web build only ever runs on mobile browsers too, where a wider-than-tall window is a real "rotation" in the same sense. `page-call-manage.tsx` and `call-videos-carousel.tsx` consume this to switch layout (e.g. rearranging video tiles) on rotation.

If you change the call screen layout, test both orientations, including rotating mid-call with an active video stream. This hook is deliberately not native-orientation-API-based; do not "simplify" it to a native-only orientation listener without checking the web case still works.

Related files:

- `brekekephone/app/src/utils/use-orientation.ts`
- `brekekephone/app/src/utils/with-orientation.tsx`
- `brekekephone/app/src/pages/page-call-manage.tsx`

## `react-native-reanimated` is present, but only transitively so far

`react-native-reanimated` (4.3.1) shows up in `pnpm-lock.yaml`, but no file in `src/` imports it directly. The intent behind pulling in Reanimated was to move animations onto the native UI thread instead of blocking the JS thread with the old `Animated` API, matching the New Architecture push described in [Architecture and startup](./architecture-and-startup.md). Currently it is pulled in as a peer dependency of `react-native-css-animations` (itself a dependency of `rntwsc`), which is what powers Tailwind's animated/transition utility classes (e.g. transition classes used by the dark-mode toggle). App code has not yet adopted Reanimated directly for bespoke animations.

If you add a new hand-written animation, prefer Reanimated over the old `Animated` API now that it is already in the dependency tree, to stay consistent with the direction of this migration. Since it is currently an indirect/transitive dependency, if you do start using it directly, add it as an explicit dependency of `brekekephone/app/package.json` rather than relying on hoisting.

Related files:

- `pnpm-lock.yaml`
- `brekekephone/app/babel.config.js` (Reanimated requires a Babel plugin once used directly; currently absent since there is no direct usage yet)

## Native incoming-call screen reuses the RN UI instead of duplicating it

See [Calling and telephony](./calling-and-telephony.md) for the full mechanism: the Android native incoming-call activity now mounts a Fabric `ReactSurface` (what the team refers to as reusing the RN screen as a native fragment) running the real `PageCallManage` component once a call is answered, instead of hand-maintaining a second, duplicated native call UI in Java/Kotlin. This was made possible by New Architecture/Fabric being enabled (see [Architecture and startup](./architecture-and-startup.md)) and directly reduces the "two UIs to keep in sync" maintenance burden that existed before 3.0.0.
