import jsonStableStringify from 'json-stable-stringify'
import { debounce, uniqBy } from 'lodash'
import { action, computed, observable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { v4 as newUuid } from 'uuid'

import { SyncPnToken } from '../api/syncPnToken'
import { UcBuddy, UcBuddyGroup } from '../brekekejs'
import { RnAsyncStorage } from '../components/Rn'
import { currentVersion } from '../components/variables'
import { arrToMap } from '../utils/arrToMap'
import { ParsedPn } from '../utils/PushNotification-parse'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { compareSemVer } from './debugStore'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'

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
}

class AccountStore {
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

  genEmptyAccount = (): Account => ({
    id: newUuid(),
    pbxTenant: '',
    pbxUsername: '',
    pbxHostname: '',
    pbxPort: '',
    pbxPassword: '',
    pbxPhoneIndex: '',
    pbxTurnEnabled: false,
    pushNotificationEnabled: Platform.OS === 'web' ? false : true,
    parks: [] as string[],
    parkNames: [] as string[],
    ucEnabled: false,
    navIndex: -1,
    navSubMenus: [],
  })

  loadAccountsFromLocalStorage = async () => {
    const arr = await RnAsyncStorage.getItem('_api_profiles')
    let d: TAccountDataInStorage | undefined
    if (arr && !Array.isArray(arr)) {
      try {
        d = JSON.parse(arr)
      } catch (err) {
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
        JSON.stringify({
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
    // reset navigation if upsert new account
    const navUpdate = compareAccount(a, p)
      ? null
      : { navIndex: -1, navSubMenus: [] }
    Object.assign(a, p, navUpdate)
    this.saveAccountsToLocalStorageDebounced()
    // check and sync pn token
    const phoneIndexChanged =
      p.pbxPhoneIndex && p.pbxPhoneIndex !== clonedA.pbxPhoneIndex
    const wholeAccountChanged =
      getAccountUniqueId(clonedA) !== getAccountUniqueId(a)
    if (phoneIndexChanged || wholeAccountChanged) {
      // delete pn token for old phone_index / account
      clonedA.pushNotificationEnabled = false
      clonedA.pushNotificationEnabledSynced = false
      SyncPnToken().sync(clonedA, {
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
      SyncPnToken().sync(a, {
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
      SyncPnToken().sync(a, {
        noUpsert: true,
      })
    }
  }

  find = async (a: Partial<Account>) => {
    await storagePromise
    // this accept partial compare: only pbxUsername is required to find
    // this behavior is needed because returned data may be incompleted
    // for eg: pn data doesnt have all the fields to compare
    return accountStore.accounts.find(_ => compareAccount(_, a))
  }
  findByPn = (n: ParsedPn) =>
    this.find({
      pbxUsername: n.to,
      pbxTenant: n.tenant,
      pbxHostname: n.pbxHostname,
      pbxPort: n.pbxPort,
    })

  findData = async (a?: AccountUnique) => {
    await storagePromise
    return this.findDataSync(a)
  }
  findDataSync = (a?: AccountUnique) => {
    if (!a || !a.pbxUsername || !a.pbxTenant || !a.pbxHostname || !a.pbxPort) {
      return
    }
    const id = getAccountUniqueId(a)
    return this.accountData.find(d => d.id === id)
  }
  findDataByPn = async (n: ParsedPn) => {
    const a = await this.findByPn(n)
    if (!a) {
      return
    }
    return this.findData(a)
  }

  findDataAsync = async (a: AccountUnique): Promise<AccountData> => {
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
}

export type AccountUnique = Pick<
  Account,
  'pbxUsername' | 'pbxTenant' | 'pbxHostname' | 'pbxPort'
>
export const getAccountUniqueId = (a: AccountUnique) =>
  jsonStableStringify({
    u: a.pbxUsername,
    t: a.pbxTenant || '-',
    h: a.pbxHostname,
    p: a.pbxPort,
  })

// compareAccount in case data is fragment
const compareField = (p1: object, p2: object, field: keyof AccountUnique) => {
  const v1 = p1[field as keyof typeof p1]
  const v2 = p2[field as keyof typeof p2]
  return !v1 || !v2 || v1 === v2
}
export const compareAccount = (p1: { pbxUsername: string }, p2: object) => {
  return (
    p1.pbxUsername && // must have pbxUsername
    compareField(p1, p2, 'pbxUsername') &&
    compareField(p1, p2, 'pbxTenant') &&
    compareField(p1, p2, 'pbxHostname') &&
    compareField(p1, p2, 'pbxPort')
  )
}

export const accountStore = new AccountStore()
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
  } catch (err) {}
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
    await RnAsyncStorage.setItem('lastSignedInId', JSON.stringify(d))
    return
  }
  const j = JSON.stringify({
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
