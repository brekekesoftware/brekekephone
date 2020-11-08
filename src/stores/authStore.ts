import debounce from 'lodash/debounce'
import { autorun, computed, observable } from 'mobx'
import { AppState, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'

import sip from '../api/sip'
import { getUrlParams } from '../utils/deeplink'
import { arrToMap } from '../utils/toMap'
import callStore, { uuidFromPN } from './callStore'
import { intlDebug } from './intl'
import Nav from './Nav'
import profileStore, { Profile } from './profileStore'
import RnAlert from './RnAlert'

const compareField = (p1: object, p2: object, field: string) => {
  const v1 = p1[field as keyof typeof p1]
  const v2 = p2[field as keyof typeof p2]
  return !v1 || !v2 || v1 === v2
}
const compareProfile = (p1: { pbxUsername: string }, p2: object) => {
  return (
    p1.pbxUsername && // Must have pbxUsername
    compareField(p1, p2, 'pbxUsername') &&
    compareField(p1, p2, 'pbxTenant') &&
    compareField(p1, p2, 'pbxHostname') &&
    compareField(p1, p2, 'pbxPort')
  )
}

class AuthStore {
  // 'stopped'
  // 'connecting'
  // 'success'
  // 'failure'
  @observable pbxState = 'stopped'
  @observable pbxTotalFailure = 0
  @observable sipState = 'stopped'
  @observable sipTotalFailure = 0
  @observable ucState = 'stopped'
  @observable ucTotalFailure = 0
  @observable ucLoginFromAnotherPlace = false
  @computed get pbxShouldAuth() {
    return (
      !!this.signedInId &&
      (this.pbxState === 'stopped' ||
        (this.pbxState === 'failure' && !this.pbxTotalFailure))
    )
  }
  @computed get pbxConnectingOrFailure() {
    return ['connecting', 'failure'].some(s => s === this.pbxState)
  }
  @computed get sipShouldAuth() {
    return (
      this.pbxState === 'success' &&
      (this.sipState === 'stopped' ||
        (this.sipState === 'failure' && !this.sipTotalFailure))
    )
  }
  @computed get sipConnectingOrFailure() {
    return ['connecting', 'failure'].some(s => s === this.sipState)
  }
  @computed get ucShouldAuth() {
    return (
      this.currentProfile?.ucEnabled &&
      !this.ucLoginFromAnotherPlace &&
      !this.isSignInByNotification &&
      (this.ucState === 'stopped' ||
        (this.ucState === 'failure' && !this.ucTotalFailure))
    )
  }
  @computed get ucConnectingOrFailure() {
    return (
      this.currentProfile?.ucEnabled &&
      ['connecting', 'failure'].some(s => s === this.ucState)
    )
  }
  @computed get shouldShowConnStatus() {
    return (
      this.pbxConnectingOrFailure ||
      this.sipConnectingOrFailure ||
      this.ucConnectingOrFailure
    )
  }
  @computed get isConnFailure() {
    return [
      this.pbxState,
      this.sipState,
      this.currentProfile?.ucEnabled && this.ucState,
    ].some(s => s === 'failure')
  }

  findProfile = (_p: Partial<Profile>) => {
    return profileStore.profiles.find(p => compareProfile(p, _p))
  }
  pushRecentCall = (call: {
    id: string
    incoming: boolean
    answered: boolean
    partyName: string
    partyNumber: string
    duration: number
    created: string
  }) => {
    this.currentData.recentCalls = [call, ...this.currentData.recentCalls]
    if (this.currentData.recentCalls.length > 20) {
      this.currentData.recentCalls.pop()
    }
    profileStore.saveProfilesToLocalStorage()
  }
  @computed get _profilesMap() {
    return arrToMap(profileStore.profiles, 'id', (p: Profile) => p) as {
      [k: string]: Profile
    }
  }
  getProfile = (id: string) => {
    return this._profilesMap[id]
  }

  @observable signedInId = ''
  @computed get currentProfile() {
    return this.getProfile(this.signedInId)
  }
  @computed get currentData() {
    const p = this.currentProfile
    return p && profileStore.getProfileData(p)
  }
  signIn = (id: string) => {
    const p = this.getProfile(id)
    if (!p) {
      return false
    }
    const d = profileStore.getProfileData(p)
    if (!p.pbxPassword && !d.accessToken) {
      Nav().goToPageProfileUpdate({ id: p.id })
      RnAlert.error({
        message: intlDebug`The account password is empty`,
      })
      return true
    }
    if (p.ucEnabled && (!p.ucHostname || !p.ucPort)) {
      Nav().goToPageProfileUpdate({ id: p.id })
      RnAlert.error({
        message: intlDebug`The UC config is missing`,
      })
      return true
    }
    this.signedInId = p.id
    return true
  }

  signOut = () => {
    callStore._calls.forEach(c => c.hangupWithUnhold())
    if (callStore._calls.length > 0) {
      const intervalStartedAt = Date.now()
      const id = window.setInterval(() => {
        // TODO show/hide loader
        if (!callStore._calls.length || Date.now() > intervalStartedAt + 2000) {
          clearInterval(id)
          this._signOut()
        }
      }, 100)
    } else {
      this._signOut()
    }
  }
  _signOut = () => {
    this.signedInId = ''
    this.pbxState = 'stopped'
    this.pbxTotalFailure = 0
    this.sipState = 'stopped'
    sip.disconnect()
    this.sipTotalFailure = 0
    this.ucState = 'stopped'
    this.ucTotalFailure = 0
    this.ucLoginFromAnotherPlace = false
  }

  reconnect = debounce(() => {
    this.pbxTotalFailure = 0
    this.sipTotalFailure = 0
    this.ucTotalFailure = 0
  }, 100)
  reconnectWithUcLoginFromAnotherPlace = debounce(() => {
    this.pbxTotalFailure = 0
    this.sipTotalFailure = 0
    this.ucTotalFailure = 0
    this.ucLoginFromAnotherPlace = false
  }, 100)

  handleUrlParams = async () => {
    await profileStore.profilesLoaded()
    const urlParams = await getUrlParams()
    if (!urlParams) {
      return
    }
    //
    const { _wn, host, phone_idx, port, tenant, user } = urlParams
    if (!tenant || !user) {
      return
    }
    //
    const p = this.findProfile({
      pbxUsername: user,
      pbxTenant: tenant,
      pbxHostname: host,
      pbxPort: port,
    })
    const pbxPhoneIndex = `${parseInt(phone_idx) || 4}`
    //
    if (p) {
      if (!p.pbxHostname) {
        p.pbxHostname = host
      }
      if (!p.pbxPort) {
        p.pbxPort = port
      }
      p.pbxPhoneIndex = pbxPhoneIndex
      const d = profileStore.getProfileData(p)
      if (_wn) {
        d.accessToken = _wn
      }
      //
      profileStore.upsertProfile(p)
      if (p.pbxPassword || d.accessToken) {
        this.signIn(p.id)
      } else {
        Nav().goToPageProfileUpdate({ id: p.id })
      }
      return
    }
    //
    const newP = {
      ...profileStore.genEmptyProfile(),
      pbxTenant: tenant,
      pbxUsername: user,
      pbxHostname: host,
      pbxPort: port,
      pbxPhoneIndex,
    }
    const d = profileStore.getProfileData(newP)
    //
    profileStore.upsertProfile(newP)
    if (d.accessToken) {
      this.signIn(newP.id)
    } else {
      Nav().goToPageProfileUpdate({ id: newP.id })
    }
  }

  @observable isSignInByNotification = false
  clearSignInByNotification = debounce(
    () => {
      // clearSignInByNotification will activate UC login
      // We will only allow UC login when the app is active
      if (AppState.currentState !== 'active') {
        window.setTimeout(this.clearSignInByNotification, 17)
      } else {
        this.isSignInByNotification = false
      }
    },
    10000,
    {
      maxWait: 15000,
    },
  )

  signInByNotification = async (n: {
    to: string
    tenant: string
    isCall: boolean
  }) => {
    this.reconnect()
    await profileStore.profilesLoaded()
    // Find account for the notification target
    const p = this.findProfile({
      ...n,
      pbxUsername: n.to,
      pbxTenant: n.tenant,
    })
    if (!p?.id || !p.pushNotificationEnabled) {
      return false
    }
    // Use isSignInByNotification to disable UC auto sign in for a while
    if (n.isCall) {
      this.isSignInByNotification = true
      this.clearSignInByNotification()
    }
    // In case the app is already signed in
    if (this.signedInId) {
      // Always show notification if the signed in id is another account
      if (this.signedInId !== p.id) {
        return true
      }
      return AppState.currentState !== 'active'
    }
    // Call signIn
    return this.signIn(p.id)
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

// Interval 5 seconds for push kit
if (Platform.OS !== 'web') {
  let pnIntervalId = 0
  const clearPNInterval = () => {
    if (pnIntervalId) {
      clearInterval(pnIntervalId)
      pnIntervalId = 0
    }
  }
  const setPNInterval = () => {
    clearPNInterval()
    pnIntervalId = window.setInterval(() => {
      callStore.recentPNAction = ''
      callStore.recentPNAt = 0
      RNCallKeep.endCall(uuidFromPN)
    }, 5000)
  }
  autorun(() => {
    if (authStore.sipState === 'success') {
      setPNInterval()
    } else {
      clearPNInterval()
    }
  })
}

export { compareProfile }
export default authStore
