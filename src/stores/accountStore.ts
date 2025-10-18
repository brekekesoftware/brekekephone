import { debounce, uniqBy } from 'lodash'
import { action, computed, observable, runInAction } from 'mobx'
import { v4 as newUuid } from 'uuid'

import type {
  MFACheck,
  MFACheckRes,
  MFADelete,
  MFADeleteRes,
  MFADeviceTokenCreate,
  MFADeviceTokenCreateRes,
  MFAStart,
  MFAStartRes,
  UcBuddy,
  UcBuddyGroup,
} from '#/brekekejs'
import { RnAsyncStorage } from '#/components/Rn'
import { currentVersion, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { compareSemVer } from '#/stores/debugStore'
import { intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { arrToMap } from '#/utils/arrToMap'
import { BrekekeUtils, defaultRingtone } from '#/utils/BrekekeUtils'
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

type DeviceTokenInfo = {
  createdAt: number
  checkedAt?: number
} & Record<MFAStorageKey, string>

type MFAInfo = {
  verified: boolean
  expire?: number
  deviceToken?: DeviceTokenInfo
}

export type MFAStorageKey = `br+dtoken+${string}+${string}`

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

  private keySessionMFA: string = ''

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
    ringtone: defaultRingtone,
    pbxRingtone: defaultRingtone,
  })

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
  @action removeAccount = (id: string) => {
    const a = this.accounts.find(_ => _.id === id)
    this.accounts = this.accounts.filter(_ => _.id !== id)
    this.saveAccountsToLocalStorageDebounced()
    if (a) {
      a.pushNotificationEnabled = false
      ctx.pnToken.sync(a, {
        noUpsert: true,
      })
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
    const newD = {
      id: getAccountUniqueId(a),
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

  removeMFA = async (a: AccountUnique) => {
    const d = await this.findData(a)
    if (!d) {
      return
    }
    if (d.mfa) {
      d.mfa = { verified: false }
    }
  }

  updateTokenToAccountData = async (
    a: AccountUnique,
    res: MFADeviceTokenCreateRes,
  ) => {
    const d = await this.findData(a)
    if (!d) {
      return
    }

    const status = res.status === 'OK'
    const key = this.getMFAKey(a.pbxTenant, a.pbxUsername)

    if (!d.mfa) {
      d.mfa = { verified: status }
    } else {
      d.mfa.verified = status
    }

    if (status) {
      const now = Date.now()
      if (res.expiration_time) {
        d.mfa.expire = res.expiration_time
      }
      if (d.mfa.deviceToken) {
        d.mfa.deviceToken.checkedAt = now
      } else {
        const i: DeviceTokenInfo = {
          createdAt: now,
          [key]: res.token ?? '',
        } as DeviceTokenInfo
        d.mfa.deviceToken = { ...i }
      }
    } else {
      d.mfa.deviceToken = undefined
      d.mfa.expire = undefined
      d.mfa.verified = false
    }

    this.saveAccountsToLocalStorageDebounced()
  }

  getMFAKey = (tenant: string, user: string): MFAStorageKey =>
    `br+dtoken+${tenant}+${user}`

  getMFAToken = async (a: AccountUnique) => {
    const d = await this.findData(a)
    if (!d) {
      return ''
    }
    const key = this.getMFAKey(a.pbxTenant, a.pbxUsername)
    return d.mfa?.deviceToken?.[key] || ''
  }

  findMFAData = async (a: AccountUnique) => await this.findData(a)

  createMFADeviceToken = async (p: MFADeviceTokenCreate, ca: Account) => {
    try {
      const o = { options: {}, ...p }
      const res = await ctx.pbx.client?.call_pal('device_token/create', o)
      if (res && res.status === 'OK') {
        this.updateTokenToAccountData(ca, res)
        return
      }
    } catch (err) {
      console.log(' Acount store: device token handle: ', err)
    }
  }

  checkMFADeviceToken = async (p: MFADeviceTokenCreate, ca: Account) => {
    try {
      const param = { token: await ctx.account.getMFAToken(ca), ...p }
      const res = await ctx.pbx.client?.call_pal('device_token/check', param)
      if (res && res.status === 'OK') {
        ctx.account.updateTokenToAccountData(ca, res)
      } else {
        // TODO: When MFA is in progress, how should an incoming call be handled?

        console.log(' Acount store: nav to 2FA')
        ctx.nav.goToPage2StepVarification({
          tenant: ca.pbxTenant,
          user: ca.pbxUsername,
        })
      }
    } catch (err) {
      console.log('Acount store: check device token handle: ', err)
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
        if (res.none) {
          ctx.nav.backToPageContactUsers()
          return 'none'
        }
        this.keySessionMFA = res.sess_key
        return true
      }
    } catch (err) {
      console.log('Acount store: mfaStart: ', err)
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
      if (!res) {
        return false
      }
      return res.status === 'OK'
    } catch (err) {
      console.log('Acount store: mfaCheck: ', err)
    }
    return false
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
      if (!res || res.status === 'NO_SESSION') {
        return false
      }
      this.keySessionMFA = ''
      return res.status === 'OK'
    } catch (err) {
      console.log(' Acount store: mfaStart: ', err)
    }

    return false
  }

  handleMFA = async (ca: Account) => {
    const d = await ctx.account.findDataWithDefault(ca)
    const p = {
      tenant: ca.pbxTenant,
      user: ca.pbxUsername,
      ip_address: await getPublicIp(),
      user_agent: isWeb ? navigator.userAgent : 'react-native',
    }
    if (!d.mfa?.verified) {
      this.createMFADeviceToken(p, ca)
    } else {
      this.checkMFADeviceToken(p, ca)
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
}

type LastSignedInId = {
  id: string
  at: number
  version: string
  logoutPressed?: boolean
  uptime?: number
  autoSignInBrekekePhone?: boolean
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
