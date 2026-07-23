import { debounce } from 'lodash'
import type { Lambda } from 'mobx'
import { action, reaction } from 'mobx'

import { ucSignInSupersededError } from '#/api/uc'
import { Errors } from '#/brekekejs/ucclient'
import { defaultTimeout } from '#/config'
import type { ChatMessage } from '#/stores/chatStore'
import { ctx } from '#/stores/ctx'
import { intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { BackgroundTimer } from '#/utils/BackgroundTimer'
import { waitTimeout } from '#/utils/waitTimeout'

// UC sign-in only has a conditional client-side timeout (ucclient
// SIGN_IN_TIMEOUT_DEFAULT is 30s but its handler is a no-op unless
// _signInStatus === 2), so on a multi-account switch where the shared UC client
// is still wedged by a not-yet-torn-down session, ctx.uc.connect() can hang and
// ucState pins on 'connecting' forever. This app-side watchdog forces
// failure+retry so the state machine recovers (BUG-1256). It is deliberately
// longer than the 30s client timeout so it never pre-empts a connect the client
// itself would still resolve or reject.
const ucConnectingTimeoutMs = 45000

export class AuthUC {
  private clearShouldAuthReaction?: Lambda
  private clearConnectingWatchdogReaction?: Lambda
  private connectingWatchdogTimeoutId = 0

  auth = () => {
    this.clearConnectingWatchdogReaction?.()
    // Key by account so connecting(B) -> connecting(A) resets the deadline;
    // fireImmediately arms even if ucState is already stuck on 'connecting' when
    // auth() re-registers the reaction.
    this.clearConnectingWatchdogReaction = reaction(
      () =>
        ctx.auth.ucState === 'connecting' ? ctx.auth.signedInId || '_' : '',
      this.onUcConnectingKeyChanged,
      { fireImmediately: true },
    )
    this.authWithCheck()
    ctx.uc.on('connection-stopped', this.onConnectionStopped)
    this.clearShouldAuthReaction?.()

    this.clearShouldAuthReaction = reaction(
      ctx.auth.ucShouldAuth,
      this.authWithCheckDebounced,
    )
  }
  @action dispose = () => {
    ctx.uc.off('connection-stopped', this.onConnectionStopped)
    this.clearShouldAuthReaction?.()
    this.clearConnectingWatchdogReaction?.()
    this.clearConnectingWatchdogTimeout()
    ctx.uc.disconnect()

    ctx.auth.ucState = 'stopped'
  }

  // Armed whenever ucState is 'connecting' (re-armed on account change),
  // disarmed as soon as it leaves 'connecting'.
  private onUcConnectingKeyChanged = (key: string) => {
    this.clearConnectingWatchdogTimeout()
    if (key) {
      this.connectingWatchdogTimeoutId = BackgroundTimer.setTimeout(
        this.onUcConnectingTimeout,
        ucConnectingTimeoutMs,
      )
    }
  }
  private clearConnectingWatchdogTimeout = () => {
    if (this.connectingWatchdogTimeoutId) {
      BackgroundTimer.clearTimeout(this.connectingWatchdogTimeoutId)
      this.connectingWatchdogTimeoutId = 0
    }
  }
  @action private onUcConnectingTimeout = () => {
    this.connectingWatchdogTimeoutId = 0
    if (ctx.auth.ucState !== 'connecting') {
      return
    }
    ctx.auth.ucState = 'failure'
    ctx.auth.ucTotalFailure += 1
    this.authWithCheck()
  }

  @action private authWithoutCatch = async () => {
    ctx.uc.disconnect()

    ctx.auth.ucState = 'connecting'
    ctx.auth.ucLoginFromAnotherPlace = false
    const c = await ctx.pbx.getConfig()
    if (!c) {
      throw new Error('AuthUC.authWithoutCatch pbx.getConfig() undefined')
    }
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return
    }
    const accountId = ca.id
    await ctx.uc.connect(
      ca,
      c['webphone.uc.host'] || `${ca.pbxHostname}:${ca.pbxPort}`,
    )
    if (ctx.auth.signedInId !== accountId) {
      return
    }
    this.loadUsers()
    this.loadUnreadChats(accountId).then(
      action(() => {
        if (ctx.auth.signedInId !== accountId) {
          return
        }
        ctx.auth.ucState = 'success'
        ctx.auth.ucTotalFailure = 0
      }),
    )
  }
  @action private authWithCheck = async () => {
    if (!ctx.auth.ucShouldAuth()) {
      return
    }
    if (ctx.auth.ucTotalFailure > 1) {
      ctx.auth.ucState = 'waiting'
      await waitTimeout(
        ctx.auth.ucTotalFailure < 5 ? ctx.auth.ucTotalFailure * 1000 : 15000,
      )
      if (ctx.auth.ucState !== 'waiting') {
        return
      }
    }
    this.authWithoutCatch().catch(
      action((err: Error) => {
        if (err === ucSignInSupersededError) {
          // A newer connect/disconnect (account switch or teardown) took over
          // this sign-in; let that one own ucState. Counting it as a failure
          // would spawn a competing retry that ping-pongs with the newer
          // attempt (BUG-1256).
          return
        }
        ctx.auth.ucState = 'failure'
        ctx.auth.ucTotalFailure += 1
        console.error('Failed to connect to uc:', err)
        this.authWithCheck()
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, defaultTimeout)

  @action private onConnectionStopped = (e: { code: number }) => {
    ctx.auth.ucState = 'failure'
    ctx.auth.ucTotalFailure += 1
    ctx.auth.ucLoginFromAnotherPlace = e.code === Errors.PLEONASTIC_LOGIN
    this.authWithCheck()
  }
  @action private loadUsers = () => {
    // update logic loadUcBuddyList when UC connect finish
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return
    }
    if (ctx.auth.isBigMode() || !ca.pbxLocalAllUsers) {
      ctx.user.loadUcBuddyList()
    }
    const users = ctx.uc.getUsers()
    ctx.contact.ucUsers = users
  }
  private loadUnreadChats = (accountId: string) =>
    ctx.uc
      .getUnreadChats()
      .then(chats => this.onLoadUnreadChatsSuccess(chats, accountId))
      .catch(this.onLoadUnreadChatsFailure)
  @action private onLoadUnreadChatsSuccess = (
    chats: {
      id: string
      text: string
      creator: string | undefined
      created: string
    }[],
    accountId: string,
  ) => {
    if (ctx.auth.signedInId !== accountId) {
      return
    }
    chats.forEach(c0 => {
      const chat = c0 as any as ChatMessage
      ctx.chat.pushMessages(chat.creator, [chat], true)
    })
  }
  private onLoadUnreadChatsFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to load unread chat messages`,
      err,
    })
  }
}

ctx.authUC = new AuthUC()
