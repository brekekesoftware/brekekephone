import jsonStableStringify from 'json-stable-stringify'
import { debounce, uniqBy } from 'lodash'
import { action, computed, observable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { v4 as newUuid } from 'uuid'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { SyncPnToken } from '../api/syncPnToken'
import { RnAsyncStorage } from '../components/Rn'
import { currentVersion } from '../components/variables'
import { ParsedPn } from '../utils/PushNotification-parse'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import { waitTimeout } from '../utils/waitTimeout'
import { compareSemVer } from './debugStore'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'

let resolveFn: Function | undefined
const profilesLoaded = new Promise(resolve => {
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
}

class AccountStore {
  @observable appInitDone = false
  @observable pnSyncLoadingMap: { [k: string]: boolean } = {}
  waitStorageLoaded = () => profilesLoaded

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
    let x: TAccountDataInStorage | undefined
    if (arr && !Array.isArray(arr)) {
      try {
        x = JSON.parse(arr)
      } catch (err) {
        x = undefined
      }
    }
    if (x) {
      let { profileData, profiles } = x
      if (Array.isArray(x)) {
        // Lower version compatible
        profiles = x
        profileData = []
      }
      // Set tenant to '-' if empty
      profiles.forEach(a => {
        a.pbxTenant = a.pbxTenant || '-'
      })
      runInAction(() => {
        this.accounts = profiles.filter(a => a.id && a.pbxUsername)
        if (profiles.length !== this.accounts.length) {
          console.error(
            'loadAccountsFromLocalStorage error missing id or pbxUsername',
          )
        }
        this.accountData = uniqBy(profileData, 'id')
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
    // Set tenant to '-' if empty
    this.accounts.forEach(a => {
      a.pbxTenant = a.pbxTenant || '-'
    })
    return this._saveAccountsToLocalStorageDebounced()
  }

  @action upsertAccount = (p: Partial<Account>) => {
    const p1 = this.accounts.find(p0 => p0.id === p.id)
    if (!p1) {
      this.accounts.push(p as Account)
    } else {
      const p0 = { ...p1 } // Clone before assign
      Object.assign(p1, p)
      // TODO handle case change phone index
      if (getAccountUniqueId(p0) !== getAccountUniqueId(p1)) {
        p0.pushNotificationEnabled = false
        SyncPnToken().sync(p0, {
          noUpsert: true,
        })
      } else if (
        typeof p.pushNotificationEnabled === 'boolean' &&
        p.pushNotificationEnabled !== p0.pushNotificationEnabled
      ) {
        p1.pushNotificationEnabledSynced = false
        SyncPnToken().sync(p1, {
          onError: err => {
            RnAlert.error({
              message: intlDebug`Failed to sync Push Notification settings for ${p1.pbxUsername}`,
              err,
            })
            p1.pushNotificationEnabled = p0.pushNotificationEnabled
            p1.pushNotificationEnabledSynced = p0.pushNotificationEnabledSynced
            this.saveAccountsToLocalStorageDebounced()
          },
        })
      }
    }
    this.saveAccountsToLocalStorageDebounced()
  }
  @action removeAccount = (id: string) => {
    const p0 = this.accounts.find(p => p.id === id)
    this.accounts = this.accounts.filter(p => p.id !== id)
    this.saveAccountsToLocalStorageDebounced()
    if (p0) {
      p0.pushNotificationEnabled = false
      SyncPnToken().sync(p0, {
        noUpsert: true,
      })
    }
  }
  getAccountData = (a?: AccountUnique): AccountData | undefined => {
    if (!a || !a.pbxUsername || !a.pbxTenant || !a.pbxHostname || !a.pbxPort) {
      return {
        id: '',
        accessToken: '',
        recentCalls: [],
        recentChats: [],
        pbxBuddyList: undefined,
      }
    }
    const id = getAccountUniqueId(a)
    return this.accountData.find(d => d.id === id)
  }
  getAccountDataAsync = async (a?: AccountUnique): Promise<AccountData> => {
    const d = this.getAccountData(a)
    if (d) {
      return d
    }
    const newD = {
      id: getAccountUniqueId(a!),
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
export const parsedPnToAccountUnique = (n: ParsedPn) => ({
  pbxHostname: n.pbxHostname,
  pbxPort: n.pbxPort,
  pbxTenant: n.tenant,
  pbxUsername: n.to,
})
export const getAccountUniqueId = (a: AccountUnique) =>
  jsonStableStringify({
    u: a.pbxUsername,
    t: a.pbxTenant || '-',
    h: a.pbxHostname,
    p: a.pbxPort,
  })

export const accountStore = new AccountStore()

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
