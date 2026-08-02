<!-- START doctoc -->

- [Contacts and chat](#contacts-and-chat)
  - [Contacts have several sources: phonebook, PBX users, buddy list, PhoneAppli](#contacts-have-several-sources-phonebook-pbx-users-buddy-list-phoneappli)
  - [Chat/UC: in-memory state, webchat, and files](#chatuc-in-memory-state-webchat-and-files)

<!-- END doctoc -->

# Contacts and chat

## Contacts have several sources: phonebook, PBX users, buddy list, PhoneAppli

**What looks a bit odd:** there is a `contact-store.ts` (phonebook + `pbxUsers`) and a `user-store.ts` (buddy list, presence), plus a separate PhoneAppli branch.

**Why it has to be this way:**

- The phonebook is fetched from PBX page by page (`numberOfContactsPerPage=20`, `offset`) and by `search_text` (`phonebookSearchTerm`), not loaded all at once.
- `pbxUsers`/buddy list is the extension list, presence comes from UC. `buddy_mode`/`buddy_max` from config decide whether the display is by group or user-selected: the PBX path (`loadPbxBuddyList`) hardcodes `buddyMode=2` and reads `buddyMax` from `webphone.users.max`, while the UC path (`loadUcBuddyList`) reads `buddyMax` from UC's `configProperties.optional_config.buddy_max` but `buddyMode` from the top-level `configProperties.buddy_mode` (not nested under `optional_config` -- the two fields live at different levels of the same object, easy to get wrong if you're adding a third field to this config).
- PhoneAppli is a third-party contacts system, enabled per extension property (`api/update-phone-index.ts`'s `handlePhoneAppli()` sets `d.phoneappliEnabled = extProps.phoneappli`); when enabled, the contacts UI and recents follow PhoneAppli instead (`navigation-config.ts` redirects the relevant tabs to `urls.phoneappli.USERS`/`HISTORY_CALLED`).

**Things to watch when changing this:**

- The display name for a call/chat is resolved with a different priority order (call prefers the phonebook name, chat/user prefers the PBX name). Changing this resolver affects recents, notifications, and the CallKit display name all at once.
- When PhoneAppli is enabled, `add-call-history.ts` explicitly returns before `ctx.auth.pushRecentCall(info)` (`if (ctx.auth.phoneappliEnabled()) { return }`), so it does not save local recents. "Recents missing" for that tenant can be by design, not a bug.
- Presence depends on UC, so an account with UC disabled must show a sensible state, not "everyone offline".
- The buddy list has a `buddyMax` limit sourced differently depending on whether it came from the PBX or UC path (see above); the user-selection UI must enforce it regardless of source.

Related files:

- `brekekephone/app/src/stores/contact-store.ts`
- `brekekephone/app/src/stores/user-store.ts`
- `brekekephone/app/src/api/update-phone-index.ts`

## Chat/UC: in-memory state, webchat, and files

**What looks a bit odd:** `chat-store.ts` holds messages by thread, group, a file map, and unread counts, but persists nothing to storage.

**Why it has to be this way:**

- UC is the source of truth for chat. After reconnecting, everything is reloaded from UC (`auth-uc.ts`'s `loadUnreadChats()` -> `ctx.uc.getUnreadChats()` -> `ctx.chat.pushMessages(...)`), so there is no need for long-lived caching. `clearStore()` wipes all in-memory chat state and is called on the relevant lifecycle events.
- A group can be either a regular group chat or a webchat conference with its own status (invited/joined), so one `ChatGroup` entity carries an optional `webchat?: Conference` and is checked against `Constants.CONF_STATUS_INVITED_WEBCHAT`/`CONF_STATUS_JOINED`/`CONF_STATUS_INVITED`/`CONF_STATUS_INACTIVE`.
- File upload/download needs progress reporting, hence a separate `filesMap` where each `ChatFile` tracks its own `transferPercent`, updated incrementally.
- Chat also creates local notifications and a ding sound on web, so it must dedupe against chat PNs: `suppressNextLocalNotification`/`consumeSuppressedLocalNotification` in `chat-store.ts` explicitly suppress the duplicate local notification for a chat message the user just opened from a remote (FCM/LPC) or local notification, with a 60-second TTL, referencing the `BUG-1238` fix.

**Things to watch when changing this:**

- Sign-out, switch account, or a web reload all wipe the chat state (confirmed: no `AsyncStorage` calls anywhere in `chat-store.ts`). Do not use that state as a long-term source for unread counts.
- Calling a chat API while UC is not ready yet is normal (UC connects after PBX, or the account has UC disabled). Do not show a technical error to the user in that case: `page-chat-detail.tsx`/`page-chat-group-detail.tsx` explicitly guard their `getBuddyChats`/`getGroupChats` failure handlers with `if (ctx.auth.ucState !== 'success') { return }` before showing an `RnAlert.error`, specifically because a multi-account switch surfaces a transient "Not signed-in" rejection here while UC is still reconnecting (`BUG-1256`, merged from the `2.17.21` hotfix). If you add a new chat API call site, apply the same guard rather than alerting on every rejection.
- Chat notifications have their own dedupe with a real TTL; removing it creates double notifications when both a PN and a UC event arrive for the same message.
- Changes to chat must be tested against the webchat branch too, since it goes through the same `groups` array and the same conference status constants.

Related files:

- `brekekephone/app/src/stores/chat-store.ts`
- `brekekephone/app/src/api/uc.ts`
- `brekekephone/app/src/pages/page-chat-detail.tsx`
- `brekekephone/app/src/pages/page-chat-group-detail.tsx`
- `brekekephone/app/src/pages/page-web-chat.tsx`
