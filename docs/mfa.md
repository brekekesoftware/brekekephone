<!-- START doctoc -->

- [MFA](#mfa)
  - [MFA is not just one OTP screen](#mfa-is-not-just-one-otp-screen)

<!-- END doctoc -->

# MFA

## MFA is not just one OTP screen

MFA logic is spread across `mfa-store.ts`, `account-store.ts`, `pbx.ts`, `auth-store.ts`, `call-store.ts`, `push-notification-parse.ts`, `sync-pn-token.ts`, and the embed API, and interacts with active calls, crash recovery, and push-notification toggling.

MFA runs while PAL is already connected but limited to a whitelisted set of methods. The actual whitelist (`api/pbx.ts`'s `mfaAllowedMethods`) is `['mfa/start', 'mfa/check', 'mfa/delete', 'device_token/create', 'device_token/check', 'device_token/delete', 'getProductInfo', 'ping']`, the slash-form PAL method names, not the camelCase JS wrapper function names (`mfaStart`/`mfaCheck`/etc.) that call them, and it also includes `getProductInfo`/`ping` alongside the MFA/device-token methods.

After a successful OTP, the app creates a `device_token` and reconnects PAL with that token (`reconnectWithDeviceToken()`: `ctx.authPBX.dispose(); ctx.auth.pbxTotalFailure = 0; ctx.authPBX.auth()`) so future logins can skip OTP. The MFA check shares PBX/PAL context rather than being one clean, independent flow: the main login check runs on `ctx.pbx`, while PN sync uses a temporary `PBX` instance (`sync-pn-token.ts`: `const pbx = new PBX(); pbx.isMainInstance = false`) whose own PAL client is temporarily attached to `ctx.mfa.palClient` inside `api/pbx.ts`'s `runPnSyncMfaPrompt(a, palClient)`, and cleared again in a `finally` block.

`getMfaPalClient()` in `account-store.ts` (used by `mfaStart`, `mfaCheck`, `mfaDelete`, `createMFADeviceToken`, `checkMFADeviceToken`, `deleteMFADeviceToken`) prefers `ctx.mfa.palClient` when its `accountKey` matches the current account, and falls back to `ctx.pbx.client` otherwise. This exact fallback still exists, unchanged in shape from before the migration:

```ts
private getMfaPalClient = (ca: AccountUnique): Pbx | undefined => {
  const palClient = ctx.mfa.palClient
  return palClient?.accountKey === getAccountUniqueId(ca)
    ? palClient.client
    : ctx.pbx.client
}
```

If a call is in progress, MFA defers automatically: `mfaPendingAfterCallsId` marks a pending OTP prompt while `ctx.call.calls.length > 0`, and it is resumed once calls end. `page2-step-verification.tsx` also has UI-level logic (`autorun`, referenced by an inline `TC-14` comment) that detects an incoming call while the OTP modal is open and defers there too. If the app is killed mid-OTP, a `keySessionMFA` value persisted per-account is used to detect and clean up the stale session server-side on the next `handleMFA()` run, rather than silently reusing a dead session key. Embed/Operator Console has its own flow: the host can show its own OTP UI (`getMfaState`/`verifyMfaCode`/`resendMfaCode`/`cancelMfa` on the embed API) or inject a device token directly (`setDeviceToken`, which can trigger an auto sign-in if the account is not currently signed in).

Do not call a PAL method outside the whitelist while MFA is in progress. Do not let PN sync or background/foreground handling send an OTP automatically if the user did not trigger it. Do not change `getMfaPalClient()` to always use `ctx.pbx.client`: PN sync OTP must go through the PAL client of the temporary `PBX` instance that just logged in. If you touch `ctx.mfa.palClient`, scope it by `accountKey` and clear it in every exit path; confirmed clear sites now include `finally`, `hide`, `cancel()`, `reset()`, `complete()`, and `signOutReset()` (more sites than before, so check all of them if you add a new one).

`cancel()`, `reset()`, and `signOutReset()` are three distinct functions with different semantics, not two. `cancel()` sets `wasCancelled = true` plus `cancelledAccountId` (suppresses a follow-up auto `mfaStart` from `syncPnTokenForAllAccounts`). `reset()` explicitly does not set `wasCancelled` (there is a comment calling this out). `signOutReset()` is called specifically from `authStore.resetState()` on sign-out and preserves `wasCancelled`/`cancelledAccountId` rather than clearing them. Do not collapse these into one function.

If you change embed MFA, do not access internal MobX state from the host; use the public event/API. If you add `setDeviceToken`/token injection, handle the fresh-login branch so it does not trigger an unnecessary OTP: there is already a one-shot embed-only flag (`skipFreshLoginMFAWithDeviceTokenAccountId`) for exactly this case, so reuse it rather than adding a second mechanism. Push notification enable/disable now has a two-phase "toggle now, confirm after MFA" pattern (`disableUnsyncedPushNotification()`, `pendingPnAccountId`/`pendingPnEnabled` in `account-store.ts`, `runPnSyncMfaPrompt` in `api/pbx.ts`). If you change PN toggle UI, make sure it still reflects the pending state correctly while an MFA prompt from that toggle is outstanding.

Related files:

- `brekekephone/app/src/stores/mfa-store.ts`
- `brekekephone/app/src/stores/account-store.ts`
- `brekekephone/app/src/pages/page2-step-verification.tsx`
- `brekekephone/app/src/api/pbx.ts`
- `brekekephone/app/src/api/sync-pn-token.ts`
- `brekekephone/app/src/embed/embed-api.ts`
- `brekekephone/app/src/utils/mfa-utils.ts`
