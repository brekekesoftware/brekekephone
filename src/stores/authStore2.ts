import { debounce } from 'lodash'
import { action, observable } from 'mobx'
import { AppState, Platform } from 'react-native'

import {
  PbxGetProductInfoRes,
  UcBuddy,
  UcBuddyGroup,
  UcConfig,
} from '../api/brekekejs'
import { sip } from '../api/sip'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { getUrlParams } from '../utils/deeplink'
import { ParsedPn, SipPn } from '../utils/PushNotification-parse'
import {
  Account,
  accountStore,
  getAccountUniqueId,
  getLastSignedInId,
  parsedPnToAccountUnique,
  saveLastSignedInId,
} from './accountStore'
import { authSIP } from './AuthSIP'
import { compareAccount, setAuthStore } from './authStore'
import { getCallStore } from './callStore'
import { chatStore } from './chatStore'
import { contactStore } from './contactStore'
import { intlDebug } from './intl'
import { Nav } from './Nav'
import { RnAlert } from './RnAlert'
import { RnAppState } from './RnAppState'
import { userStore } from './userStore'

type ConnectionState = 'stopped' | 'connecting' | 'success' | 'failure'

export class AuthStore {
  @observable sipPn: Partial<SipPn> = {}

  @observable pbxState: ConnectionState = 'stopped'
  @observable pbxTotalFailure = 0
  @observable sipState: ConnectionState = 'stopped'
  @observable sipTotalFailure = 0
  @observable ucState: ConnectionState = 'stopped'
  @observable ucTotalFailure = 0
  @observable ucLoginFromAnotherPlace = false

  pbxShouldAuth = () => {
    return (
      this.signedInId &&
      // Do not auth pbx if sip token is provided in case of PN
      // Wait until sip login success or failure
      (!this.sipPn.sipAuth ||
        this.sipState === 'success' ||
        this.sipState === 'failure') &&
      (this.pbxState === 'stopped' ||
        (this.pbxState === 'failure' &&
          !this.pbxTotalFailure &&
          RnAppState.currentState === 'active'))
    )
  }
  pbxConnectingOrFailure = () => {
    return ['connecting', 'failure'].some(s => s === this.pbxState)
  }

  sipShouldAuth = () => {
    return (
      this.sipState !== 'connecting' &&
      this.sipState !== 'success' &&
      ((this.signedInId && this.sipPn.sipAuth) ||
        (this.pbxState === 'success' &&
          (this.sipState === 'stopped' ||
            (this.sipState === 'failure' &&
              !this.sipTotalFailure &&
              RnAppState.currentState === 'active'))))
    )
  }
  sipConnectingOrFailure = () => {
    return ['connecting', 'failure'].some(s => s === this.sipState)
  }

  ucShouldAuth = () => {
    return (
      this.getCurrentAccount()?.ucEnabled &&
      !this.ucLoginFromAnotherPlace &&
      !this.isSignInByNotification &&
      this.pbxState === 'success' &&
      (this.ucState === 'stopped' ||
        (this.ucState === 'failure' &&
          !this.ucTotalFailure &&
          RnAppState.currentState === 'active'))
    )
  }
  ucConnectingOrFailure = () => {
    return (
      this.getCurrentAccount()?.ucEnabled &&
      ['connecting', 'failure'].some(s => s === this.ucState)
    )
  }

  isConnFailure = () => {
    return [
      this.pbxState,
      this.sipState,
      this.getCurrentAccount()?.ucEnabled && this.ucState,
    ].some(s => s === 'failure')
  }

  private findAccount = (p: Partial<Account>) => {
    return accountStore.accounts.find(p0 => compareAccount(p0, p))
  }
  findAccountByPn = (n: ParsedPn) => {
    return this.findAccount(parsedPnToAccountUnique(n))
  }

  @observable signedInId = ''
  getCurrentAccount = () =>
    accountStore.accounts.find(p => p.id === this.signedInId) as Account
  getCurrentData = () => accountStore.getAccountData(this.getCurrentAccount())
  getCurrentDataAsync = () =>
    accountStore.getAccountDataAsync(this.getCurrentAccount())

  @observable ucConfig?: UcConfig
  @observable pbxConfig?: PbxGetProductInfoRes

  isBigMode() {
    return this.pbxConfig?.['webphone.allusers'] === 'false'
  }

  signIn = async (a?: Account, autoSignIn?: boolean) => {
    if (!a) {
      return false
    }
    const d = await accountStore.getAccountDataAsync(a)
    if (!a.pbxPassword && !d.accessToken) {
      Nav().goToPageProfileUpdate({ id: a.id })
      RnAlert.error({
        message: intlDebug`The account password is empty`,
      })
      return true
    }
    this.signedInId = a.id
    if (!autoSignIn) {
      await saveLastSignedInId(getAccountUniqueId(a))
    }
    return true
  }
  autoSignInEmbed = async () => {
    const d = await getLastSignedInId()
    this.signIn(
      accountStore.accounts.find(_ => getAccountUniqueId(_) === d.id) ||
        accountStore.accounts[0],
    )
  }

