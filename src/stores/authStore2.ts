import { debounce } from 'lodash'
import { action, observable } from 'mobx'
import { AppState, Platform } from 'react-native'

import { sip } from '../api/sip'
import {
  PbxCustomPage,
  PbxGetProductInfoRes,
  UcBuddy,
  UcBuddyGroup,
  UcConfig,
} from '../brekekejs'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { getUrlParams } from '../utils/deeplink'
import { ParsedPn, SipPn } from '../utils/PushNotification-parse'
import { updateParamsWithInvoke } from '../utils/updateParamsWithInvoke'
import { waitTimeout } from '../utils/waitTimeout'
import {
  Account,
  accountStore,
  getAccountUniqueId,
  getLastSignedInId,
  saveLastSignedInId,
} from './accountStore'
import { CallHistoryInfo } from './addCallHistory'
import { authPBX } from './AuthPBX'
import { authSIP } from './AuthSIP'
import { setAuthStore } from './authStore'
import { authUC } from './AuthUC'
import { Call } from './Call'
import { getCallStore } from './callStore'
import { chatStore } from './chatStore'
import { contactStore } from './contactStore'
import { intlDebug } from './intl'
import { Nav } from './Nav'
import { RnAlert } from './RnAlert'
import { RnAppState } from './RnAppState'
import { userStore } from './userStore'

type ConnectionState =
  | 'stopped'
  | 'waiting'
  | 'connecting'
  | 'success'
  | 'failure'

