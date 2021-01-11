import UCClient0 from 'brekekejs/lib/ucclient'
import debounce from 'lodash/debounce'
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
  clearObserve?: Lambda
  auth() {
    this._auth2()
    uc.on('connection-stopped', this.onConnectionStopped)
    this.clearObserve = observe(getAuthStore(), 'ucShouldAuth', this._auth2)
  }
  dispose() {
    uc.off('connection-stopped', this.onConnectionStopped)
    this.clearObserve?.()
    uc.disconnect()
    getAuthStore().ucState = 'stopped'
  }

  _auth = async () => {
    uc.disconnect()
    getAuthStore().ucState = 'connecting'
    getAuthStore().ucLoginFromAnotherPlace = false
    const c = await pbx.getConfig()
    uc.connect(
      getAuthStore().currentProfile,
      c['webphone.uc.host'] ||
        `${getAuthStore().currentProfile.pbxHostname}:${
          getAuthStore().currentProfile.pbxPort
        }`,
    )
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure)
  }
  _auth2 = debounce(
    () => {
      if (getAuthStore().ucShouldAuth) {
        this._auth().catch(this.onAuthFailure)
      }
    },
    50,
    {
      maxWait: 300,
    },
  )

  onAuthSuccess = () => {
    this.loadUsers()
    this.loadUnreadChats().then(() => {
      getAuthStore().ucState = 'success'
    })
  }
  onAuthFailure = (err: Error) => {
    getAuthStore().ucState = 'failure'
    getAuthStore().ucTotalFailure += 1
    RnAlert.error({
      message: intlDebug`Failed to connect to UC`,
      err,
    })
  }
  onConnectionStopped = (e: { code: number }) => {
    getAuthStore().ucState = 'failure'
    getAuthStore().ucTotalFailure += 1
    getAuthStore().ucLoginFromAnotherPlace =
      e.code === UCClient.Errors.PLEONASTIC_LOGIN
  }
  loadUsers = () => {
    const users = uc.getUsers()
    contactStore.ucUsers = users
  }
  loadUnreadChats = () =>
    uc
      .getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure)
  onLoadUnreadChatsSuccess = (
    chats: {
      id: string
      text: string
      creator: string | undefined
      created: string
    }[],
  ) => {
    chats.forEach(c0 => {
      const chat = (c0 as unknown) as ChatMessage
      chatStore.pushMessages(chat.creator, [chat], true)
    })
  }
  onLoadUnreadChatsFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to load unread chat messages`,
      err,
    })
  }
}

export default AuthUC
