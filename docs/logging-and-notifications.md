<!-- START doctoc -->

- [Logging and user notifications](#logging-and-user-notifications)
  - [Log files, console capture, and the QA diagnostic path](#log-files-console-capture-and-the-qa-diagnostic-path)
  - [Toast, alert, suppressed errors, and the connection banner](#toast-alert-suppressed-errors-and-the-connection-banner)

<!-- END doctoc -->

# Logging and user notifications

## Log files, console capture, and the QA diagnostic path

**What looks a bit odd:** the app overrides `console.*`, writes logs to a file in the document directory, keeps at most 20 files x 300KB, and logs use fixed prefixes to make them greppable. The debug settings page is now split into two files.

**Why it has to be this way:**

- Real bugs happen on QA/customer devices with no debugger attached. The log file is the main data source for tracing them.
- By default only errors are captured; turning on `captureDebugLog` captures the full log.
- Fixed prefixes make it possible to grep by flow in a long log file.

**Prefix list, re-verified:** an earlier version of this note claimed `"UC debug:"` had been removed -- that claim was itself wrong and has been retracted: `"UC debug:"` is alive and heavily used in `auth-uc.ts`/`api/uc.ts`. The confirmed current set of fixed prefixes (not exhaustive -- there is no single registry of them, so treat this as "known to exist," not "the complete list") includes at least: `"SIP PN debug:"` (heaviest-used, in `auth-sip.ts`/`auth-store.ts`), `"UC debug:"` (`auth-uc.ts`/`api/uc.ts`), `"PN sync debug:"`, `"PN token debug:"`, `"PBX PN debug:"`, `"PBX guard debug:"`, `"signOut debug:"`, `"checkAndRemovePnTokenViaSip debug:"`, `"CallKeep debug:"`, `"pbxLoginFromAnotherPlace debug:"`, `"PN callkeep debug:"` (`call-store.ts`), `"CustomPage debug:"` (`auth-store.ts`'s custom-page event queue, see [Custom page](./custom-page.md)), `"Intl debug:"` (`intl-store.ts`), `"signIn debug:"` (`auth-store.ts`), `"Android debug:"` (`callkeep.ts`), and `"Permission debug"` (`permissions.ts`, note: no trailing colon, inconsistent with the others). If you are grepping logs or writing a new line to match an existing flow, search the codebase for the exact prefix rather than trusting any single list to be complete.

**A real bug this convention caught:** `page-chat-detail.tsx` and `page-chat-group-detail.tsx` had a UC-readiness guard (see [Contacts and chat](./contacts-and-chat.md)) logging under the `"CustomPage debug:"` prefix -- copy-pasted from unrelated code and left with the wrong prefix, which would have returned unrelated chat-UC log lines for anyone grepping `"CustomPage debug:"` to debug the actual custom-page event queue. Fixed to log under `"UC debug:"` instead, matching what the message is actually about.

**Things to watch when changing this:**

- Do not remove or rename these log prefixes, since bugs are traced using exactly these strings.
- `formatErrors` (in `capture-console-output.ts`) trims stack traces and drops some jssip/mobx warnings. If you add a filter, make sure it does not eat necessary log output.
- **Important, confirmed unchanged:** `capture-console-output.ts`'s `formatErrors()` still emits `sipErrorEmitter.emit('error', null)` when it sees the literal string `'JsSIP:Transport reconnection attempt'` in a log line. This means jssip's log text is used as a control signal for reconnect logic, not just for reading -- confirmed still consumed in `auth-sip.ts` (logs `"SIP PN debug: got error from sipErrorEmitter"`) and cleaned up via `sipErrorEmitter.removeAllListeners()` in `api/index.ts`. Changing how logging works or the filter can lose this signal.
- Logs must never contain a password or token.
- `debug-store.ts` also checks for a new version every 24 hours (`remoteVersion`, persisted to `RnAsyncStorage`, called from `init()` on app start), so do not fold that logic into the auth flow.
- The debug page is now two files: `page-settings-debug.tsx` (149 lines, main settings) and a new sibling `page-settings-debug-files.tsx` (45 lines, the log-files list UI split out separately) -- if you are adding a debug-page feature, check which of the two it belongs in.

Related files:

- `brekekephone/app/src/utils/capture-console-output.ts`
- `brekekephone/app/src/stores/debug-store.ts`
- `brekekephone/app/src/stores/sip-error-emitter.ts`
- `brekekephone/app/src/pages/page-settings-debug.tsx`
- `brekekephone/app/src/pages/page-settings-debug-files.tsx`

## Toast, alert, suppressed errors, and the connection banner

**What looks a bit odd:** there are three layers of error notification (`RnAlert`, `toastStore`, a banner derived from `getConnectionStatus`), and a toast is explicitly suppressed while the connection banner has something to show.

**Why it has to be this way:**

- The app retries a lot in the background. Showing every error would spam the user with toasts while the app is still recovering on its own.
- PBX returns some errors that are harmless during normal flow, so there is a default whitelist (confirmed still `['UserImplException', 'Invalid User Name']`, matched case-insensitively) and tenants can configure their own patterns via `webphone.error_toast.suppress_enabled`/`suppress_patterns`.
- The banner is the only place the user learns which service the app is connecting to, whether it is retrying, or that it has failed outright. Confirmed: `toastStore.show()` explicitly checks `getConnectionStatus().message` first and returns early (suppressing the toast) if the banner already has a message to show, so the two layers do not compete for the user's attention at the same time.

**Things to watch when changing this:**

- Errors from PBX should go through `suppress-err.ts` instead of being shown directly.
- Renaming or changing the logic of `pbxState`/`sipState`/`ucState` affects the banner: it can easily end up showing the wrong service or not turning off automatically.
- `pbxLoginFromAnotherPlace`/`showMsgPbxLoginFromAnotherPlace` and `ucLoginFromAnotherPlace` are special cases, not a network loss, and have their own dedicated messages ("Logged in from another location...", "UC signed in from another location") in `get-connection-status.ts`, plus handling in `api/pbx.ts`'s `onUserLoginOtherDevices` and in `add-call-history.ts`.
- Use an alert for errors the user must act on; use a toast or banner for transient errors.

Related files:

- `brekekephone/app/src/stores/rn-alert.ts`
- `brekekephone/app/src/stores/rn-alert-root.tsx`
- `brekekephone/app/src/stores/toast-store.ts`
- `brekekephone/app/src/api/suppress-err.ts`
- `brekekephone/app/src/utils/get-connection-status.ts`
