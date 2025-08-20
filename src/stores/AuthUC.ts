import { debounce } from 'lodash'
import type { Lambda } from 'mobx'
import { action, reaction } from 'mobx'

import { Errors } from '#/brekekejs/ucclient'
import type { ChatMessage } from '#/stores/chatStore'
import { ctx } from '#/stores/ctx'
import { intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { waitTimeout } from '#/utils/waitTimeout'

export class AuthUC {
  private clearShouldAuthReaction?: Lambda

  auth = () => {
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
    ctx.uc.disconnect()

    ctx.auth.ucState = 'stopped'
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
    await ctx.uc.connect(
      ca,
      c['webphone.uc.host'] || `${ca.pbxHostname}:${ca.pbxPort}`,
    )
    this.loadUsers()
    this.loadUnreadChats().then(
      action(() => {
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
        ctx.auth.ucState = 'failure'
        ctx.auth.ucTotalFailure += 1
        console.error('Failed to connect to uc:', err)
        this.authWithCheck()
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)

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
  private loadUnreadChats = () =>
    ctx.uc
      .getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure)
  @action private onLoadUnreadChatsSuccess = (
    chats: {
      id: string
      text: string
      creator: string | undefined
      created: string
    }[],
  ) => {
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