export class AuthStore {
  hasInternetConnected: boolean | null = null

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
      this.getCurrentAccount() &&
      this.pbxState !== 'waiting' &&
      // do not auth pbx if sip token is provided in case of PN
      // wait until sip login success or failure
      (!this.sipPn.sipAuth ||
        this.sipState === 'success' ||
        this.sipState === 'failure') &&
      (this.pbxState === 'stopped' ||
        (this.pbxState === 'failure' &&
          // !this.pbxTotalFailure &&
          RnAppState.currentState === 'active'))
    )
  }
  pbxConnectingOrFailure = () => {
    return ['waiting', 'connecting', 'failure'].some(s => s === this.pbxState)
  }

  sipShouldAuth = () => {
    return (
      this.sipState !== 'waiting' &&
      this.sipState !== 'connecting' &&
      this.sipState !== 'success' &&
      ((this.signedInId && this.sipPn.sipAuth) ||
        (this.pbxState === 'success' &&
          (this.sipState === 'stopped' ||
            (this.sipState === 'failure' &&
              // !this.sipTotalFailure &&
              RnAppState.currentState === 'active'))))
    )
  }
  sipConnectingOrFailure = () => {
    return ['waiting', 'connecting', 'failure'].some(s => s === this.sipState)
  }

  ucShouldAuth = () => {
    return (
      this.getCurrentAccount()?.ucEnabled &&
      !this.ucLoginFromAnotherPlace &&
      !this.isSignInByNotification &&
      this.pbxState === 'success' &&
      this.ucState !== 'waiting' &&
      (this.ucState === 'stopped' ||
        (this.ucState === 'failure' &&
          // !this.ucTotalFailure &&
          RnAppState.currentState === 'active'))
    )
  }
  ucConnectingOrFailure = () => {
    return (
      this.getCurrentAccount()?.ucEnabled &&
      ['waiting', 'connecting', 'failure'].some(s => s === this.ucState)
    )
  }

  isConnFailure = () => {
    return [
      this.pbxState,
      this.sipState,
      this.getCurrentAccount()?.ucEnabled && this.ucState,
    ].some(s => s === 'failure')
  }

  @observable signedInId = ''
  getCurrentAccount = () =>
    accountStore.accounts.find(a => a.id === this.signedInId) as Account
  getCurrentData = () => accountStore.findDataSync(this.getCurrentAccount())
  getCurrentDataAsync = () =>
    accountStore.findDataAsync(this.getCurrentAccount())

  @observable ucConfig?: UcConfig
  @observable pbxConfig?: PbxGetProductInfoRes
  @observable listCustomPage: PbxCustomPage[] = []

  saveActionOpenCustomPage = false
  customPageLoadings: { [k: string]: boolean } = {}
  getCustomPageById = (id: string) => {
    return this.listCustomPage.find(i => i.id == id)
  }
  updateCustomPage = (cp: PbxCustomPage) => {
    const found = this.listCustomPage.find(p => p.id === cp.id)
    if (!found) {
      return
    }
    Object.assign(found, cp)
  }
  isBigMode() {
    return this.pbxConfig?.['webphone.allusers'] === 'false'
  }

  signIn = async (a?: Account, autoSignIn?: boolean) => {
    if (!a) {
      return false
    }
    const d = await accountStore.findDataAsync(a)
    if (!a.pbxPassword && !d.accessToken) {
      Nav().goToPageAccountUpdate({ id: a.id })
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
  autoSignInLast = async () => {
    const d = await getLastSignedInId()
    const a = accountStore.accounts.find(_ => getAccountUniqueId(_) === d.id)
    if (!a) {
      return false
    }
    await this.signIn(a, true)
    return true
  }
  autoSignInEmbed = async () => {
    if (await this.autoSignInLast()) {
      return
    }
    this.signIn(accountStore.accounts[0])
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
        // try to end callkeep if it's stuck
        getCallStore().endCallKeepAllCalls()
      }
      this.resetState()
    } catch (err) {
      console.error('signOut debug: signOutWithoutSaving error:', err)
    }
    console.log('signOut debug: goToPageAccountSignIn')
    Nav().goToPageAccountSignIn()
    console.log('signOut debug: goToPageAccountSignIn done')
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
    this.listCustomPage = []
    this.customPageLoadings = {}
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
    // mobx observe not call automatically?
    authPBX.authWithCheck()
  }
  @action reconnectSip = () => {
    const count = sip.phone?.getSessionCount()
    if (count) {
      console.log(
        `SIP PN debug: can not reconnect sip due to ongoing sessions getSessionCount=${count} sipState=${this.sipState}`,
      )
      return
    }
    console.log('SIP PN debug: set sipState stopped reconnect')
    this.resetFailureState()
    this.sipState = 'stopped'
    // mobx observe not call automatically?
    authSIP.authWithCheck()
  }
  @action resetFailureStateIncludeUcLoginFromAnotherPlace = () => {
    this.resetFailureState()
    this.ucLoginFromAnotherPlace = false
    // mobx observe not call automatically?
    authUC.authWithCheck()
  }

  pushRecentCall = async (call: CallHistoryInfo) => {
    const d = await this.getCurrentDataAsync()
    d.recentCalls = [call, ...d.recentCalls]
    if (d.recentCalls.length > 20) {
      d.recentCalls.pop()
    }
    accountStore.saveAccountsToLocalStorageDebounced()
  }

  updatePartyNameRecentCall = async (
    fragment: Pick<Call, 'partyNumber' | 'partyName'>,
  ) => {
    const d = await this.getCurrentDataAsync()
    if (!d.recentCalls?.length) {
      return
    }
    d.recentCalls
      .filter(c => c.partyNumber === fragment.partyNumber)
      .forEach(c => Object.assign(c, fragment))
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
      Object.keys(getCallStore().callkeepMap).length ||
      sip.phone?.getSessionCount() ||
      getCallStore().calls.length
    ) {
      return false
    }
    //
    const urlParams = await getUrlParams()
    if (!urlParams) {
      return false
    }
    await updateParamsWithInvoke(urlParams)
    //
    const { _wn, host, phone_idx, port, tenant, user, password } = urlParams
    if (!tenant || !user) {
      return false
    }

    //
    const a = await accountStore.find({
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
    if (a) {
      if (!a.pbxHostname) {
        a.pbxHostname = host
      }
      if (!a.pbxPort) {
        a.pbxPort = port
      }
      if (!a.pbxPassword) {
        a.pbxPassword = password
      }
      a.pbxPhoneIndex = `${phoneIdx}`
      const d = await accountStore.findDataAsync(a)
      if (_wn) {
        d.accessToken = _wn
      }
      //
      accountStore.upsertAccount(a)
      if (a.pbxPassword || d.accessToken) {
        this.signIn(a)
      } else {
        Nav().goToPageAccountUpdate({ id: a.id })
      }

      return true
    }
    //
    const newA = {
      ...accountStore.genEmptyAccount(),
      pbxTenant: tenant,
      pbxUsername: user,
      pbxPassword: password,
      pbxHostname: host,
      pbxPort: port,
      pbxPhoneIndex: `${phoneIdx}`,
    }
    const d = await accountStore.findDataAsync(newA)
    //
    accountStore.upsertAccount(newA)
    if (newA.pbxPassword || d.accessToken) {
      this.signIn(newA)
    } else {
      Nav().goToPageAccountUpdate({ id: newA.id })
    }
    return true
  }

  @observable isSignInByNotification = false
  clearSignInByNotification = debounce(
    () => {
      // clearSignInByNotification will activate UC login
      // we will only allow UC login when the app is active
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
    // find account for the notification target
    const acc = await accountStore.findByPn(n)
    if (!acc) {
      console.log('SIP PN debug: can not find account from notification')
      return
    }
    // use isSignInByNotification to disable UC auto sign in for a while
    if (n.isCall) {
      this.isSignInByNotification = true
      this.clearSignInByNotification()
    }
    this.resetFailureState()
    if (this.signedInId === acc.id) {
      return
    }
    if (this.signedInId) {
      this.signedInId = ''
      await waitTimeout()
    }
    await this.signIn(acc)
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
