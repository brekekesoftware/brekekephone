import stringify from 'json-stable-stringify'
import debounce from 'lodash/debounce'
import uniqBy from 'lodash/uniqBy'
import { action, computed, observable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { v4 as newUuid } from 'uuid'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { SyncPnToken } from '../api/syncPnToken'
import { RnAsyncStorage } from '../components/Rn'
import { arrToMap } from '../utils/toMap'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'

let resolveFn: Function | undefined
const profilesLoaded = new Promise(resolve => {
  resolveFn = resolve
})

export type Profile = {
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
  displaySharedContacts?: boolean
  displayOfflineUsers?: boolean
  navIndex: number
  navSubMenus: string[]
}
export type ProfileData = {
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
}

class ProfileStore {
  @observable pnSyncLoadingMap: { [k: string]: boolean } = {}

  @observable profiles: Profile[] = []
  @computed get profilesMap() {
    return arrToMap(this.profiles, 'id', (p: Profile) => p) as {
      [k: string]: Profile
    }
  }
  @observable profileData: ProfileData[] = []
  @observable profilesLoadedObservable = false
  profilesLoaded = () => profilesLoaded
  genEmptyProfile = (): Profile => ({
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
  loadProfilesFromLocalStorage = async () => {
    const arr = await RnAsyncStorage.getItem('_api_profiles')
    let x: TProfileDataInStorage | undefined
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
      runInAction(() => {
        this.profiles = profiles
        this.profileData = uniqBy(profileData, 'id') as unknown as ProfileData[]
      })
    }
    resolveFn?.()
    resolveFn = undefined
    this.profilesLoadedObservable = true
  }
  saveProfilesToLocalStorage = async () => {
    try {
      const { profiles, profileData } = this
      await RnAsyncStorage.setItem(
        '_api_profiles',
        JSON.stringify({ profiles, profileData }),
      )
    } catch (err) {
      RnAlert.error({
        message: intlDebug`Failed to save accounts to local storage`,
        err: err as Error,
      })
    }
  }
  @action upsertProfile = (p: Partial<Profile>) => {
    const p1 = this.profiles.find(p0 => p0.id === p.id)
    if (!p1) {
      this.profiles.push(p as Profile)
    } else {
      const p0 = { ...p1 } // Clone before assign
      Object.assign(p1, p)
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
            this.saveProfilesToLocalStorage()
          },
        })
      }
    }
    this.saveProfilesToLocalStorage()
  }
  @action removeProfile = (id: string) => {
    const p0 = this.profiles.find(p => p.id === id)
    this.profiles = this.profiles.filter(p => p.id !== id)
    this.saveProfilesToLocalStorage()
    if (p0) {
      p0.pushNotificationEnabled = false
      SyncPnToken().sync(p0, {
        noUpsert: true,
      })
    }
  }
  getProfileData = (p?: Profile) => {
    if (!p || !p.pbxUsername || !p.pbxTenant || !p.pbxHostname || !p.pbxPort) {
      return {
        id: '',
        accessToken: '',
        recentCalls: [],
        recentChats: [],
        pbxBuddyList: undefined,
      }
    }
    const id = getAccountUniqueId(p)
    const d = this.profileData.find(_ => _.id === id) || {
      id,
      accessToken: '',
      recentCalls: [],
      recentChats: [],
      pbxBuddyList: undefined,
    }
    this.updateProfileDataDebounced(d)
    return d
  }
  updateProfileDataDebounced = debounce(
    (d: ProfileData) => {
      if (d.id === this.profileData[0]?.id) {
        return
      }
      const arr = [d, ...this.profileData.filter(d2 => d2.id !== d.id)]
      if (arr.length > 20) {
        arr.pop()
      }
      runInAction(() => {
        this.profileData = arr
      })
      this.saveProfilesToLocalStorage()
    },
    300,
    { maxWait: 3000 },
  )
}

export const getAccountUniqueId = (p: Profile) =>
  stringify({
    u: p.pbxUsername,
    t: p.pbxTenant,
    h: p.pbxHostname,
    p: p.pbxPort,
  })

export const profileStore = new ProfileStore()

export type TProfileDataInStorage = {
  profiles: Profile[]
  profileData: ProfileData[]
}
