import { isWeb } from '@rntwsc/rn/core/utils/platform'
import { jsonSafe } from '@rntwsc/shared/json-safe'
import { jsonStable } from '@rntwsc/shared/json-stable'
import { debounce, uniqBy } from '@rntwsc/shared/lodash'
import { makeAutoObservable } from 'mobx'
import { v4 as newUuid } from 'uuid'

import type {
  MFACheck,
  MFACheckRes,
  MFADelete,
  MFADeleteRes,
  MFADeviceTokenCheck,
  MFADeviceTokenCreate,
  MFADeviceTokenCreateRes,
  MFADeviceTokenDelete,
  MFAStart,
  MFAStartRes,
  MfaVerifyStatus,
  Pbx,
  UcBuddy,
  UcBuddyGroup,
} from '#/brekekejs'
import { RnAsyncStorage } from '#/components/rn'
import { currentVersion } from '#/config'
import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debug-store'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { arrToMap } from '#/utils/arr-to-map'
import {
  BrekekeUtils,
  defaultRingtone,
  staticRingtones,
} from '#/utils/brekeke-utils'
import { getPublicIp } from '#/utils/public-ip-address'
import type { ParsedPn } from '#/utils/push-notification-parse'
import { waitTimeout } from '#/utils/wait-timeout'
import { isEmbed } from '#/embed/polyfill'

let resolveFn: Function | undefined
const storagePromise = new Promise(resolve => {
  resolveFn = resolve
})
export type PNOptions = 'APNs' | 'LPC' | undefined
export type Account = {
  id: string
  pbxHostname: string
  pbxPort: string
  pbxTenant: string
  pbxUsername: string
  pbxPassword: string
  pbxPhoneIndex: string // '' | '1' | '2' | '3' | '4'
  pbxTurnEnabled: boolean
  pbxLocalAllUsers?: boolean
  pushNotificationEnabled: boolean
  pushNotificationEnabledSynced?: boolean
  parks?: string[]
  parkNames?: string[]
  ucEnabled: boolean
  displayOfflineUsers?: boolean
  navIndex: number
  navSubMenus: string[]
  ringtone?: string
  pbxRingtone?: string
}
export type AccountData = {
  id: string
  accessToken: string
  recentCalls: {
    id: string
    incoming: boolean
    answered: boolean
    partyName: string
    partyNumber: string
    created: string
    reason?: string
    lineLabel?: string
    lineValue?: string
  }[]
  recentChats: {
    id: string // thread id
    name: string
    text: string
    type: number
    group: boolean
    unread: boolean
    created: string
  }[]
  pbxBuddyList?: {
    screened: boolean
    users: (UcBuddy | UcBuddyGroup)[]
  }
  palParams?: { [k: string]: string }
  userAgent?: string
  pnExpires?: string
  phoneappliEnabled?: boolean
  mfa?: MFAInfo
}

type MFAInfo = {
  token?: Record<MFADeviceTokenKey, string>
  createdAt?: number
  checkedAt?: number
  expiration_time?: number
  required?: boolean
  verified?: boolean
  pending?: boolean
  sessKey?: string
}

type MFADeviceTokenKey = `br+dtoken+${string}+${string}`

// Result of mfaStart():
//   true            — server accepted, OTP session created (type=code/url)
//   'none'          — server says no MFA required for this account
//   { error }       — server returned status=FAILED with a message
//   false           — network/exception, no usable response
type MfaStartResult =
  | true
  | { type: 'code' | 'url'; url?: string }
  | 'none'
  | { error: string }
  | false

type UpsertAccountOptions = {
  allowPnMfaPrompt?: boolean
}

type SetDeviceTokenOptions = {
  reconnect?: boolean
  skipFreshLoginMFA?: boolean
}

let foregroundPromptShown = false

// reset the per-session guard so the prompt can show again in a new app session — called from the
// onDestroyMainActivity handler (same place deeplink resets its first-open flag)
export const resetForegroundPrompt = () => {
  foregroundPromptShown = false
}

export const promptForegroundService = async () => {
  if (!isAndroid) {
    return
  }
  if (foregroundPromptShown) {
    return
  }
  foregroundPromptShown = true
  if ((await RnAsyncStorage.getItem('okForegroundService')) === '1') {
    return
  }
  RnAlert.prompt({
    title: intl`Fallback local connection`,
    message: intl`This option enables a fallback Local Push Connectivity (LPC) connection for real-time call and message delivery from your Brekeke PBX when Firebase Cloud Messaging is unavailable or blocked by your network. Android will show a foreground service notification while this connection is active. You can stop it anytime by turning this option off in Account Settings.`,
    confirmText: intl`OK and remember`,
    dismissText: intl`OK`,
    onConfirm: () => RnAsyncStorage.setItem('okForegroundService', '1'),
  })
}

