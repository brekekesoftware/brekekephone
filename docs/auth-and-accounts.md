<!-- START doctoc -->

- [Auth and accounts](#auth-and-accounts)
  - [Auth is three state machines: PBX, SIP, UC](#auth-is-three-state-machines-pbx-sip-uc)
  - [Multi-account and teardown order when switching accounts](#multi-account-and-teardown-order-when-switching-accounts)
  - [The account model and `_api_profiles` persistence](#the-account-model-and-_api_profiles-persistence)

<!-- END doctoc -->

# Auth and accounts

## Auth is three state machines: PBX, SIP, UC

**What looks a bit odd:** there are `AuthPBX`, `AuthSIP`, `AuthUC`; `authStore` holds `pbxState`, `sipState`, `ucState`, `xxxTotalFailure`.

**Why it has to be this way:**

- PBX/PAL is used to log in and fetch config, tokens, contacts, voicemail, and PBX status.
- SIP/WebRTC registers the phone and handles call media.
- UC is used for chat/presence, and only runs when the account has `ucEnabled` (`ucShouldAuth` is gated on `this.getCurrentAccount()?.ucEnabled`).
- An incoming call from a PN can already carry SIP credentials (`sipPn`/`sipAuth`), so `AuthSIP.authPnWithoutCatch(pn)` has a fast path that consumes them directly instead of going through the normal token-issuance flow.

**Things to watch when changing this:**

- `pbxShouldAuth`, `sipShouldAuth`, `ucShouldAuth` are important invariants, each wired through a MobX `reaction(..., authWithCheckDebounced)` in `auth-pbx.ts`/`auth-sip.ts`/`auth-uc.ts`. Do not change their conditions unless you have tested PN cold-start/background. Note `pbxShouldAuth` has a background carve-out: PBX will still re-auth while the app is backgrounded if there is an active call (`ctx.call.calls.length` and `sipState === 'success'`).
- The SIP PN token expires after 90 seconds (`isSipPnExpired = pn => !pn.sipAuthAt || Date.now() - pn.sipAuthAt > 90000`); after more than 3 SIP failures, `sipPn` is cleared to force fetching new credentials (duplicated in both `auth-sip.ts` and `api/index.ts`'s `onSIPConnectionStopped`).
- Retries have backoff and depend on app state. Do not turn this into a simple loop.
- `ctx.uc` is a shared, true singleton client. The old orphaned-sign-in-promise risk here is now mitigated (`BUG-1256`, merged from the `2.17.21` hotfix): `UC.connect()` tracks `rejectPendingConnect`, and both `disconnect()` and a new `connect()` call reject any still-pending sign-in promise first (`settlePendingConnect()`) before proceeding, instead of letting `ucclient.signOut()`/a superseded sign-in leave it dangling. `disconnect()` also has a `skipLogoutIfRpcNotOpen()` guard (mutes the outgoing `Logout` send when the underlying socket is not open, since `WebSocket.send()` throwing mid-teardown used to leave the client wedged) and a `forceSignedOut()` last resort if `signOut()` still throws. `AuthUC` layers a 45-second watchdog on top (`ucConnectingTimeoutMs`, armed via a `reaction` on `ucState === 'connecting'`) that forces failure+retry if `ucState` is ever stuck past it, plus a `clearStaleConnecting()` check (keyed by `connectingAccountId`) that resets a stale `'connecting'` left by a previous account before a new sign-in starts. Treat the promise-rejection fix as the real fix and the watchdog as the safety net behind it, not the other way around.
- `AuthUC.auth()` registers its own `connection-stopped` listener in addition to the global one in `api/index.ts`'s `onUCConnectionStopped` -- two listeners exist on the same event; if you add a third, make sure they do not double-fire cleanup.
- Several fixes here are pinned to a documented incident: look for inline `BUG-1207` (concurrent `signInByNotification` racing PBX into a stuck "connecting" state, guarded by `isSigningInByNotification`), `BUG-1238` (redundant same-host probe on account switch, mitigated by `ctx.pbx.skipProbeOnce`), and `BUG-1256` (UC stuck at "Connecting to UC" after a fast account switch, see above) comments before changing nearby code.

Related files:

- `brekekephone/app/src/stores/auth-store.ts`
- `brekekephone/app/src/stores/auth-pbx.ts`
- `brekekephone/app/src/stores/auth-sip.ts`
- `brekekephone/app/src/stores/auth-uc.ts`
- `brekekephone/app/src/api/pbx.ts`
- `brekekephone/app/src/api/sip.ts`
- `brekekephone/app/src/api/uc.ts`
- `brekekephone/app/src/api/index.ts`

## Multi-account and teardown order when switching accounts

**What looks a bit odd:** `resetPrevAccountConnection()` exists as a private method on `authStore`; some code calls `ctx.authSIP.dispose()` by hand; there is an `isSigningInByNotification` guard; the PN-triggered sign-in path deliberately skips most of the normal teardown.

**Why it has to be this way:**

- `ctx.pbx`, `ctx.sip`, `ctx.uc` are shared instances used for every account, not one client per account.
- Auth runs through MobX reactions on `pbxShouldAuth`/`sipShouldAuth`/`ucShouldAuth`. If `signedInId` is not cleared before runtime state changes, a reaction may reconnect the old account while the app has already switched to the new one.
- `signIn()` does not clear `signedInId` as its very first statement -- it validates credentials and computes `prevAccountId` first, then conditionally calls `resetPrevAccountConnection()` (which does the actual `signedInId` clear, resets `pbxState`/`sipState`/`ucState` to `'stopped'`, clears `sipPn`/`pbxConfig`/`ucConfig`, and calls `ctx.pbx.disconnect()`/`ctx.sip.stopWebRTC()`/`ctx.uc.disconnect()`) only `if (this.signedInId && this.signedInId !== a.id)`.

**Things to watch when changing this:**

- `signInByNotification` clears `this.signedInId = ''` itself _before_ calling `signIn(acc)`. That means the `this.signedInId && this.signedInId !== a.id` check inside `signIn()` is always false on this path, so `resetPrevAccountConnection()` never runs at all here -- not "skips some of its steps", it is not invoked. The only teardown that happens on this path is a manual `ctx.authSIP.dispose()` (with an inline comment explaining it prevents the `sipShouldAuth` reaction from firing mid-switch), `resetFailureState()`, the MFA-specific cleanup described in [MFA](./mfa.md) (via the `prevAccountId = this.signedInId || ctx.mfa.accountId` fallback), and -- since the `BUG-1257` fix merged from `2.17.21` -- an explicit `this.resetCustomPageRuntime()` call right before the `signedInId` clear (see [Custom page](./custom-page.md); without it, the previous account's built custom-page URLs/`activeCustomPageId`/pending events used to leak into the new account). PBX/SIP disconnects and `ucConfig` state are still not proactively reset on this path; they rely on the normal auth reactions eventually converging, and on UC's own now-mitigated hang handling (see below).
- UC used to be the most likely place to hang here (connecting anew while the old session had not torn down yet orphaned the old sign-in promise and left `ucState` stuck at `connecting`); this is now mitigated per the UC section above (`BUG-1256`). It is still the most complex of the three to reason about, so test it specifically on any change to this path.
- Timeouts/watchdogs should only be a safety net. If recovery only happens after the watchdog times out, the teardown bug is still there.
- Test: switching between two accounts quickly, switching while a service is `connecting`, tapping a PN for account B while on account A, switching while a call is active.

Related files:

- `brekekephone/app/src/stores/auth-store.ts`
- `brekekephone/app/src/stores/auth-pbx.ts`
- `brekekephone/app/src/stores/auth-sip.ts`
- `brekekephone/app/src/stores/auth-uc.ts`
- `brekekephone/app/src/api/uc.ts`
- `brekekephone/app/src/stores/account-store.ts`

## The account model and `_api_profiles` persistence

**What looks a bit odd:** every account lives in a single AsyncStorage key `_api_profiles` shaped `{ profiles, profileData, ringtonePicker }`; `Account` and `AccountData` are two different types; `lastSignedInId` is stored under its own separate key with a richer shape than just an id.

**Why it has to be this way:**

- `Account` (`account-store.ts`) is what the user enters (id, tenant, username, host/port, ...). `AccountData` is per-account state (parks, navIndex, recent calls, ringtone, `phoneappliEnabled`, ...), joined with `Account` via `id` through `getAccountUniqueId()`.
- A record missing `id` or `pbxUsername` is filtered out on both load and save, and logged as an error, since many places index by these two fields.
- Saves are debounced 100ms (`maxWait` 1000ms, unchanged from before the migration) because both UI and PBX events update account data very frequently.
- Persistence is still `@react-native-async-storage/async-storage` (pinned `2.2.0`); no migration to MMKV or another storage engine happened as part of 3.0.0.

**Things to watch when changing this:**

- A new field must tolerate old data that does not have it; do not assume a default is always present.
- Renaming or reformatting the persisted key is a migration for existing users, not a silent change.
- Do not re-sort or re-filter `accounts`; that order is exactly the order the user sees on the sign-in screen.
- Deleting an account must also delete its `AccountData` and any registered PN token, not just remove it from `profiles`.
- `recentCalls` is capped by `recentCallsMax` (default 200, clamped to a max of 1000) and lives in the same persisted key, so writing recents frequently also rewrites the entire account data blob.
- `lastSignedInId` is no longer just an id: it is `{ id, at, version, logoutPressed?, uptime?, autoSignInBrekekePhone? }`, used to decide whether to auto-resume sign-in based on whether the app process stayed alive continuously (`uptime` comparison). If you touch auto-login, account for this richer shape, not a bare string.
- `updateAccountData()` caps the in-memory/persisted `accountData` array at 20 entries (oldest dropped first) -- an LRU-style cap on how many accounts' runtime data is retained, independent of how many `Account` entries (sign-in profiles) exist.
- Android's LPC foreground-service consent prompt (`foregroundPromptShown`/`promptForegroundService`) is now wired into account add/remove (`upsertAccount`/`removeAccount`, gated by `isFgsEligible`) -- removing or refactoring account lifecycle hooks can silently break when that prompt is shown.

Related files:

- `brekekephone/app/src/stores/account-store.ts`
- `brekekephone/app/src/stores/auth-store.ts`
