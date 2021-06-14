import UCClient0 from 'brekekejs/lib/ucclient'
import { debounce } from 'lodash'
import { Lambda, observe } from 'mobx'

import { UcErrors } from '../api/brekekejs'
import pbx from '../api/pbx'
import uc from '../api/uc'
import { getAuthStore } from './authStore'
import chatStore, { ChatMessage } from './chatStore'
import contactStore from './contactStore'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

const UCClient = UCClient0 as {
  Errors: UcErrors
}

class AuthUC {
  private clearObserve?: Lambda
  auth() {
    this.authWithCheck()
    uc.on('connection-stopped', this.onConnectionStopped)
    const s = getAuthStore()
    this.clearObserve = observe(s, 'ucShouldAuth', this.authWithCheckDebounced)
  }
  dispose() {
    uc.off('connection-stopped', this.onConnectionStopped)
    this.clearObserve?.()
    uc.disconnect()
    const s = getAuthStore()
    s.ucState = 'stopped'
  }

  private authWithoutCatch = async () => {
    uc.disconnect()
    const s = getAuthStore()
    s.ucState = 'connecting'
    s.ucLoginFromAnotherPlace = false
    const c = await pbx.getConfig()
    if (!c) {
      throw new Error('AuthUC.authWithoutCatch pbx.getConfig() undefined')
    }
    await uc.connect(
      s.currentProfile,
      c['webphone.uc.host'] ||
        `${s.currentProfile.pbxHostname}:${s.currentProfile.pbxPort}`,
    )
    this.loadUsers()
    this.loadUnreadChats().then(() => {
      s.ucState = 'success'
    })
  }
  private authWithCheck = () => {
    const s = getAuthStore()
    if (!s.ucShouldAuth) {
      return
    }
    this.authWithoutCatch().catch((err: Error) => {
      s.ucState = 'failure'
      s.ucTotalFailure += 1
      RnAlert.error({
        message: intlDebug`Failed to connect to UC`,
        err,
      })
    })
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)

  private onConnectionStopped = (e: { code: number }) => {
    const s = getAuthStore()
    s.ucState = 'failure'
    s.ucTotalFailure += 1
    s.ucLoginFromAnotherPlace = e.code === UCClient.Errors.PLEONASTIC_LOGIN
  }
  private loadUsers = () => {
    const users = uc.getUsers()
    contactStore.ucUsers = users
  }
  private loadUnreadChats = () =>
    uc
      .getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure)
  private onLoadUnreadChatsSuccess = (
    chats: {
      id: string
      text: string
      creator: string | undefined
      created: string
    }[],
  ) => {
    chats.forEach(c0 => {
      const chat = c0 as unknown as ChatMessage
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

export default AuthUC