export class AccountStore {
  constructor() {
    makeAutoObservable(this)
  }

  appInitDone = false
  pnSyncLoadingMap: { [k: string]: boolean } = {}
  waitStorageLoaded = () => storagePromise

  accounts: Account[] = []
  get accountsMap() {
    return arrToMap(this.accounts, 'id', (p: Account) => p) as {
      [k: string]: Account
    }
  }
  accountData: AccountData[] = []

  keySessionMFA: string = ''
  pendingPnAccountId?: string
  pendingPnEnabled?: boolean
  private skipFreshLoginMFAWithDeviceTokenAccountId = ''

  // In-memory flag: MFA needs to run after all calls end (stores account id, empty = none pending).
  // Not persisted - if app restarts without calls, onPBXConnectionStarted handles MFA normally.
  mfaPendingAfterCallsId = ''
  setMFAPendingAfterCallsId = (id: string) => {
    this.mfaPendingAfterCallsId = id
  }
  consumeSkipFreshLoginMFAWithDeviceToken = (a: Account) => {
    if (!isEmbed || this.skipFreshLoginMFAWithDeviceTokenAccountId !== a.id) {
      return false
    }
    this.skipFreshLoginMFAWithDeviceTokenAccountId = ''
    return true
  }

  genEmptyAccount = (): Account => ({
    id: newUuid(),
    pbxTenant: '',
    pbxUsername: '',
    pbxHostname: '',
    pbxPort: '',
    pbxPassword: '',
    pbxPhoneIndex: '',
    pbxTurnEnabled: false,
    pushNotificationEnabled: isWeb ? false : true,
    parks: [] as string[],
    parkNames: [] as string[],
    ucEnabled: false,
    navIndex: -1,
    navSubMenus: [],
    ringtone: staticRingtones[0],
    pbxRingtone: defaultRingtone,
  })

  ringtonePicker: RingtonePickerType = {}

  loadAccountsFromLocalStorage = async () => {
    const arr = await RnAsyncStorage.getItem('_api_profiles')
    let d: TAccountDataInStorage | undefined
    if (arr && !Array.isArray(arr)) {
      try {
        d = JSON.parse(arr)
      } catch (err) {
        void err
        d = undefined
      }
    }
    if (d) {
      let { profileData: accountData, profiles: accounts } = d
      const { ringtonePicker } = d
      if (Array.isArray(d)) {
        // lower version compatible
        accounts = d
        accountData = []
      }
      // set tenant to '-' if empty
      accounts.forEach(a => {
        a.pbxTenant = a.pbxTenant || '-'
        trimAccount(a)
      })
      this.accounts = accounts.filter(a => a.id && a.pbxUsername)
      if (accounts.length !== this.accounts.length) {
        console.error(
          'loadAccountsFromLocalStorage error missing id or pbxUsername',
        )
      }
      this.accountData = uniqBy(accountData, 'id')
      this.ringtonePicker = ringtonePicker ?? {}
    }
    resolveFn?.()
    resolveFn = undefined
  }
  saveAccountsToLocalStorage = async () => {
    try {
      const profiles = this.accounts.filter(a => a.id && a.pbxUsername)
      if (profiles.length !== this.accounts.length) {
        console.error(
          'saveAccountsToLocalStorage error missing id or pbxUsername',
        )
      }
      await RnAsyncStorage.setItem(
        '_api_profiles',
        jsonSafe({
          profiles,
          profileData: this.accountData,
          ringtonePicker: this.ringtonePicker,
        }),
      )
    } catch (err) {
      RnAlert.error({
        message: intlDebug`Failed to save accounts to local storage`,
        err: err as Error,
      })
    }
  }
  _saveAccountsToLocalStorageDebounced = debounce(
    this.saveAccountsToLocalStorage,
    100,
    {
      maxWait: 1000,
    },
  )
  saveAccountsToLocalStorageDebounced = () => {
    // set tenant to '-' if empty
    this.accounts.forEach(a => {
      a.pbxTenant = a.pbxTenant || '-'
      trimAccount(a)
    })
    return this._saveAccountsToLocalStorageDebounced()
  }

  saveAccountsToLocalStorageWithoutDebounced = async () =>
    await this.saveAccountsToLocalStorage()

  hasSignInCredential = (a?: Partial<Account>) =>
    !!a?.pbxPassword || !!this.findDataSync(a as AccountUnique)?.accessToken

  hasPnSyncCredential = (a?: Partial<Account>) => {
    const d = this.findDataSync(a as AccountUnique)
    return (
      !!a?.pbxPassword || !!d?.accessToken || !!d?.palParams?.['device_token']
    )
  }

