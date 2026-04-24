import { debounce, uniqBy } from 'lodash'
import { action, computed, observable, runInAction } from 'mobx'
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
  UcBuddy,
  UcBuddyGroup,
} from '#/brekekejs'
import { RnAsyncStorage } from '#/components/Rn'
import { currentVersion, isAndroid, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debugStore'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { arrToMap } from '#/utils/arrToMap'
import {
  BrekekeUtils,
  defaultRingtone,
  staticRingtones,
} from '#/utils/BrekekeUtils'
import { getConnectionStatus } from '#/utils/getConnectionStatus'
import { jsonSafe } from '#/utils/jsonSafe'
import { jsonStable } from '#/utils/jsonStable'
import { getPublicIp } from '#/utils/publicIpAddress'
import type { ParsedPn } from '#/utils/PushNotification-parse'
import { waitTimeout } from '#/utils/waitTimeout'

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
  verified?: boolean
  pending?: boolean
  sessKey?: string
}

type MFADeviceTokenKey = `br+dtoken+${string}+${string}`

export class AccountStore {
  @observable appInitDone = false
  @observable pnSyncLoadingMap: { [k: string]: boolean } = {}
  waitStorageLoaded = () => storagePromise

  @observable accounts: Account[] = []
  @computed get accountsMap() {
    return arrToMap(this.accounts, 'id', (p: Account) => p) as {
      [k: string]: Account
    }
  }
  @observable accountData: AccountData[] = []

  keySessionMFA: string = ''
  pendingPnEnabled?: boolean

