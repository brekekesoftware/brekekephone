import stringify from 'json-stable-stringify'
import debounce from 'lodash/debounce'
import uniqBy from 'lodash/uniqBy'
import { action, computed, observable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { v4 as uuid } from 'react-native-uuid'

import { SyncPnToken } from '../api/syncPnToken'
import { RnAsyncStorage } from '../components/Rn'
import { arrToMap } from '../utils/toMap'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

let resolveFn: Function | null
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
  pushNotificationEnabled: boolean
  pushNotificationEnabledSynced?: boolean
  parks: string[]
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
    id: uuid(),
    pbxTenant: '',
    pbxUsername: '',
    pbxHostname: '',
    pbxPort: '',
    pbxPassword: '',
    pbxPhoneIndex: '',
    pbxTurnEnabled: false,
    pushNotificationEnabled: Platform.OS === 'web' ? false : true,
    parks: ([] as any) as string[],
    ucEnabled: false,
    navIndex: -1,
    navSubMenus: [],
  })
  loadProfilesFromLocalStorage = async () => {
    let arr = await RnAsyncStorage.getItem('_api_profiles')
    let x: {
      profiles: Profile[]
      profileData: ProfileData[]
    } | null = null
    if (arr && !Array.isArray(arr)) {
      try {
        x = JSON.parse(arr)
      } catch (err) {
        x = null
      }
    }
    if (x) {
      let { profileData, profiles } = x
      if (Array.isArray(x)) {
        profiles = x
        profileData = []
      }
      runInAction(() => {
        this.profiles = profiles
        this.profileData = (uniqBy(
          profileData,
          'id',
        ) as unknown) as ProfileData[]
      })
    }
    if (resolveFn) {
      resolveFn()
      resolveFn = null
      this.profilesLoadedObservable = true
    }
  }
  saveProfilesToLocalStorage = async () => {
    try {
      const { profiles, profileData } = this
      console.log(profiles)

      await RnAsyncStorage.setItem(
        '_api_profiles',
        JSON.stringify({ profiles, profileData }),
      )
    } catch (err) {
      RnAlert.error({
        message: intlDebug`Failed to save accounts to local storage`,
        err,
      })
    }
  }
  @action upsertProfile = (p: Partial<Profile>) => {
    const p1 = this.profiles.find(_ => _.id === p.id)
    if (!p1) {
      this.profiles.push(p as Profile)
    } else {
      const pn1 = p1.pushNotificationEnabled
      const p0 = { ...p1 }
      Object.assign(p1, p)
      const id0 = getAccountUniqueId(p0)
      const id1 = getAccountUniqueId(p1)
      if (id0 !== id1) {
        p0.pushNotificationEnabled = false
        SyncPnToken().sync(p0, {
          onError: () => {
            // Revert on error?
            // Object.assign(p1, p0, {
            //   pushNotificationEnabled: pn0,
            // })
            // this.saveProfilesToLocalStorage()
          },
          noUpsert: true,
        })
      } else if (
        typeof p.pushNotificationEnabled === 'boolean' &&
        p.pushNotificationEnabled !== pn1
      ) {
        p1.pushNotificationEnabledSynced = false
        SyncPnToken().sync(p1)
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
        onError: () => {
          // Revert on error?
          // p0.pushNotificationEnabled = pn0
          // this.profiles = profiles0
          // this.saveProfilesToLocalStorage()
        },
        noUpsert: true,
      })
    }
  }
  getProfileData = (p: Profile | null | undefined) => {
    if (!p || !p.pbxUsername || !p.pbxTenant || !p.pbxHostname || !p.pbxPort) {
      return {
        id: '',
        accessToken: '',
        recentCalls: [],
        recentChats: [],
      }
    }
    const id = getAccountUniqueId(p)
    const d = this.profileData.find(d => d.id === id) || {
      id,
      accessToken: '',
      recentCalls: [],
      recentChats: [],
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

export default new ProfileStore()