  // account will start the LPC foreground service: push on + can sign in
  private isFgsEligible = (a?: Partial<Account>) =>
    !!a?.pushNotificationEnabled && this.hasSignInCredential(a)

  @action disableUnsyncedPushNotification = (a?: Account) => {
    if (!a?.pushNotificationEnabled) {
      return
    }
    if (a.pushNotificationEnabledSynced) {
      return
    }
    if (this.findDataSync(a)?.palParams?.['device_token']) {
      return
    }
    a.pushNotificationEnabled = false
    a.pushNotificationEnabledSynced = false
    if (this.pendingPnAccountId === a.id) {
      this.pendingPnAccountId = undefined
      this.pendingPnEnabled = undefined
    }
    this.saveAccountsToLocalStorageDebounced()
  }

  private syncPnTokenWithMfaPrompt = (a: Account) => {
    a.pushNotificationEnabledSynced = false
    if (ctx.auth.signedInId && ctx.auth.signedInId !== a.id) {
      this.saveAccountsToLocalStorageDebounced()
      return Promise.resolve()
    }
    this.pendingPnAccountId = a.id
    this.pendingPnEnabled = true
    this.saveAccountsToLocalStorageDebounced()
    return ctx.pnToken.sync(a, {
      allowMfaPrompt: true,
    })
  }

  @action upsertAccount = async (
    p: Partial<Account>,
    options: UpsertAccountOptions = {},
  ) => {
    const a = this.accounts.find(_ => _.id === p.id)

    if (!a) {
      const newAccount = p as Account
      if (this.isFgsEligible(newAccount)) {
        promptForegroundService()
      }
      this.accounts.push(newAccount)
      if (newAccount.pushNotificationEnabled && options.allowPnMfaPrompt) {
        void this.syncPnTokenWithMfaPrompt(newAccount)
      }
      this.saveAccountsToLocalStorageDebounced()
      return
    }

    const clonedA = { ...a } // clone before assign
    const wasFgsEligible = this.isFgsEligible(clonedA)
    // TODO: nav should be in AccountData then we dont need to update here
    const navUpdate = compareAccountPartial(a, p)
      ? null
      : {
          navIndex: -1,
          navSubMenus: [],
        }
    Object.assign(a, p, navUpdate)
    // prompt only on the transition into eligible (avoids re-prompting on every sync/update)
    if (this.isFgsEligible(a) && !wasFgsEligible) {
      promptForegroundService()
    }
    this.saveAccountsToLocalStorageDebounced()
    // check and sync pn token
    const phoneIndexChanged =
      p.pbxPhoneIndex && p.pbxPhoneIndex !== clonedA.pbxPhoneIndex
    const wholeAccountChanged = !compareAccount(clonedA, a)
    const pushNotificationChanged =
      typeof p.pushNotificationEnabled === 'boolean' &&
      p.pushNotificationEnabled !== clonedA.pushNotificationEnabled
    if (phoneIndexChanged || wholeAccountChanged) {
      // delete pn token for old phone_index / account
      clonedA.pushNotificationEnabled = false
      clonedA.pushNotificationEnabledSynced = false
      const removeOldPnToken = ctx.pnToken.sync(clonedA, {
        noUpsert: true,
      })
      if (wholeAccountChanged) {
        if (a.pushNotificationEnabled) {
          a.pushNotificationEnabledSynced = false
          this.saveAccountsToLocalStorageDebounced()
          if (options.allowPnMfaPrompt) {
            void removeOldPnToken.then(() => this.syncPnTokenWithMfaPrompt(a))
          }
        }
        return
      }
    }
    if (
      options.allowPnMfaPrompt &&
      a.pushNotificationEnabled &&
      !a.pushNotificationEnabledSynced &&
      !phoneIndexChanged &&
      !pushNotificationChanged
    ) {
      void this.syncPnTokenWithMfaPrompt(a)
      return
    }
    if (phoneIndexChanged || pushNotificationChanged) {
      // When MFA verification is needed, revert the PN change — the actual
      // toggle will happen after MFA verify + sync succeeds, triggered by
      // onSwitchEnableNotification in AccountSignInItem.
      if (a.pushNotificationEnabled && this.needsMFAForPnSync(a)) {
        a.pushNotificationEnabled = clonedA.pushNotificationEnabled
        a.pushNotificationEnabledSynced = clonedA.pushNotificationEnabledSynced
        this.saveAccountsToLocalStorageDebounced()
        return
      }
      a.pushNotificationEnabledSynced = false
      ctx.pnToken.sync(a, {
        onError: err => {
          RnAlert.error({
            message: intlDebug`Failed to sync Push Notification settings for ${a.pbxUsername}`,
            err,
          })
          a.pushNotificationEnabled = clonedA.pushNotificationEnabled
          a.pushNotificationEnabledSynced =
            clonedA.pushNotificationEnabledSynced
          this.saveAccountsToLocalStorageDebounced()
        },
      })
    }
  }
  removeAccount = async (id: string) => {
    const a = this.accounts.find(_ => _.id === id)
    this.accounts = this.accounts.filter(_ => _.id !== id)

    this.saveAccountsToLocalStorageDebounced()
    if (a) {
      if (ctx.mfa.isShowing(id)) {
        ctx.mfa.reset()
      }
      if (this.mfaPendingAfterCallsId === id) {
        this.setMFAPendingAfterCallsId('')
      }

      const d = await this.findData(a)

      if (this.keySessionMFA && this.keySessionMFA === d?.mfa?.sessKey) {
        await this.mfaDelete(a)
      }

      // Clear persisted MFA pending/session so it doesn't resurface on recreate
      if (d?.mfa) {
        d.mfa.pending = false
        d.mfa.sessKey = undefined
      }

      a.pushNotificationEnabled = false
      ctx.pnToken.sync(a, {
        noUpsert: true,
      })
      const hasMFAToken =
        d?.palParams?.['device_token'] ||
        (d?.mfa?.verified && d?.mfa?.token && Object.keys(d.mfa.token).length)
      if (hasMFAToken) {
        await this.deleteMFADeviceToken(a)
      }
      this.keySessionMFA = ''
      await this.saveAccountsToLocalStorageWithoutDebounced()
    }
  }

