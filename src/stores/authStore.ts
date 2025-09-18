import { debounce } from 'lodash'
import { action, observable } from 'mobx'
import { AppState, Platform } from 'react-native'

import type {
  PbxCustomPage,
  PbxGetProductInfoRes,
  PbxResourceLine,
  UcBuddy,
  UcBuddyGroup,
  UcConfig,
} from '#/brekekejs'
import { bundleIdentifier, currentVersion, isIos, isWeb } from '#/config'
import { embedApi } from '#/embed/embedApi'
import type { Account, AccountUnique, RecentCall } from '#/stores/accountStore'
import {
  getAccountUniqueId,
  getLastSignedInId,
  saveLastSignedInId,
} from '#/stores/accountStore'
import type { CallHistoryInfo } from '#/stores/addCallHistory'
import type { Call } from '#/stores/Call'
import { ctx } from '#/stores/ctx'
import { intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { RnAppState } from '#/stores/RnAppState'
import { RnStacker } from '#/stores/RnStacker'
import { BackgroundTimer } from '#/utils/BackgroundTimer'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { clearUrlParams, getUrlParams } from '#/utils/deeplink'
import type { ParsedPn, SipPn } from '#/utils/PushNotification-parse'
import { toBoolean } from '#/utils/string'
import { waitForActiveAppState } from '#/utils/waitForActiveAppState'
import { waitTimeout } from '#/utils/waitTimeout'

export type ConnectionState =
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

  @observable pbxLoginFromAnotherPlace = false
  @observable showMsgPbxLoginFromAnotherPlace = false
  @observable ucLoginFromAnotherPlace = false

  @observable pbxConnectedAt = 0

  pbxShouldAuth = () =>
    this.getCurrentAccount() &&
    !this.pbxLoginFromAnotherPlace &&
    this.pbxState !== 'waiting' &&
    // do not auth pbx if sip token is provided in case of PN
    // wait until sip login success or failure
    (!this.sipPn.sipAuth ||
      this.sipState === 'success' ||
      this.sipState === 'failure') &&
    (this.pbxState === 'stopped' ||
      (this.pbxState === 'failure' &&
        // !this.pbxTotalFailure &&
        RnAppState.currentState === 'active') ||
      (this.pbxState === 'failure' &&
        this.sipState === 'success' &&
        RnAppState.currentState === 'background' &&
        ctx.call.calls.length))
  pbxConnectingOrFailure = () =>
    ['waiting', 'connecting', 'failure'].some(s => s === this.pbxState)

  sipShouldAuth = () =>
    this.sipState !== 'waiting' &&
    this.sipState !== 'connecting' &&
    this.sipState !== 'success' &&
    !this.pbxLoginFromAnotherPlace &&
    !ctx.call.calls.length &&
    !ctx.sip.phone?.getSessionCount() &&
    ((this.signedInId && this.sipPn.sipAuth) ||
      (this.pbxState === 'success' &&
        (this.sipState === 'stopped' ||
          (this.sipState === 'failure' &&
            // !this.sipTotalFailure &&
            RnAppState.currentState === 'active'))))
  sipConnectingOrFailure = () =>
    ['waiting', 'connecting', 'failure'].some(s => s === this.sipState)

  ucShouldAuth = () =>
    this.getCurrentAccount()?.ucEnabled &&
    !this.ucLoginFromAnotherPlace &&
    !this.isSignInByNotification &&
    this.pbxState === 'success' &&
    this.ucState !== 'waiting' &&
    (this.ucState === 'stopped' ||
      (this.ucState === 'failure' &&
        // !this.ucTotalFailure &&
        RnAppState.currentState === 'active'))
  ucConnectingOrFailure = () =>
    this.getCurrentAccount()?.ucEnabled &&
    ['waiting', 'connecting', 'failure'].some(s => s === this.ucState)

  isConnFailure = (): boolean => {
    if (this.pbxLoginFromAnotherPlace || this.ucLoginFromAnotherPlace) {
      return true
    }
    const states = [
      this.pbxState,
      this.sipState,
      this.getCurrentAccount()?.ucEnabled ? this.ucState : undefined,
    ].filter(s => s)
    return !states.includes('connecting') && states.includes('failure')
  }

  @observable signedInId = ''
  getCurrentAccount = () =>
    ctx.account.accounts.find(a => a.id === this.signedInId)
  getCurrentData = () => ctx.account.findDataSync(this.getCurrentAccount())
  getCurrentDataAsync = () => {
    const ca = this.getCurrentAccount()
    return ca && ctx.account.findDataWithDefault(ca)
  }

  @observable ucConfig?: UcConfig
  @observable pbxConfig?: PbxGetProductInfoRes
  @observable listCustomPage: PbxCustomPage[] = []
  @observable activeCustomPageId?: string
  saveActionOpenCustomPage = false
  customPageLoadings: { [k: string]: boolean } = {}
  getCustomPageById = (id: string) => this.listCustomPage.find(i => i.id == id)
  updateCustomPage = (cp: PbxCustomPage) => {
    const found = this.listCustomPage.find(p => p.id === cp.id)
    if (!found) {
      return
    }
    Object.assign(found, cp)
  }

  @observable resourceLines: PbxResourceLine[] = []

  // user agent for sip pal client
  // TODO: check embed api, dont need to set BrekekeUtils since this in web only?
  getUserAgent = async (a: ParsedPn | AccountUnique) =>
    embedApi._pbxConfig['webphone.useragent'] || this._getUserAgent(a)
  private _getUserAgent = async (a: ParsedPn | AccountUnique) => {
    const au = 'to' in a ? await ctx.account.findByPn(a) : a
    const d = await ctx.account.findData(au)
    if (d?.userAgent) {
      return d.userAgent
    }
    const osMap: { [k: string]: string } = {
      ios: 'iOS',
      android: 'Android',
      web: 'Web',
    }
    const os = osMap[Platform.OS]
    const productName = ctx.global.productName
    return `${productName} for ${os} ${currentVersion}, JsSIP 3.2.15, ${bundleIdentifier}`
  }

  // user agent for http request such as iframe webview smart avatar...
  @observable private userAgentConfig: string | undefined = undefined
  setUserAgentConfig = async (useragent: string | undefined) => {
    const isEnabled = useragent === undefined || toBoolean(useragent)
    if (!isEnabled) {
      BrekekeUtils.setUserAgentConfig('')
      return
    }
    const a = this.getCurrentAccount()
    if (!a) {
      return
    }
    const userAgent = await this.getUserAgent(a)
    BrekekeUtils.setUserAgentConfig(userAgent)
    this.userAgentConfig = userAgent
  }
  getUserAgentConfig = () =>
    embedApi._pbxConfig['webphone.http.useragent.product'] ||
    this.userAgentConfig

  isBigMode = () => this.pbxConfig?.['webphone.allusers'] === 'false'

  signIn = async (a?: Account, autoSignIn?: boolean) => {
    if (!a) {
      return false
    }
    const d = await ctx.account.findDataWithDefault(a)
    if (!a.pbxPassword && !d.accessToken) {
      ctx.nav.goToPageAccountUpdate({ id: a.id })
      RnAlert.error({
        message: intlDebug`The account password is empty`,
      })
      return true
    }

    // handle replace navSubMenus when login to make sure app will not auto open Phone Appli app
    if (
      a.navSubMenus?.length &&
      a.navSubMenus.some(item => item === 'recents' || item === 'phonebook')
    ) {
      const updatedNavSubMenus = a.navSubMenus.map(item => {
        if (item === 'recents') {
          return 'keypad'
        } else if (item === 'phonebook') {
          return 'users'
        } else {
          return item
        }
      })
      await ctx.account.upsertAccount({
        id: a.id,
        navSubMenus: updatedNavSubMenus,
      })
    }

    this.signedInId = a.id
    this.pbxConnectedAt = 0
    console.log(
      '=======================================================================',
    )
    console.log(`signIn debug: account ${a.pbxUsername} signed in`)
    BrekekeUtils.setPhoneappliEnabled(!!this.phoneappliEnabled())
    if (!autoSignIn) {
      await saveLastSignedInId(getAccountUniqueId(a))
    }
    return true
  }

  autoSignInLast = async () => {
    const d = await getLastSignedInId()
    const a = await ctx.account.findByUniqueId(d.id)
    if (!a) {
      return false
    }
    await this.signIn(a, true)
    return true
  }
  autoSignInFirstAccount = async () => {
    const a = ctx.account.accounts?.[0]
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
    this.signIn(ctx.account.accounts[0])
  }

  signOut = () => {
    console.log(
      '=======================================================================',
    )
    console.log('signOut debug: autoStore.signOut')
    saveLastSignedInId(false)
    this.signOutWithoutSaving()
  }
  signOutWithoutSaving = () => {
    try {
      ctx.call.calls.forEach(c => c.hangupWithUnhold())
      if (!isWeb) {
        // try to end callkeep if it's stuck
        ctx.call.endCallKeepAllCalls()
      }
      this.resetState()
    } catch (err) {
      console.error('signOut debug: signOutWithoutSaving error:', err)
    }
    console.log('signOut debug: goToPageAccountSignIn')
    ctx.nav.goToPageAccountSignIn()
    console.log('signOut debug: goToPageAccountSignIn done')
  }
  @action private resetState = () => {
    this.signedInId = ''
    this.pbxState = 'stopped'
    console.log('SIP PN debug: set sipState stopped sign out')
    this.sipState = 'stopped'
    this.sipPn = {}
    ctx.sip.stopWebRTC()
    this.ucState = 'stopped'
    this.resetFailureStateIncludePbxOrUc()
    this.pbxConfig = undefined
    this.ucConfig = undefined
    this.listCustomPage = []
    this.customPageLoadings = {}
    ctx.user.clearStore()
    ctx.contact.clearStore()
    ctx.chat.clearStore()
    this.userExtensionProperties = null
    this.cRecentCalls = []
    this.rcPage = 0
    this.pbxConnectedAt = 0
  }

  @action resetFailureState = () => {
    this.pbxTotalFailure = 0
    this.sipTotalFailure = 0
    this.ucTotalFailure = 0
  }
  @action reconnectPbx = () => {
    this.resetFailureState()
    this.pbxState = 'stopped'
    ctx.authPBX.auth()
  }
  @action reconnectSip = () => {
    const count = ctx.sip.phone?.getSessionCount()
    if (count) {
      console.log(
        `SIP PN debug: can not reconnect sip due to ongoing sessions getSessionCount=${count} sipState=${this.sipState}`,
      )
      return
    }
    console.log('SIP PN debug: set sipState stopped reconnect')
    this.resetFailureState()
    this.sipState = 'stopped'
    ctx.authSIP.auth()
  }

  @action resetFailureStateIncludePbxOrUc = () => {
    this.resetFailureState()
    if (this.pbxLoginFromAnotherPlace) {
      this.pbxLoginFromAnotherPlace = false
      this.showMsgPbxLoginFromAnotherPlace = false
      ctx.authPBX.auth()
      ctx.auth.pbxConnectedAt = 0
    }
    if (this.ucLoginFromAnotherPlace) {
      this.ucLoginFromAnotherPlace = false
      ctx.authUC.auth()
    }
  }

  recentCallsMax: number = 200
  @observable cRecentCalls: RecentCall[] = []
  rcPerPage: number = 15
  rcPage: number = 0
  @observable rcLoading: boolean = false
  @observable rcCount: number = 0
  // recentCallsMax with default 200 and limit 1000
  setRecentCallsMax = async (max: number | string) => {
    const numericMax = Number(max)

    this.recentCallsMax =
      Number.isInteger(numericMax) && numericMax > 0
        ? Math.min(numericMax, 1000)
        : 200

    // update recentCalls if config recentCallsMax changed
    const d = await this.getCurrentDataAsync()
    if (!d) {
      return
    }
    if (d.recentCalls.length > this.recentCallsMax) {
      d.recentCalls.splice(this.recentCallsMax)
      this.rcCount = d.recentCalls.length
      ctx.account.saveAccountsToLocalStorageDebounced()
    }
  }

  rcFirstTimeLoadData = async () => {
    if (this.rcPage === 0) {
      this.rcLoading = true
      const d = this.getCurrentData()
      if (!d) {
        return
      }
      const filteredCalls =
        d?.recentCalls.filter(this.isMatchUserRecentCalls) || []
      const calls = filteredCalls.slice(0, this.rcPerPage) || []
      this.cRecentCalls = calls
      this.rcCount = filteredCalls.length
      this.rcLoading = false
    }
  }
  isMatchUserRecentCalls = (call: RecentCall) => {
    if (call.partyNumber.includes(ctx.contact.callSearchRecents)) {
      return call.id
    }
    return ''
  }
  rcSearchRecentCall = async () => {
    const d = this.getCurrentData()
    if (!d) {
      return
    }
    this.rcPage = 0
    this.rcLoading = true
    this.cRecentCalls = []
    const filteredCalls =
      d?.recentCalls.filter(this.isMatchUserRecentCalls) || []
    this.cRecentCalls = filteredCalls.slice(0, this.rcPerPage)
    this.rcCount = filteredCalls.length
    this.rcLoading = false
  }
  rcLoadMore = () => {
    this.rcLoading = true
    const d = this.getCurrentData()
    if (!d) {
      return
    }
    this.rcPage++
    const calls =
      d?.recentCalls
        .filter(this.isMatchUserRecentCalls)
        .slice(
          this.rcPerPage * this.rcPage,
          this.rcPerPage * (this.rcPage + 1),
        ) || []
    this.cRecentCalls = [...this.cRecentCalls, ...calls]
    this.rcLoading = false
  }
  pushRecentCall = async (call: CallHistoryInfo) => {
    const d = await this.getCurrentDataAsync()
    if (!d) {
      return
    }

    d.recentCalls = [call, ...d.recentCalls]
    this.cRecentCalls = [call, ...this.cRecentCalls]
    if (d.recentCalls.length > this.recentCallsMax) {
      d.recentCalls.splice(this.recentCallsMax)
      this.cRecentCalls.splice(this.recentCallsMax)
    }
    this.rcCount = d.recentCalls.length
    ctx.account.saveAccountsToLocalStorageDebounced()
  }

  updatePartyNameRecentCall = async (
    fragment: Pick<Call, 'partyNumber' | 'partyName'>,
  ) => {
    const d = await this.getCurrentDataAsync()
    if (!d?.recentCalls?.length) {
      return
    }
    d.recentCalls
      .filter(c => c.partyNumber === fragment.partyNumber)
      .forEach(c => Object.assign(c, fragment))
    ctx.account.saveAccountsToLocalStorageDebounced()
  }

  savePbxBuddyList = async (pbxBuddyList: {
    screened: boolean
    users: (UcBuddy | UcBuddyGroup)[]
  }) => {
    const d = await this.getCurrentDataAsync()
    if (!d) {
      return
    }
    d.pbxBuddyList = pbxBuddyList
    ctx.account.saveAccountsToLocalStorageDebounced()
  }

  alreadyHandleDeepLinkMakeCall = false
  clearUrlParams = () => {
    this.alreadyHandleDeepLinkMakeCall = false
    clearUrlParams()
  }

  handleUrlParams = async () => {
    const urlParams = await getUrlParams()
    if (!urlParams) {
      return false
    }
    const { _wn, host, phone_idx, port, tenant, user, password, number } =
      urlParams
    const a = await ctx.account.findPartial({
      pbxUsername: user,
      pbxTenant: tenant,
      pbxHostname: host,
      pbxPort: port,
    })
    // handle deep link: make call from phoneappli app
    if (number) {
      // prevent double start call and check list account
      if (this.alreadyHandleDeepLinkMakeCall || !ctx.account.accounts.length) {
        return true
      }
      this.alreadyHandleDeepLinkMakeCall = true

      // checking user login
      const isUserLoginValid = port && tenant && user && host
      if (isUserLoginValid) {
        // checking user is current user or not
        if (!(this.signedInId && this.signedInId === a?.id)) {
          if (this.signedInId) {
            this.signOut()
          }
          const signed = a
            ? await this.signIn(a, true)
            : await ctx.auth.autoSignInFirstAccount()
          if (!signed) {
            this.clearUrlParams()
            return true
          }
        }
      } else {
        // checking current user is first account or user already login
        if (
          !this.signedInId ||
          this.signedInId !== ctx.account.accounts[0]?.id
        ) {
          if (this.signedInId) {
            this.signOut()
          }
          const success = await ctx.auth.autoSignInFirstAccount()
          if (!success) {
            this.clearUrlParams()
            return true
          }
        }
      }
      // checking phoneappli is enabled
      if (!ctx.auth.phoneappliEnabled()) {
        this.clearUrlParams()
        return true
      }
      await this.waitSip()
      // handle transfer call from deep link
      const cs = RnStacker.stacks[RnStacker.stacks.length - 1]
      if (
        ctx.call.calls.length &&
        (cs.name === 'PageCallTransferChooseUser' ||
          cs.name === 'PageCallTransferDial')
      ) {
        ctx.call.getOngoingCall()?.transferAttended(number)
        this.clearUrlParams()
        return true
      }

      // make sure audio engine active before start call
      // https://stackoverflow.com/a/60572329/25021683
      if (isIos) {
        await waitForActiveAppState()
        await waitTimeout(100)
      }

      // handle start call
      ctx.call.startCall(number)
      this.clearUrlParams()
      return true
    }
    //
    // handle deep link: update account (try to keep old logic)
    if (
      Object.keys(ctx.call.callkeepMap).length ||
      ctx.sip.phone?.getSessionCount() ||
      ctx.call.calls.length
    ) {
      return false
    }
    if (!tenant || !user) {
      return false
    }
    //
    let phoneIdx = parseInt(phone_idx)
    if (!phoneIdx || phoneIdx <= 0 || phoneIdx > 4) {
      phoneIdx = 4
    }
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
      const d = await ctx.account.findDataWithDefault(a)
      if (_wn) {
        d.accessToken = _wn
      }
      //
      ctx.account.upsertAccount(a)
      if (a.pbxPassword || d.accessToken) {
        this.signIn(a)
      } else {
        ctx.nav.goToPageAccountUpdate({ id: a.id })
      }
      return true
    }
    //
    const newA = {
      ...ctx.account.genEmptyAccount(),
      pbxTenant: tenant,
      pbxUsername: user,
      pbxPassword: password,
      pbxHostname: host,
      pbxPort: port,
      pbxPhoneIndex: `${phoneIdx}`,
    }
    const d = await ctx.account.findDataWithDefault(newA)
    //
    ctx.account.upsertAccount(newA)
    if (newA.pbxPassword || d.accessToken) {
      this.signIn(newA)
    } else {
      ctx.nav.goToPageAccountUpdate({ id: newA.id })
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
    const acc = await ctx.account.findByPn(n)
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
  phoneappliEnabled = () =>
    !isWeb &&
    (this.userExtensionProperties?.phoneappli ||
      ctx.auth.getCurrentData()?.phoneappliEnabled)
  userExtensionProperties: null | {
    id: string
    name: string
    language: string
    phoneappli: boolean
    phones: {
      id: string
      type: string
    }[]
  } = null

  reconnectAndWaitSip = async () => {
    ctx.auth.reconnectSip()
    await this.waitSip()
  }

  private wait = (
    fn: Function,
    name: 'pbxState' | 'sipState' | 'ucState',
    time = 10000,
  ) => {
    if (ctx.auth[name] === 'success') {
      fn(true)
      return
    }
    const at = Date.now()
    const id = BackgroundTimer.setInterval(() => {
      if (ctx.auth[name] === 'success') {
        BackgroundTimer.clearInterval(id)
        fn(true)
      } else if (Date.now() - at > time) {
        BackgroundTimer.clearInterval(id)
        fn(false)
      }
    }, 500)
  }

  waitPbx = (time?: number) => new Promise(r => this.wait(r, 'pbxState', time))
  waitSip = (time?: number) => new Promise(r => this.wait(r, 'sipState', time))
  waitUc = (time?: number) => new Promise(r => this.wait(r, 'ucState', time))
}

ctx.auth = new AuthStore()
