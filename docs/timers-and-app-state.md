<!-- START doctoc -->

- [Timers and app state](#timers-and-app-state)
  - [Timers, app state, and background](#timers-app-state-and-background)

<!-- END doctoc -->

# Timers and app state

## Timers, app state, and background

The code uses `BackgroundTimer` instead of `setTimeout`, there is a `timerStore` that ticks every second for the whole app, and time-dependent logic gates itself on app state through a small set of dedicated helpers, including a `DelayFlag` class.

JS timers on native can be throttled or stop running while the app is in background, but auth/PN/call-timeout retries still need to run. `BackgroundTimer` maps to `window` timers on web (`isWeb ? window : BgTimer`, using `react-native-background-timer` on device). Call duration needs a continuous tick; one shared `timerStore` (now a `makeAutoObservable` MobX 6 class, ticking via `BackgroundTimer.setInterval(this.updateNow, 1000)` in its constructor) is cheaper than every component creating its own interval. `RnAppState` exposes `currentState`/`foregroundOnce` as observables updated via `AppState.addEventListener('change', ...)`. `waitForActiveAppState()` resolves immediately if the app is already active, otherwise waits for the next `'active'` event or times out after 1 second via `BackgroundTimer`. `DelayFlag` (a newer, standalone file not called out in older notes) debounces a boolean flag using `BackgroundTimer.setTimeout`/`clearTimeout`. Its delay is not configurable per instance/call: `setEnabled` takes no timeout parameter, it's hardcoded to the module-level `defaultTimeout` (500ms, imported from `@/config`). Used in at least `page-contact-users.tsx`.

New timeout/interval code in a store/API should use `BackgroundTimer` and keep the id as a `number`. Logic that depends on time must account for background state: `RnAppState`, `waitForActiveAppState`, and `DelayFlag` exist for this reason. Do not create a separate interval per list item; use `timerStore`.

Related files:

- `brekekephone/app/src/utils/background-timer.ts`
- `brekekephone/app/src/stores/timer-store.tsx`
- `brekekephone/app/src/stores/rn-app-state.ts`
- `brekekephone/app/src/utils/wait-for-active-app-state.ts`
- `brekekephone/app/src/utils/delay-flag.ts`