  find = async (a: AccountUnique) => {
    await storagePromise
    return this.accounts.find(_ => compareAccount(_, a))
  }
  findPartial = async (a: Partial<Account>) => {
    await storagePromise
    // this accept partial compare: only pbxUsername is required to find
    // this behavior is needed because returned data may be incompleted
    // for eg: pn data doesnt have all the fields to compare
    return this.accounts.find(_ => compareAccountPartial(_, a))
  }
  findByPn = (n: ParsedPn) =>
    this.findPartial({
      pbxUsername: n.to,
      pbxTenant: n.tenant,
      pbxHostname: n.pbxHostname,
      pbxPort: n.pbxPort,
    })
  findByUniqueId = async (id: string) => {
    await storagePromise
    return this.accounts.find(a => getAccountUniqueId(a) === id)
  }

  findData = async (a?: AccountUnique) => {
    await storagePromise
    return this.findDataSync(a)
  }

  findDataSync = (a?: AccountUnique) => {
    if (!a || !a.pbxUsername || !a.pbxTenant || !a.pbxHostname || !a.pbxPort) {
      return
    }
    return this.accountData.find(d => d.id === getAccountUniqueId(a))
  }
  findDataByPn = async (n: ParsedPn) => {
    const a = await this.findByPn(n)
    if (!a) {
      return
    }
    return this.findData(a)
  }

  findDataWithDefault = async (a: AccountUnique): Promise<AccountData> => {
    // async to use in mobx to not trigger data change in render
    // this method will update the data if not found in storage
    const d = await this.findData(a)
    if (d) {
      return d
    }
    const uniqueId = getAccountUniqueId(a)
    if (!uniqueId) {
      throw new Error('Account unique id is undefined')
    }
    const newD = {
      id: uniqueId,
      accessToken: '',
      recentCalls: [],
      recentChats: [],
      pbxBuddyList: undefined,
      mfa: {
        verified: false,
      },
    }
    await waitTimeout(17)
    this.updateAccountData(newD)
    return newD
  }

  updateAccountData = (d: AccountData) => {
    const arr = [d, ...this.accountData.filter(d2 => d2.id !== d.id)]
    if (arr.length > 20) {
      arr.pop()
    }
    this.accountData = arr
    this.saveAccountsToLocalStorageDebounced()
  }

  updateTokenToAccountData = async (
    a: AccountUnique,
    res: MFADeviceTokenCreateRes,
  ) => {
    const d = await this.findData(a)
    if (!d) {
      return
    }

    const now = Date.now()
    const isOK = res.status === 'OK'

    const mfa = (d.mfa ??= {
      verified: false,
    })
    if (!isOK) {
      Object.assign(mfa, {
        token: undefined,
        expiration_time: undefined,
        verified: false,
      })
    } else {
      if (!res.token) {
        return
      }
      mfa.required = true
      mfa.verified = true
      mfa.pending = false
      mfa.sessKey = undefined
      if (res.expiration_time) {
        mfa.expiration_time = res.expiration_time
      }
      const key = this.getMFAKey(a.pbxTenant, a.pbxUsername)

      mfa.token = Object.assign(mfa.token ?? {}, {
        [key]: res.token,
      })
      mfa.createdAt = now
      this.keySessionMFA = ''
    }

    this.saveAccountsToLocalStorageDebounced()
  }

