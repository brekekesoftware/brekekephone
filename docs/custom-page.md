<!-- START doctoc -->

- [Custom page](#custom-page)
  - [Custom page and incoming/missed calls now go through a durable event queue](#custom-page-and-incomingmissed-calls-now-go-through-a-durable-event-queue)

<!-- END doctoc -->

# Custom page

> Updated after merging the `2.17.21` hotfix (`BUG-1253`/`1254`/`1256`/`1257`) from `master` into this branch: custom page incoming/missed-call handling was substantially rewritten. If you read an earlier version of this note, the "there is no event queue" correction below is now reversed -- a real event queue exists.

## Custom page and incoming/missed calls now go through a durable event queue

A custom page is not just a WebView. There is a URL builder, a PBX token, the deeplink `brekekephone://custompage?id=N`, and a small event-queue system in `auth-store.ts` (`pendingCustomPageEvents`, `completedCustomPageEvents`, `customPageBuildPromises`) driving incoming/open logic.

PBX configures up to custompage1-4 via config keys starting with `webphone.custompage` (parsed in `api/pbx.ts`); `auth-store.ts` builds an `internalId` of the form `webphone.custompage${pageIndex}` for pages 1-4. The URL has placeholders such as the PBX token and from/to number, which must be built after PBX login; `ensureCustomPageUrlBuilt(pageId)` builds it lazily and caches the in-flight promise in `customPageBuildPromises` so concurrent callers don't trigger duplicate builds. A custom page with `incoming=open` (read from `${id}.incoming` config in `api/pbx.ts`) needs to load/open itself automatically on an incoming call, including a missed call, and needs to survive the call arriving through very different paths: a normal SIP event, an iOS CallKit call that never reaches JS before being missed, or a killed-app cold start.

The event queue (`queueIncomingCustomPageEvent(eventId, accountId)` in `auth-store.ts`) exists specifically to make that survive real-world timing. It is called from four independent call sites, one in `call-store.ts` and three in `push-notification-parse.ts`: `call-store.ts`'s `onCallUpsert` when a new unanswered incoming call appears (keyed by `c.pnId || c.id`); `push-notification-parse.ts`'s CallKit-missed-call handling, iOS-only, keyed by the PN's `n.id`, with the account resolved via `ctx.account.findByPn(n)` because `signInByNotification` (which sets `signedInId`) has not necessarily run yet; `push-notification-parse.ts` again for a live PN (`n.isCall`); and `push-notification-parse.ts` a third time for a killed-app cold-start tap on a missed-call notification (`BUG-1257`: a queued event from the brief PN wake dies with the process, so the cold-start tap re-queues by the notification id). Each event is deduped by a `key` of `${accountId}:${eventId}`, and expired/completed events are pruned (`pendingCustomPageEventExpirationTime` = 5 minutes, `completedCustomPageEventDedupeTime` = 60 seconds) so the queue cannot grow unbounded or replay a very old event.

`processPendingCustomPageEvents()` is the consumer: for each pending event, it walks every `incoming=open` page (`getIncomingCustomPages()`), ensures each page's URL is built, rebuilds the nonce if it was already built before (to force a fresh load), and only navigates (`navigateForCustomPageEvent`, via `ctx.nav.goToPageCustomPage`) once all pages for that event are ready. It is re-entrant-safe (`processingCustomPageEvents` guard) and self-scheduling (`customPageProcessRequested` re-arms a `BackgroundTimer.setTimeout` call if new events arrived while it was already running). It is triggered from `queueIncomingCustomPageEvent` itself, from `api/index.ts`'s `onPBXConnectionStarted`, and from `app.tsx`'s foreground/init paths, i.e. every place PBX state might have just become usable. The deeplink is matched in `deeplink-parse.ts`, which special-cases `location.hostname === 'custompage'` and maps its `?id=` query param to `customPageId`.

The account-switch bug this fixes (`BUG-1257`): the PN-driven account switch (`signInByNotification`, see [Auth and accounts](./auth-and-accounts.md)) clears `signedInId` itself before calling `signIn()`, which means `signIn()`'s `resetPrevAccountConnection()` guard never fires on that path. Before this fix, that let the previous account's custom-page runtime (built page URLs, `activeCustomPageId`, in-flight events) leak into the newly-switched-to account and show the wrong custom page. The fix is `resetCustomPageRuntime()`, called explicitly right before `signedInId` is cleared in `signInByNotification`, plus from the two normal teardown spots (`resetPrevAccountConnection`, `resetState`). It bumps `customPageRuntimeVersion` and wipes `listCustomPage`/`activeCustomPageId`/both event arrays/`customPageBuildPromises`, and every async custom-page function (`buildCustomPageUrl`, `ensureCustomPageUrlBuilt`, `reloadCustomPageWithNewToken`) re-checks `signedInId`/`customPageRuntimeVersion` after each `await` and bails out if either changed underneath it.

Do not assume incoming custom page only reacts to a normal call event; the CallKit/missed-notification/killed-app-cold-start paths each queue independently and are all load-bearing, so removing one reintroduces a specific, previously-shipped regression. The event queue is in-memory only (not persisted), so a queued event genuinely dies if the process dies before `processPendingCustomPageEvents` runs; that is why the cold-start tap path re-queues instead of relying on the original queue entry surviving. `getCustomPageById`/`updateCustomPage`/`setCustomPages` are the only sanctioned ways to read/write `listCustomPage`; do not mutate the array in place, since `updateCustomPage` deliberately replaces via `.map()` for MobX change detection. The old `ctx.auth.saveActionOpenCustomPage` and `ctx.auth.customPageLoadings` fields are gone; if you find old branch/PR notes referencing them, they describe the pre-`2.17.21`/pre-merge implementation, so use the event-queue functions instead. `page-custom-page-view.tsx` and `page-custom-page.tsx` are now thin: they read `ctx.auth.getCustomPageById(id)`/`activeCustomPageId` reactively and call `ensureCustomPageUrlBuilt`/`reloadCustomPageWithNewToken`, but do not themselves detect incoming calls anymore, all of that detection now lives centrally in `auth-store.ts`/`call-store.ts`/`push-notification-parse.ts`. The deeplink for a custom page does not carry account info, so it should always open the custom page of the signed-in account, or the account that can auto-login. `clearUrlParams` and an "already handled" guard matter so the app does not navigate/call again when it resumes.

Related files:

- `brekekephone/app/src/api/custom-page.ts`
- `brekekephone/app/src/stores/auth-store.ts`
- `brekekephone/app/src/stores/call-store.ts`
- `brekekephone/app/src/utils/push-notification-parse.ts`
- `brekekephone/app/src/pages/page-custom-page.tsx`
- `brekekephone/app/src/pages/page-custom-page-view.tsx`
- `brekekephone/app/src/components/custom-page-web-view.tsx`
- `brekekephone/app/src/components/custom-page-web-view.native.tsx`
- `brekekephone/app/src/utils/deeplink.ts`
- `brekekephone/app/src/utils/deeplink.native.ts`
- `brekekephone/app/src/utils/deeplink-parse.ts`