  signOut = () => {
    console.log('signOut debug: autoStore.signOut')
    saveLastSignedInId(false)
    this.signOutWithoutSaving()
  }
  signOutWithoutSaving = () => {
    try {
      getCallStore().calls.forEach(c => c.hangupWithUnhold())
      if (Platform.OS !== 'web') {
        // Try to end callkeep if it's stuck
        getCallStore().endCallKeepAllCalls()
      }
      this.resetState()
    } catch (err) {
      console.error('signOut debug: signOutWithoutSaving error:', err)
    }
    console.log('signOut debug: goToPageProfileSignIn')
    Nav().goToPageProfileSignIn()
    console.log('signOut debug: goToPageProfileSignIn done')
  }
  @action private resetState = () => {
    this.signedInId = ''
    this.pbxState = 'stopped'
    console.log('SIP PN debug: set sipState stopped sign out')
    this.sipState = 'stopped'
    this.sipPn = {}
    sip.stopWebRTC()
    this.ucState = 'stopped'
    this.resetFailureStateIncludeUcLoginFromAnotherPlace()
    this.pbxConfig = undefined
    this.ucConfig = undefined
    userStore.clearStore()
    contactStore.clearStore()
    chatStore.clearStore()
  }

  @action resetFailureState = () => {
    this.pbxTotalFailure = 0
    this.sipTotalFailure = 0
    this.ucTotalFailure = 0
  }
  @action reconnectPbx = () => {
    this.resetFailureState()
    this.pbxState = 'stopped'
  }
  @action reconnectSip = () => {
    console.log('SIP PN debug: set sipState stopped reconnect')
    this.resetFailureState()
    this.sipState = 'stopped'
    // Mobx observe not call automatically?
    authSIP.authWithCheck()
  }
  @action resetFailureStateIncludeUcLoginFromAnotherPlace = () => {
    this.resetFailureState()
    this.ucLoginFromAnotherPlace = false
  }

  pushRecentCall = async (call: {
    id: string
    incoming: boolean
    answered: boolean
    partyName: string
    partyNumber: string
    duration: number
    created: string
  }) => {
    const d = await this.getCurrentDataAsync()
    d.recentCalls = [call, ...d.recentCalls]
    if (d.recentCalls.length > 20) {
      d.recentCalls.pop()
    }
    accountStore.saveAccountsToLocalStorageDebounced()
  }

  savePbxBuddyList = async (pbxBuddyList: {
    screened: boolean
    users: (UcBuddy | UcBuddyGroup)[]
  }) => {
    const d = await this.getCurrentDataAsync()
    d.pbxBuddyList = pbxBuddyList
    accountStore.saveAccountsToLocalStorageDebounced()
  }

  handleUrlParams = async () => {
    if (
      getCallStore().calls.length ||
      Object.keys(getCallStore().callkeepMap).length ||
      sip.phone?.getSessionCount()
    ) {
      return false
    }
    //
    await accountStore.waitStorageLoaded()
    const urlParams = await getUrlParams()
    if (!urlParams) {
      return false
    }
    //
    const { _wn, host, phone_idx, port, tenant, user } = urlParams
    if (!tenant || !user) {
      return false
    }
    //
    const p = this.findAccount({
      pbxUsername: user,
      pbxTenant: tenant,
      pbxHostname: host,
      pbxPort: port,
    })
    let phoneIdx = parseInt(phone_idx)
    if (!phoneIdx || phoneIdx <= 0 || phoneIdx > 4) {
      phoneIdx = 4
    }
    //
    if (p) {
      if (!p.pbxHostname) {
        p.pbxHostname = host
      }
      if (!p.pbxPort) {
        p.pbxPort = port
      }
      p.pbxPhoneIndex = `${phoneIdx}`
      const d = await accountStore.getAccountDataAsync(p)
      if (_wn) {
        d.accessToken = _wn
      }
      //
      accountStore.upsertAccount(p)
      if (p.pbxPassword || d.accessToken) {
        this.signIn(p)
      } else {
        Nav().goToPageProfileUpdate({ id: p.id })
      }
      return true
    }
    //
    const newP = {
      ...accountStore.genEmptyAccount(),
      pbxTenant: tenant,
      pbxUsername: user,
      pbxHostname: host,
      pbxPort: port,
      pbxPhoneIndex: `${phoneIdx}`,
    }
    const d = await accountStore.getAccountDataAsync(newP)
    //
    accountStore.upsertAccount(newP)
    if (d.accessToken) {
      this.signIn(newP)
    } else {
      Nav().goToPageProfileUpdate({ id: newP.id })
    }
    return true
  }

  @observable isSignInByNotification = false
  clearSignInByNotification = debounce(
    () => {
      // clearSignInByNotification will activate UC login
      // We will only allow UC login when the app is active
      if (AppState.currentState !== 'active') {
        BackgroundTimer.setTimeout(this.clearSignInByNotification, 17)
      } else {
        this.isSignInByNotification = false
      }
    },
    10000,
    {
      maxWait: 15000,
    },
  )

  @action signInByNotification = async (n: ParsedPn) => {
    console.log(
      `SIP PN debug: signInByNotification pnId=${n.id} token=${n.sipPn.sipAuth}`,
    )
    this.sipPn = n.sipPn
    this.resetFailureState()
    await accountStore.waitStorageLoaded()
    // Find account for the notification target
    const p = this.findAccountByPn(n)
    if (!p?.id) {
      console.log('SIP PN debug: can not find account from notification')
      return false
    }
    // Use isSignInByNotification to disable UC auto sign in for a while
    if (n.isCall) {
      this.isSignInByNotification = true
      this.clearSignInByNotification()
    }
    if (this.signedInId !== p.id) {
      return this.signIn(p)
    }
    return false
  }

  userExtensionProperties: null | {
    id: string
    name: string
    language: string
    phones: {
      id: string
      type: string
    }[]
  } = null
}

const authStore = new AuthStore()

setAuthStore(authStore)