  getMFAKey = (tenant: string, user: string) => `br+dtoken+${tenant}+${user}`

  getMFAToken = async (a: AccountUnique): Promise<string> => {
    const d = await this.findData(a)
    if (!d) {
      return ''
    }
    const key = this.getMFAKey(a.pbxTenant, a.pbxUsername)
    const token = d.mfa?.token?.[key] || ''
    return token
  }
  setMFAPending = async (ca: AccountUnique, pending: boolean) => {
    const d = await this.findDataWithDefault(ca)
    const mfa = (d.mfa ??= {
      verified: false,
    })
    mfa.pending = pending
    if (!pending) {
      ctx.mfa.hide()
    }
    await this.saveAccountsToLocalStorageWithoutDebounced()
  }

  isAccountInMFA = (a: AccountUnique): boolean => {
    const d = this.findDataSync(a)
    return !!d?.mfa?.pending
  }

  isMFANotRequired = (a: AccountUnique): boolean =>
    this.findDataSync(a)?.mfa?.required === false

  needsMFAForPnSync = (a: AccountUnique): boolean => {
    const d = this.findDataSync(a)
    const key = this.getMFAKey(a.pbxTenant, a.pbxUsername)
    const hasDeviceToken = !!d?.palParams?.['device_token']
    const hasMfaToken = !!d?.mfa?.token?.[key]
    if (d?.mfa?.required === false) {
      console.log(
        `PN MFA debug: needsMFAForPnSync=false user=${a.pbxUsername} reason=mfa-not-required`,
      )
      return false
    }
    if (d?.mfa?.required === true) {
      const needsMFA = !(hasDeviceToken || hasMfaToken)
      console.log(
        `PN MFA debug: needsMFAForPnSync=${needsMFA} user=${a.pbxUsername} reason=mfa-required hasDeviceToken=${hasDeviceToken} hasMfaToken=${hasMfaToken}`,
      )
      return needsMFA
    }
    if (!d?.mfa?.verified) {
      console.log(
        `PN MFA debug: needsMFAForPnSync=false user=${a.pbxUsername} reason=mfa-not-verified`,
      )
      return false
    }
    const needsMFA = !(hasDeviceToken || hasMfaToken)
    console.log(
      `PN MFA debug: needsMFAForPnSync=${needsMFA} user=${a.pbxUsername} hasDeviceToken=${hasDeviceToken} hasMfaToken=${hasMfaToken}`,
    )
    return needsMFA
  }

  private getMfaPalClient = (ca: AccountUnique): Pbx | undefined => {
    const palClient = ctx.mfa.palClient
    return palClient?.accountKey === getAccountUniqueId(ca)
      ? palClient.client
      : ctx.pbx.client
  }

  createMFADeviceToken = async (
    p: MFADeviceTokenCreate,
    ca: Account,
    skipReconnect?: boolean,
  ) => {
    const failMessage = intl`Token creation failed. Please get a new code.`
    try {
      const o = { options: {}, ...p }
      const res = await this.getMfaPalClient(ca)?.call_pal(
        'device_token/create',
        o,
      )
      if (!res) {
        if (isEmbed) {
          ctx.mfa.fail(failMessage, ca)
          return false
        }
        return
      }
      await this.updateTokenToAccountData(ca, res)
      const isOK = res.status === 'OK'
      if (!isOK) {
        if (isEmbed) {
          ctx.mfa.fail(failMessage, ca)
        }
        return false
      }
      if (!res.token) {
        if (isEmbed) {
          // Valid code but token creation failed — surface to embed host.
          ctx.mfa.fail(failMessage, ca)
          return false
        }
        return true
      }
      if (skipReconnect) {
        await this.saveDeviceToken(ca, res.token)
      } else {
        await this.reconnectWithDeviceToken(ca, res.token)
      }
      return true
    } catch (err) {
      console.error('[MFA] createMFADeviceToken error:', err)
      if (isEmbed) {
        ctx.mfa.fail(failMessage, ca)
      }
    }
    return false
  }

  saveDeviceToken = async (ca: Account, token: string) => {
    const d = await this.findData(ca)
    if (!d) {
      return
    }
    d.palParams = {
      ...d.palParams,
      device_token: token,
    }
    await this.saveAccountsToLocalStorageWithoutDebounced()
  }

  reconnectWithDeviceToken = async (ca: Account, token: string) => {
    await this.saveDeviceToken(ca, token)
    ctx.authPBX.dispose()
    ctx.auth.pbxTotalFailure = 0
    ctx.authPBX.auth()
    console.log('MFA: reconnectWithDeviceToken')
  }