  // In-memory flag: MFA needs to run after all calls end (stores account id, empty = none pending).
  // Not persisted — if app restarts without calls, onPBXConnectionStarted handles MFA normally.
  @observable mfaPendingAfterCallsId = ''
  @action setMFAPendingAfterCallsId = (id: string) => {
    this.mfaPendingAfterCallsId = id
    if (isAndroid && id) {
      const status = getConnectionStatus()
      BrekekeUtils.updateConnectionStatus(status.message, status.isFailure)
    }
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

  @observable ringtonePicker: RingtonePickerType = {}

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
      runInAction(() => {
        this.accounts = accounts.filter(a => a.id && a.pbxUsername)
        if (accounts.length !== this.accounts.length) {
          console.error(
            'loadAccountsFromLocalStorage error missing id or pbxUsername',
          )
        }
        this.accountData = uniqBy(accountData, 'id')
        this.ringtonePicker = ringtonePicker ?? {}
      })
    }
    resolveFn?.()
    resolveFn = undefined
  }
  private saveAccountsToLocalStorage = async () => {
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
  private _saveAccountsToLocalStorageDebounced = debounce(
    this.saveAccountsToLocalStorage,
    100,
    { maxWait: 1000 },
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

  @action upsertAccount = async (p: Partial<Account>) => {
    const a = this.accounts.find(_ => _.id === p.id)

    if (!a) {
      this.accounts.push(p as Account)
      this.saveAccountsToLocalStorageDebounced()
      return
    }

    const clonedA = { ...a } // clone before assign
    // TODO: nav should be in AccountData then we dont need to update here
    const navUpdate = compareAccountPartial(a, p)
      ? null
      : { navIndex: -1, navSubMenus: [] }
    Object.assign(a, p, navUpdate)
    this.saveAccountsToLocalStorageDebounced()
    // check and sync pn token
    const phoneIndexChanged =
      p.pbxPhoneIndex && p.pbxPhoneIndex !== clonedA.pbxPhoneIndex
    const wholeAccountChanged = !compareAccount(clonedA, a)
    if (phoneIndexChanged || wholeAccountChanged) {
      // delete pn token for old phone_index / account
      clonedA.pushNotificationEnabled = false
      clonedA.pushNotificationEnabledSynced = false
      ctx.pnToken.sync(clonedA, {
        noUpsert: true,
      })
      if (wholeAccountChanged) {
        return
      }
    }
    if (
      phoneIndexChanged ||
      (typeof p.pushNotificationEnabled === 'boolean' &&
        p.pushNotificationEnabled !== clonedA.pushNotificationEnabled)
    ) {
      // When MFA verification is needed, revert the PN change — the actual
      // toggle will happen after MFA verify + sync succeeds, triggered by
      // onSwitchEnableNotification in AccountSignInItem.
      if (this.needsMFAForPnSync(a)) {
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
  @action removeAccount = async (id: string) => {
    const a = this.accounts.find(_ => _.id === id)
    this.accounts = this.accounts.filter(_ => _.id !== id)

    this.saveAccountsToLocalStorageDebounced()
    if (a) {
      // Cleanup MFA modal + deferred trigger for this account
      if (ctx.mfa.isShowing(id)) {
        ctx.mfa.reset()
      }
      if (this.mfaPendingAfterCallsId === id) {
        this.setMFAPendingAfterCallsId('')
      }

      const d = await this.findData(a)

      // Delete server MFA session if this account is mid-verification
      if (this.keySessionMFA && d?.mfa?.pending) {
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
      mfa: { verified: false },
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
    runInAction(() => {
      this.accountData = arr
    })
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

    const mfa = (d.mfa ??= { verified: false })
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
      // success case
      mfa.verified = true
      mfa.pending = false
      if (res.expiration_time) {
        mfa.expiration_time = res.expiration_time
      }
      const key = this.getMFAKey(a.pbxTenant, a.pbxUsername)

      mfa.token = Object.assign(mfa.token ?? {}, {
        [key]: res.token,
      })
      mfa.createdAt = now
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
    const mfa = (d.mfa ??= { verified: false })
    mfa.pending = pending
    if (!pending) {
      ctx.mfa.hide()
    }
    await this.saveAccountsToLocalStorageWithoutDebounced()
    if (isAndroid && pending) {
      const status = getConnectionStatus()
      BrekekeUtils.updateConnectionStatus(status.message, status.isFailure)
    }
  }

  isAccountInMFA = (a: AccountUnique): boolean => {
    const d = this.findDataSync(a)
    return !!d?.mfa?.pending
  }

  needsMFAForPnSync = (a: AccountUnique): boolean => {
    const d = this.findDataSync(a)
    if (!d?.mfa?.verified) {
      return false
    }
    const key = this.getMFAKey(a.pbxTenant, a.pbxUsername)
    return !(d.palParams?.['device_token'] || d.mfa?.token?.[key])
  }

  createMFADeviceToken = async (
    p: MFADeviceTokenCreate,
    ca: Account,
    skipReconnect?: boolean,
  ) => {
    try {
      const o = { options: {}, ...p }
      const res = await ctx.pbx.client?.call_pal('device_token/create', o)
      if (!res) {
        return
      }
      await this.updateTokenToAccountData(ca, res)
      const isOK = res.status === 'OK'
      if (isOK && res.token) {
        if (skipReconnect) {
          await this.saveDeviceToken(ca, res.token)
        } else {
          await this.reconnectWithDeviceToken(ca, res.token)
        }
      }
      return isOK
    } catch (err) {
      console.error('[MFA] createMFADeviceToken error:', err)
    }
    return false
  }

  private saveDeviceToken = async (ca: Account, token: string) => {
    const d = await this.findData(ca)
    if (!d) {
      return
    }
    d.palParams = { ...d.palParams, device_token: token }
    await this.saveAccountsToLocalStorageWithoutDebounced()
  }

  private reconnectWithDeviceToken = async (ca: Account, token: string) => {
    await this.saveDeviceToken(ca, token)
    ctx.authPBX.dispose()
    ctx.auth.pbxTotalFailure = 0
    ctx.authPBX.auth()
    console.log('MFA: reconnectWithDeviceToken')
  }

  checkMFADeviceToken = async (p: MFADeviceTokenCheck, ca: Account) => {
    try {
      const res = await ctx.pbx.client?.call_pal('device_token/check', p)
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
      // invalid token → cleanup
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
      const res = await ctx.pbx.client?.call_pal('device_token/delete', p)

      // device_token/delete always return undefined for now,
      // if (res?.status === 'OK' || res?.status === 'NO_ENTRY') {}

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

  mfaStart = async (ca: Account, email?: string, url?: string) => {
    try {
      const param: MFAStart = {
        ip_address: await getPublicIp(),
        tenant: ca.pbxTenant,
        user: ca.pbxUsername,
        email,
        url,
      }
      const res: MFAStartRes | undefined = await ctx.pbx.client?.call_pal(
        'mfa/start',
        param,
      )
      if (!res || res.status === 'FAILED') {
        return false
      }
      if (res.status === 'OK') {
        if (res.type === 'none') {
          await this.setMFAPending(ca, false)
          return 'none'
        }
        this.keySessionMFA = res.sess_key
        const sd = await this.findDataWithDefault(ca)
        const smfa = (sd.mfa ??= { verified: false })
        smfa.sessKey = res.sess_key
        await this.saveAccountsToLocalStorageWithoutDebounced()
        return true
      }
    } catch (err) {
      console.error('mfaStart error:', err)
    }
    return false
  }
  mfaCheck = async (ca: Account, code: string) => {
    try {
      const param: MFACheck = {
        tenant: ca.pbxTenant,
        user: ca.pbxUsername,
        sess_key: this.keySessionMFA,
        code,
      }
      const res: MFACheckRes | undefined = await ctx.pbx.client?.call_pal(
        'mfa/check',
        param,
      )
      return res?.status ?? 'FAILED'
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
      const res: MFADeleteRes | undefined = await ctx.pbx.client?.call_pal(
        'mfa/delete',
        param,
      )
      if (!res) {
        return false
      }
      // NO_SESSION means session already gone — treat as success so resend can proceed
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

    // Restore persisted sessKey after kill app — delete old session before starting new
    const savedSessKey = d.mfa?.sessKey
    if (savedSessKey && !this.keySessionMFA) {
      this.keySessionMFA = savedSessKey
      await this.mfaDelete(ca)
      if (d.mfa) {
        d.mfa.sessKey = undefined
      }
      await this.saveAccountsToLocalStorageWithoutDebounced()
    }

    // Already showing OTP for this account (e.g. syncPnToken triggered first)
    // — skip mfaStart to avoid sending a duplicate OTP email
    if (ctx.mfa.isShowing(ca.id)) {
      return
    }

    // Resuming after call ended — session from previous mfaStart still valid,
    // just re-show the modal without sending another OTP email.
    if (this.keySessionMFA) {
      if (ctx.call.calls.length > 0) {
        ctx.account.setMFAPendingAfterCallsId(ca.id)
        return
      }
      await this.setMFAPending(ca, true)
      ctx.mfa.show(ca.id)
      return
    }

    const result = await this.mfaStart(ca)
    if (result === 'none') {
      return
    }
    if (!result) {
      ctx.toast.show(intl`Unable to log in. Please try again.`, 'error')
      ctx.auth.signOut()
      return
    }
    if (ctx.call.calls.length > 0) {
      ctx.account.setMFAPendingAfterCallsId(ca.id)
      return
    }
    await this.setMFAPending(ca, true)
    ctx.mfa.show(ca.id)
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
