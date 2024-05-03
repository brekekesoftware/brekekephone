import { debounce } from 'lodash'
import { action, Lambda, reaction } from 'mobx'

import { pbx } from '../api/pbx'
import { uc } from '../api/uc'
import { Errors } from '../brekekejs/ucclient'
import { waitTimeout } from '../utils/waitTimeout'
import { getAuthStore } from './authStore'
import { ChatMessage, chatStore } from './chatStore'
import { contactStore } from './contactStore'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'
import { userStore } from './userStore'

class AuthUC {
  private clearShouldAuthReaction?: Lambda

  auth() {
    this.authWithCheck()
    uc.on('connection-stopped', this.onConnectionStopped)
    this.clearShouldAuthReaction?.()
    const s = getAuthStore()
    this.clearShouldAuthReaction = reaction(
      s.ucShouldAuth,
      this.authWithCheckDebounced,
    )
  }
  @action dispose = () => {
    uc.off('connection-stopped', this.onConnectionStopped)
    this.clearShouldAuthReaction?.()
    uc.disconnect()
    const s = getAuthStore()
    s.ucState = 'stopped'
  }
  authWithAppActive = async () => {
    const s = getAuthStore()
    if (
      s.getCurrentAccount()?.ucEnabled &&
      s.signedInId &&
      s.pbxState === 'success'
    ) {
      this.authWithoutCatch().catch(
        action((err: Error) => {
          s.ucState = 'failure'
          console.error('Failed to connect to uc:', err)
        }),
      )
    }
  }
  @action private authWithoutCatch = async () => {
    uc.disconnect()
    const s = getAuthStore()
    s.ucState = 'connecting'
    s.ucLoginFromAnotherPlace = false
    const c = await pbx.getConfig()
    if (!c) {
      throw new Error('AuthUC.authWithoutCatch pbx.getConfig() undefined')
    }
    const ca = s.getCurrentAccount()
    if (!ca) {
      return
    }
    await uc.connect(
      ca,
      c['webphone.uc.host'] || `${ca.pbxHostname}:${ca.pbxPort}`,
    )
    this.loadUsers()
    this.loadUnreadChats().then(
      action(() => {
        s.ucState = 'success'
        s.ucTotalFailure = 0
      }),
    )
  }
  authWithCheck = async () => {
    const s = getAuthStore()
    if (!s.ucShouldAuth()) {
      return
    }
    if (s.ucTotalFailure > 1) {
      s.ucState = 'waiting'
      await waitTimeout(s.ucTotalFailure < 5 ? s.ucTotalFailure * 1000 : 15000)
      if (s.ucState !== 'waiting') {
        return
      }
    }
    this.authWithoutCatch().catch(
      action((err: Error) => {
        s.ucState = 'failure'
        s.ucTotalFailure += 1
        console.error('Failed to connect to uc:', err)
        this.authWithCheck()
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)

  @action private onConnectionStopped = (e: { code: number }) => {
    const s = getAuthStore()
    s.ucState = 'failure'
    s.ucTotalFailure += 1
    s.ucLoginFromAnotherPlace = e.code === Errors.PLEONASTIC_LOGIN
    this.authWithCheck()
  }
  @action private loadUsers = () => {
    // update logic loadUcBuddyList when UC connect finish
    const s = getAuthStore()
    const cp = s.getCurrentAccount()
    if (s.isBigMode() || !cp.pbxLocalAllUsers) {
      userStore.loadUcBuddyList()
    }
    const users = uc.getUsers()
    contactStore.ucUsers = users
  }
  private loadUnreadChats = () =>
    uc
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
      chatStore.pushMessages(chat.creator, [chat], true)
    })
  }
  private onLoadUnreadChatsFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to load unread chat messages`,
      err,
    })
  }
}

export const authUC = new AuthUC()