  setDeviceToken = async (
    ca: Account,
    token: string,
    options: SetDeviceTokenOptions = {},
  ) => {
    if (!isEmbed) {
      return false
    }

    const deviceToken = token.trim()
    if (!deviceToken) {
      return false
    }

    ca.pbxTenant = ca.pbxTenant || '-'
    await this.findDataWithDefault(ca)
    await this.updateTokenToAccountData(ca, {
      status: 'OK',
      token: deviceToken,
    })
    if (this.mfaPendingAfterCallsId === ca.id) {
      this.setMFAPendingAfterCallsId('')
    }
    if (ctx.mfa.isShowing(ca.id)) {
      ctx.mfa.reset()
    }
    if (options.skipFreshLoginMFA) {
      this.skipFreshLoginMFAWithDeviceTokenAccountId = ca.id
    }
    if (options.reconnect) {
      await this.reconnectWithDeviceToken(ca, deviceToken)
    } else {
      await this.saveDeviceToken(ca, deviceToken)
    }
    return true
  }

  clearDeviceToken = async (ca: Account) => {
    const d = await this.findData(ca)
    if (!d) {
      if (this.skipFreshLoginMFAWithDeviceTokenAccountId === ca.id) {
        this.skipFreshLoginMFAWithDeviceTokenAccountId = ''
      }
      return
    }

    const tenant = ca.pbxTenant || '-'
    const key = this.getMFAKey(tenant, ca.pbxUsername)
    if (d.palParams?.device_token) {
      delete d.palParams.device_token
    }
    if (d.mfa) {
      if (d.mfa.token?.[key]) {
        delete d.mfa.token[key]
      }
      Object.assign(d.mfa, {
        verified: false,
        pending: false,
        sessKey: undefined,
      })
    }
    if (this.skipFreshLoginMFAWithDeviceTokenAccountId === ca.id) {
      this.skipFreshLoginMFAWithDeviceTokenAccountId = ''
    }
    await this.saveAccountsToLocalStorageWithoutDebounced()
  }

  checkMFADeviceToken = async (p: MFADeviceTokenCheck, ca: Account) => {
    try {
      const res = await this.getMfaPalClient(ca)?.call_pal(
        'device_token/check',
        p,
      )
      if (!res) {
        return false
      }
      const isValid = res.status === 'OK'
      const d = await this.findData(ca)
      if (isValid) {
        if (d?.mfa) {
          d.mfa = {
            ...d.mfa,
            checkedAt: Date.now(),
          }
          this.saveAccountsToLocalStorageDebounced()
        }
        return true
      }
      if (d?.palParams?.device_token) {
        console.log('MFA: removing invalid device_token')
        delete d.palParams.device_token
      }
      if (d?.mfa) {
        d.mfa.verified = false
      }
      this.saveAccountsToLocalStorageDebounced()
      return false
    } catch (err) {
      console.error('[MFA] checkMFADeviceToken error:', err)
      return false
    }
  }

  deleteMFADeviceToken = async (ca: Account) => {
    try {
      const p: MFADeviceTokenDelete = {
        tenant: ca.pbxTenant,
        user: ca.pbxUsername,
      }
      const res = await this.getMfaPalClient(ca)?.call_pal(
        'device_token/delete',
        p,
      )

      const d = await this.findData(ca)
      if (!d) {
        return
      }
      if (d.mfa) {
        Object.assign(d.mfa, {
          token: undefined,
          expiration_time: undefined,
          verified: false,
          pending: false,
        })
      }
      if (d.palParams?.['device_token']) {
        delete d.palParams['device_token']
      }

      await this.saveAccountsToLocalStorageWithoutDebounced()
      return res?.status === 'OK'
    } catch (err) {
      console.error('[MFA] deleteMFADeviceToken error:', err)
      return false
    }
  }

