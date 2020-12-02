import stringify from 'json-stable-stringify'
import debounce from 'lodash/debounce'
import uniqBy from 'lodash/uniqBy'
import { action, computed, observable, runInAction } from 'mobx'
import { v4 as uuid } from 'react-native-uuid'

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
    group: boolean
    unread: boolean
    created: string
  }[]
}

class ProfileStore {
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
    pushNotificationEnabled: true,
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
    const p0 = this.profiles.find(_ => _.id === p.id)
    if (!p0) {
      this.profiles.push(p as Profile)
    } else {
      Object.assign(p0, p)
    }
    this.saveProfilesToLocalStorage()
  }
  @action removeProfile = (id: string) => {
    this.profiles = this.profiles.filter(p => p.id !== id)
    this.saveProfilesToLocalStorage()
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
    const id = stringify({
      u: p.pbxUsername,
      t: p.pbxTenant,
      h: p.pbxHostname,
      p: p.pbxPort,
    })
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

export default new ProfileStore()
