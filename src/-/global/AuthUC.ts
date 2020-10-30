import * as UCClient from 'brekekejs/lib/ucclient'
import debounce from 'lodash/debounce'
import { Lambda, observe } from 'mobx'

import uc from '../api/uc'
import { intlDebug } from '../intl/intl'
import Alert from './Alert'
import authStore from './authStore'
import chatStore from './chatStore'
import contactStore from './contactStore'

class AuthUC {
  clearObserve?: Lambda
  auth() {
    this._auth2()
    uc.on('connection-stopped', this.onConnectionStopped)
    this.clearObserve = observe(authStore, 'ucShouldAuth', this._auth2)
  }
  dispose() {
    uc.off('connection-stopped', this.onConnectionStopped)
    void this.clearObserve?.()
    uc.disconnect()
    authStore.ucState = 'stopped'
  }

  _auth = () => {
    uc.disconnect()
    authStore.ucState = 'connecting'
    authStore.ucLoginFromAnotherPlace = false
    uc.connect(authStore.currentProfile)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure)
  }
  _auth2 = debounce(() => authStore.ucShouldAuth && this._auth(), 100, {
    maxWait: 300,
  })

  onAuthSuccess = () => {
    this.loadUsers()
    this.loadUnreadChats().then(() => {
      authStore.ucState = 'success'
    })
  }
  onAuthFailure = err => {
    authStore.ucState = 'failure'
    authStore.ucTotalFailure += 1
    Alert.error({
      message: intlDebug`Failed to connect to UC`,
      err,
    })
  }
  onConnectionStopped = e => {
    authStore.ucState = 'failure'
    authStore.ucTotalFailure += 1
    authStore.ucLoginFromAnotherPlace =
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
  onLoadUnreadChatsSuccess = chats => {
    chats.forEach(chat => {
      chatStore.pushMessages(chat.creator, [chat], true)
    })
  }
  onLoadUnreadChatsFailure = err => {
    Alert.error({
      message: intlDebug`Failed to load unread chat messages`,
      err,
    })
  }
}

export default AuthUC