  mfaStart = async (ca: Account): Promise<MfaStartResult> => {
    try {
      const param: MFAStart = {
        ip_address: await getPublicIp(),
        tenant: ca.pbxTenant,
        user: ca.pbxUsername,
      }
      const res: MFAStartRes | undefined = await this.getMfaPalClient(
        ca,
      )?.call_pal('mfa/start', param)
      if (!res) {
        return false
      }
      if (res.status === 'FAILED') {
        return {
          error: res.message || intl`MFA setup failed`,
        }
      }
      if (res.status === 'OK') {
        if (res.type === 'none') {
          const d = await this.findDataWithDefault(ca)
          const mfa = (d.mfa ??= { verified: false })
          Object.assign(mfa, {
            required: false,
            verified: false,
            pending: false,
            sessKey: undefined,
          })
          if (ctx.mfa.accountId === ca.id) {
            ctx.mfa.hide()
          }
          await this.saveAccountsToLocalStorageWithoutDebounced()
          return 'none'
        }
        this.keySessionMFA = res.sess_key
        const sd = await this.findDataWithDefault(ca)
        const smfa = (sd.mfa ??= { verified: false })
        smfa.required = true
        smfa.sessKey = res.sess_key
        await this.saveAccountsToLocalStorageWithoutDebounced()
        return isEmbed ? { type: res.type, url: res.url } : true
      }
    } catch (err) {
      console.error('mfaStart error:', err)
    }
    return false
  }
  mfaCheck = async (ca: Account, code: string): Promise<MfaVerifyStatus> => {
    try {
      const param: MFACheck = {
        tenant: ca.pbxTenant,
        user: ca.pbxUsername,
        sess_key: this.keySessionMFA,
        code,
      }
      const res: MFACheckRes | undefined = await this.getMfaPalClient(
        ca,
      )?.call_pal('mfa/check', param)
      if (
        res?.status === 'OK' ||
        res?.status === 'WRONG_CODE' ||
        res?.status === 'NO_SESSION'
      ) {
        return res.status
      }
    } catch (err) {
      console.error('[MFA] mfaCheck error:', err)
    }
    return 'FAILED'
  }
  mfaDelete = async (ca: Account) => {
    try {
      const param: MFADelete = {
        tenant: ca.pbxTenant,
        user: ca.pbxUsername,
        sess_key: this.keySessionMFA,
      }
      const res: MFADeleteRes | undefined = await this.getMfaPalClient(
        ca,
      )?.call_pal('mfa/delete', param)
      if (!res) {
        return false
      }
      // NO_SESSION means session already gone - treat as success so resend can proceed
      this.keySessionMFA = ''
      return res.status === 'OK' || res.status === 'NO_SESSION'
    } catch (err) {
      console.error('[MFA] mfaDelete error:', err)
    }

    return false
  }

  handleMFA = async (ca: Account) => {
    const d = await ctx.account.findDataWithDefault(ca)
    // Reset stale pending state from a previous crash/kill during MFA
    if (d.mfa?.pending && !d.mfa?.verified) {
      d.mfa.pending = false
      await this.saveAccountsToLocalStorageWithoutDebounced()
    }

    // Already showing OTP for this account (e.g. syncPnToken triggered first)
    // - user is actively verifying, skip everything else to avoid touching
    // active session (no mfaDelete, no duplicate mfaStart, no verified check).
    if (ctx.mfa.isShowing(ca.id)) {
      return
    }

    if (d.mfa?.verified) {
      const t = await ctx.account.getMFAToken(ca)
      if (t) {
        const p = {
          tenant: ca.pbxTenant,
          user: ca.pbxUsername,
          ip_address: await getPublicIp(),
          user_agent: isWeb ? navigator.userAgent : 'react-native',
          token: t,
        }
        const c = await this.checkMFADeviceToken(p, ca)
        console.log(`MFA: ${c ? 'valid' : 'invalid'} device token`)
        if (c) {
          if (!d?.palParams?.['device_token']) {
            await this.reconnectWithDeviceToken(ca, t)
          }
          return
        }
      }
    }

    // Restore persisted sessKey after kill app - delete old session before starting new
    const savedSessKey = d.mfa?.sessKey
    if (savedSessKey && !this.keySessionMFA) {
      this.keySessionMFA = savedSessKey
      await this.mfaDelete(ca)
      // Force clear - we want fresh mfaStart regardless of mfaDelete result.
      // On success, mfaDelete already sets keySessionMFA=''. On failure (!res),
      // need explicit clear to avoid falling into `if (keySessionMFA)` reuse block.
      this.keySessionMFA = ''
      if (d.mfa) {
        d.mfa.sessKey = undefined
      }
      await this.saveAccountsToLocalStorageWithoutDebounced()
    }

    // Resuming after call ended - session from previous mfaStart still valid,
    // just re-show the modal without sending another OTP email.
    // Active-call guard still needed here: this branch returns before reaching
    // the pre-mfaStart guard below.
    if (this.keySessionMFA && this.keySessionMFA === d.mfa?.sessKey) {
      if (ctx.call.calls.length > 0) {
        ctx.account.setMFAPendingAfterCallsId(ca.id)
        return
      }
      await this.setMFAPending(ca, true)
      ctx.mfa.show(ca.id)
      return
    }

    // Defer fresh mfaStart while a call is active. Sending OTP now would expire
    // before the call ends, and a transient pbx.client (e.g. mid PBX reconnect)
    // can throw inside mfaStart - the false-result path below would then sign
    // the user out and BYE the active call.
    if (ctx.call.calls.length > 0) {
      console.log(
        `MFA debug: defer (${ctx.call.calls.length} active call) for ca=${ca.id}`,
      )
      ctx.account.setMFAPendingAfterCallsId(ca.id)
      return
    }

    const result = await this.mfaStart(ca)
    if (result === 'none') {
      return
    }
    // Network/exception failure - no usable response from server
    if (result === false) {
      ctx.toast.show(intl`Unable to log in. Please try again.`, 'error')
      ctx.auth.signOut()
      return
    }
    // Server returned FAILED with message (e.g. account has no email).
    // Show modal with error so user understands why; they cancel to sign out.
    if (typeof result === 'object' && 'error' in result) {
      await this.setMFAPending(ca, true)
      ctx.mfa.show(ca.id, {
        error: result.error,
      })
      return
    }
    await this.setMFAPending(ca, true)
    if (typeof result === 'object') {
      ctx.mfa.show(ca.id, { type: result.type, url: result.url })
    } else {
      ctx.mfa.show(ca.id)
    }
  }
}

