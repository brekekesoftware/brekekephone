import debounce from 'lodash/debounce'
import { action, computed, observable } from 'mobx'
import { AppState } from 'react-native'

import { sip } from '../api/sip'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { getUrlParams } from '../utils/deeplink'
import { ParsedPn, SipPn } from '../utils/PushNotification-parse'
import { authSIP } from './AuthSIP'
import { compareProfile, setAuthStore } from './authStore'
import { callStore } from './callStore'
import { intlDebug } from './intl'
import { Nav } from './Nav'
import { Profile, profileStore } from './profileStore'
import { RnAlert } from './RnAlert'
import { RnAppState } from './RnAppState'

export type ConnectionState = 'stopped' | 'connecting' | 'success' | 'failure'

export class AuthStore {
  @observable sipPn: Partial<SipPn> = {}

  @observable pbxState: ConnectionState = 'stopped'
  @observable pbxTotalFailure = 0
  @observable sipState: ConnectionState = 'stopped'
  @observable sipTotalFailure = 0
  @observable ucState: ConnectionState = 'stopped'
  @observable ucTotalFailure = 0
  @observable ucLoginFromAnotherPlace = false

  pbxShouldAuth = () => {
    return (
      this.signedInId &&
      // !this.sipPn.sipAuth &&
      (this.pbxState === 'stopped' ||
        (this.pbxState === 'failure' &&
          !this.pbxTotalFailure &&
          RnAppState.currentState === 'active'))
    )
  }
  pbxConnectingOrFailure = () => {
    return ['connecting', 'failure'].some(s => s === this.pbxState)
  }

  sipShouldAuth = () => {
    return (
      this.sipState !== 'connecting' &&
      this.sipState !== 'success' &&
      ((this.signedInId && this.sipPn.sipAuth) ||
        (this.pbxState === 'success' &&
          (this.sipState === 'stopped' ||
            (this.sipState === 'failure' &&
              !this.sipTotalFailure &&
              RnAppState.currentState === 'active'))))
    )
  }
  sipConnectingOrFailure = () => {
    return ['connecting', 'failure'].some(s => s === this.sipState)
  }

  ucShouldAuth = () => {
    return (
      this.currentProfile?.ucEnabled &&
      !this.ucLoginFromAnotherPlace &&
      !this.isSignInByNotification &&
      this.pbxState === 'success' &&
      (this.ucState === 'stopped' ||
        (this.ucState === 'failure' &&
          !this.ucTotalFailure &&
          RnAppState.currentState === 'active'))
    )
  }
  ucConnectingOrFailure = () => {
    return (
      this.currentProfile?.ucEnabled &&
      ['connecting', 'failure'].some(s => s === this.ucState)
    )
  }

  isConnFailure = () => {
    return [
      this.pbxState,
      this.sipState,
      this.currentProfile?.ucEnabled && this.ucState,
    ].some(s => s === 'failure')
  }

  findProfile = (p: Partial<Profile>) => {
    return profileStore.profiles.find(p0 => compareProfile(p0, p))
  }

  @observable signedInId = ''
  @computed get currentProfile() {
    return profileStore.profiles.find(p => p.id === this.signedInId) as Profile
  }
  @computed get currentData() {
    return profileStore.getProfileData(this.currentProfile)
  }

  signIn = (id: string) => {
    const p = profileStore.profiles.find(_ => _.id === id)
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
    this.signedInId = p.id
    return true
  }

  signOut = () => {
    callStore.calls.forEach(c => c.hangupWithUnhold())
    if (callStore.calls.length > 0) {
      const intervalStartedAt = Date.now()
      const id = BackgroundTimer.setInterval(() => {
        // TODO show/hide loader
        if (!callStore.calls.length || Date.now() - intervalStartedAt > 3000) {
          BackgroundTimer.clearInterval(id)
          this.resetState()
        }
      }, 1000)
    } else {
      this.resetState()
    }
  }
  @action private resetState = () => {
    this.signedInId = ''
    this.pbxState = 'stopped'
    console.error('SIP PN debug: set sipState stopped sign out')
    this.sipState = 'stopped'
    this.sipPn = {}
    sip.stopWebRTC()
    this.ucState = 'stopped'
    this.resetFailureStateIncludeUcLoginFromAnotherPlace()
  }

  @action resetFailureState = () => {
    this.pbxTotalFailure = 0
    this.sipTotalFailure = 0
    this.ucTotalFailure = 0
  }
  @action reconnectPbx = () => {
    this.resetFailureState()
    this.pbxState = 'stopped'
  }
  @action reconnectSip = () => {
    console.error('SIP PN debug: set sipState stopped reconnect')
    this.resetFailureState()
    this.sipState = 'stopped'
    // Mobx observe not call automatically?
    authSIP.authWithCheck()
  }
  @action resetFailureStateIncludeUcLoginFromAnotherPlace = () => {
    this.resetFailureState()
    this.ucLoginFromAnotherPlace = false
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
    let phoneIdx = parseInt(phone_idx)
    if (!phoneIdx || phoneIdx <= 0 || phoneIdx > 4) {
      phoneIdx = 4
    }
    //
    if (p) {
      if (!p.pbxHostname) {
        p.pbxHostname = host
      }
      if (!p.pbxPort) {
        p.pbxPort = port
      }
      p.pbxPhoneIndex = `${phoneIdx}`
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
      pbxPhoneIndex: `${phoneIdx}`,
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
    console.error(
      `SIP PN debug: signInByNotification pnId=${n.id} token=${n.sipPn.sipAuth}`,
    )
    this.sipPn = n.sipPn
    this.resetFailureState()
    await profileStore.profilesLoaded()
    // Find account for the notification target
    const p = this.findProfile({
      ...n,
      pbxUsername: n.to,
      pbxTenant: n.tenant,
    })
    if (!p?.id) {
      console.error('SIP PN debug: can not find account from notification')
      return false
    }
    // Use isSignInByNotification to disable UC auto sign in for a while
    if (n.isCall) {
      this.isSignInByNotification = true
      this.clearSignInByNotification()
    }
    if (this.signedInId !== p.id) {
      return this.signIn(p.id)
    }
    return false
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

export const authStore = new AuthStore()

setAuthStore(authStore)
