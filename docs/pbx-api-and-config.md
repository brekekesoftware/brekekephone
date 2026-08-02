<!-- START doctoc -->

- [PBX API and config-driven behavior](#pbx-api-and-config-driven-behavior)
  - [A lot of behavior is decided by PBX config](#a-lot-of-behavior-is-decided-by-pbx-config)
  - [The PAL client is not a thin RPC wrapper: it retries, queues, probes, and gates on MFA](#the-pal-client-is-not-a-thin-rpc-wrapper-it-retries-queues-probes-and-gates-on-mfa)

<!-- END doctoc -->

# PBX API and config-driven behavior

## A lot of behavior is decided by PBX config

**What looks a bit odd:** code across the codebase reads `ctx.auth.pbxConfig?.['webphone.xxx']` to turn features on/off.

**Why it has to be this way:**

- The same build runs against many PBX versions and many tenants, so features are toggled from the server. Confirmed current keys in active use: `webphone.lpc.port`/`keyhash`/`wifi`/`pn` (LPC, `api/sync-pn-token.ts`), `webphone.resource-line`/`resource-line.pattern` (`api/pbx.ts`, `stores/call-store.ts`), `webphone.users.max` (buddy list, `stores/user-store.ts`), `webphone.error_toast.suppress_*` (`api/suppress-err.ts`), `webphone.custompage1-4` (`api/pbx.ts`), `webphone.call.ringtone` (`api/pbx.ts`), `webphone.useragent`/`webphone.http.useragent.product` (SIP UA override, `stores/auth-store.ts`), and `webphone.pal.mfa` (`utils/mfa-utils.ts`).
- Config is only available after PBX login, so code that runs before that should not assume config exists.

**Things to watch when changing this:**

- A bug that "only happens for customer X" is often a config issue. Get the `getProductInfo`/config for that tenant before changing code.
- A new config key must pick a safe default for older PBX that does not have the key yet. See `suppress-err.ts`: an unset/`undefined` enabled-flag falls back to enabled-by-default with hardcoded patterns, but an explicit string `'false'` disables suppression entirely -- `undefined` and explicit `'false'` are deliberately handled differently, not the same as "falsy".
- `pnmanage.user_agent` in `api/pbx.ts`'s `pnmanage()` always uses `ctx.auth.getUserAgentRaw()`, bypassing the actual SIP UA override chain (`ctx.auth.getUserAgent()`: embed-config override -> per-account stored UA -> raw fallback). Do not "unify" these two; PN registration and SIP UA are intentionally allowed to diverge here.
- An invalid or malformed config should log a warning and fall back, not crash or disable the feature entirely, unless it is a security issue (like `lpc.keyhash`).

Related files:

- `brekekephone/app/src/api/pbx.ts`
- `brekekephone/app/src/stores/auth-store.ts`
- `brekekephone/app/src/api/suppress-err.ts`
- `brekekephone/app/src/utils/resource-line.ts`

## The PAL client is not a thin RPC wrapper: it retries, queues, probes, and gates on MFA

**What looks a bit odd:** `api/pbx.ts` is large and does more than "call a PAL method and return the result" -- it has its own request retry/queue system, a pre-login server probe on Android, and gates which PAL methods are allowed while MFA is pending.

**Why it has to be this way:**

- PBX/PAL calls happen over a connection that can drop or be mid-reconnect at any time (background app, flaky network, account switch). A naive fire-and-forget RPC call would silently lose requests or apply them against the wrong session.
- `pendingRequests`/`requests`/`MAX_RETRY`/`palRequestWithRetry`/`retryRequests` implement a bounded retry queue so a PAL call issued right before/during a reconnect is not simply dropped.
- `probeServer`/`skipProbeOnce` implement an Android-only pre-login probe of the same host, to detect (and skip redundant reconnect work for) the common case of switching between two accounts on the same PBX host -- this is the mechanism behind the `BUG-1238` fix referenced in [Auth and accounts](./auth-and-accounts.md).
- `mfaAllowedMethods` gates which PAL calls are permitted while an MFA challenge is outstanding, which is what [MFA](./mfa.md)'s "do not call a PAL method outside the whitelist while MFA is in progress" rule is actually enforced by in code.

**Things to watch when changing this:**

- If you add a new PAL call site, decide deliberately whether it should go through the retry queue or fail fast; do not assume all PAL calls behave the same way.
- If you are debugging a PAL call that seems to silently do nothing after a reconnect, check `pendingRequests`/`MAX_RETRY` before assuming the call was never issued.
- `skipProbeOnce` exists specifically to avoid a redundant probe on same-host account switch; do not remove it without understanding the `BUG-1238` scenario it fixes.
- If you add a new MFA-sensitive PAL method, add it to `mfaAllowedMethods` deliberately rather than widening the whitelist by accident.

Related files:

- `brekekephone/app/src/api/pbx.ts`
- `brekekephone/app/src/stores/auth-store.ts`
- `brekekephone/app/src/utils/mfa-utils.ts`