export type AccountUnique = Pick<
  Account,
  'pbxUsername' | 'pbxTenant' | 'pbxHostname' | 'pbxPort'
>
export const getAccountUniqueId = (a: AccountUnique) =>
  jsonStable({
    u: a.pbxUsername,
    t: a.pbxTenant || '-',
    h: a.pbxHostname,
    p: a.pbxPort,
  })
export const compareAccount = (a: AccountUnique, b: AccountUnique) =>
  getAccountUniqueId(a) === getAccountUniqueId(b)

// compareAccount in case data is fragment
const compareFalsishField = (
  p1: object,
  p2: object,
  field: keyof AccountUnique,
) => {
  const v1 = p1[field as keyof typeof p1]
  const v2 = p2[field as keyof typeof p2]
  return !v1 || !v2 || v1 === v2
}
export const compareAccountPartial = (
  p1: { pbxUsername: string },
  p2: object,
) =>
  p1.pbxUsername && // must have pbxUsername
  compareFalsishField(p1, p2, 'pbxUsername') &&
  compareFalsishField(p1, p2, 'pbxTenant') &&
  compareFalsishField(p1, p2, 'pbxHostname') &&
  compareFalsishField(p1, p2, 'pbxPort')

ctx.account = new AccountStore()
export type RecentCall = AccountData['recentCalls'][0]

type TAccountDataInStorage = {
  profiles: Account[]
  profileData: AccountData[]
  ringtonePicker: RingtonePickerType
}

type LastSignedInId = {
  id: string
  at: number
  version: string
  logoutPressed?: boolean
  uptime?: number
  autoSignInBrekekePhone?: boolean
}

export type RingtonePickerType = {
  [fileName: string]: boolean
}

export const getLastSignedInId = async (
  checkAutoSignInBrekekePhone?: boolean,
) => {
  const j = await RnAsyncStorage.getItem('lastSignedInId')
  let d = undefined as any as LastSignedInId
  try {
    d = j && JSON.parse(j)
  } catch (err) {
    void err
  }
  if (d && 'h' in d) {
    // backward compatibility json is the unique account id
    d = j as any as LastSignedInId
  }
  if (!d?.id) {
    d = {
      id: (d || j || '') as any as string,
      at: Date.now(),
      version: currentVersion,
    }
  }
  if (!checkAutoSignInBrekekePhone) {
    return d
  }
  if (d.logoutPressed || compareSemVer(currentVersion, d.version) > 0) {
    d.autoSignInBrekekePhone = false
    return d
  }
  d.uptime = await BrekekeUtils.systemUptimeMs()
  d.autoSignInBrekekePhone = d.uptime > 0 && d.uptime > Date.now() - d.at
  return d
}
export const saveLastSignedInId = async (id: string | false) => {
  if (id === false) {
    const d = await getLastSignedInId()
    d.logoutPressed = true
    await RnAsyncStorage.setItem('lastSignedInId', jsonSafe(d))
    return
  }
  const j = jsonSafe({
    id,
    at: Date.now(),
    version: currentVersion,
  })
  await RnAsyncStorage.setItem('lastSignedInId', j)
}

const trimAccount = (a: Account) => {
  a.pbxHostname = trim(a.pbxHostname)
  a.pbxPort = trim(a.pbxPort)
  a.pbxTenant = trim(a.pbxTenant)
  a.pbxUsername = trim(a.pbxUsername)
  a.pbxPassword = trim(a.pbxPassword)
  a.pbxPhoneIndex = trim(a.pbxPhoneIndex)
}
const trim = (v?: string) => v?.trim?.() || ''
