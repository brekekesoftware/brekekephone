import UCClient0 from 'brekekejs/lib/ucclient'
import { debounce } from 'lodash'
import { action, Lambda, reaction } from 'mobx'

import { UcErrors } from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { uc } from '../api/uc'
import { getAuthStore } from './authStore'
import { ChatMessage, chatStore } from './chatStore'
import { contactStore } from './contactStore'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'

const UCClient = UCClient0 as {
  Errors: UcErrors
}

class AuthUC {
  private clearObserve?: Lambda
  auth() {
    this.authWithCheck()
    uc.on('connection-stopped', this.onConnectionStopped)
    this.clearObserve?.()
    const s = getAuthStore()
    this.clearObserve = reaction(s.ucShouldAuth, this.authWithCheckDebounced)
  }
  @action dispose = () => {
    uc.off('connection-stopped', this.onConnectionStopped)
    this.clearObserve?.()
    uc.disconnect()
    const s = getAuthStore()
    s.ucState = 'stopped'
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
    const p = s.getCurrentAccount()
    if (!p) {
      return
    }
    await uc.connect(
      p,
      c['webphone.uc.host'] || `${p.pbxHostname}:${p.pbxPort}`,
    )
    this.loadUsers()
    this.loadUnreadChats().then(
      action(() => {
        s.ucState = 'success'
        s.ucTotalFailure = 0
      }),
    )
  }
  private authWithCheck = () => {
    const s = getAuthStore()
    if (!s.ucShouldAuth()) {
      return
    }
    this.authWithoutCatch().catch(
      action((err: Error) => {
        s.ucState = 'failure'
        s.ucTotalFailure += 1
        console.error('Failed to connect to uc:', err)
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)

  @action private onConnectionStopped = (e: { code: number }) => {
    const s = getAuthStore()
    s.ucState = 'failure'
    s.ucTotalFailure += 1
    s.ucLoginFromAnotherPlace = e.code === UCClient.Errors.PLEONASTIC_LOGIN
  }
  @action private loadUsers = () => {
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
