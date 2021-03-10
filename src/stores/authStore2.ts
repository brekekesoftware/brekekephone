import debounce from 'lodash/debounce'
import { action, computed, observable, runInAction } from 'mobx'
import { AppState } from 'react-native'

import pbx from '../api/pbx'
import sip from '../api/sip'
import { getUrlParams } from '../utils/deeplink'
import { ParsedPn, SipPn } from '../utils/PushNotification-parse'
import { arrToMap } from '../utils/toMap'
import { compareProfile, setAuthStore } from './authStore'
import callStore from './callStore'
import { intlDebug } from './intl'
import Nav from './Nav'
import profileStore, { Profile } from './profileStore'
import RnAlert from './RnAlert'
import RnAppState from './RnAppState'

export type ConnectionState = 'stopped' | 'connecting' | 'success' | 'failure'

export class AuthStore {
  @observable sipPn?: SipPn

  @observable pbxState: ConnectionState = 'stopped'
  @observable pbxTotalFailure = 0
  @observable sipState: ConnectionState = 'stopped'
  @observable sipTotalFailure = 0
  @observable ucState: ConnectionState = 'stopped'
  @observable ucTotalFailure = 0
  @observable ucLoginFromAnotherPlace = false
  @computed get pbxShouldAuth() {
    return (
      this.signedInId &&
      !this.sipPn?.sipAuth &&
      (this.pbxState === 'stopped' ||
        (this.pbxState === 'failure' &&
          !this.pbxTotalFailure &&
          RnAppState.currentState === 'active'))
    )
  }
  @computed get pbxConnectingOrFailure() {
    return ['connecting', 'failure'].some(s => s === this.pbxState)
  }
  @computed get sipShouldAuth() {
    return (
      (this.signedInId &&
        this.sipPn?.sipAuth &&
        this.sipState !== 'connecting' &&
        this.sipState !== 'success') ||
      (this.pbxState === 'success' &&
        (this.sipState === 'stopped' ||
          (this.sipState === 'failure' &&
            !this.sipTotalFailure &&
            RnAppState.currentState === 'active')))
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
      this.pbxState === 'success' &&
      (this.ucState === 'stopped' ||
        (this.ucState === 'failure' &&
          !this.ucTotalFailure &&
          RnAppState.currentState === 'active'))
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
      !!this.signedInId &&
      (this.pbxConnectingOrFailure ||
        this.sipConnectingOrFailure ||
        this.ucConnectingOrFailure)
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
    return profileStore.getProfileData(this.currentProfile)
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
    this.signedInId = p.id
    return true
  }

  signOut = () => {
    callStore.calls.forEach(c => c.hangupWithUnhold())
    if (callStore.calls.length > 0) {
      const intervalStartedAt = Date.now()
      const id = window.setInterval(() => {
        // TODO show/hide loader
        if (!callStore.calls.length || Date.now() > intervalStartedAt + 3000) {
          window.clearInterval(id)
          this._signOut()
        }
      }, 500)
    } else {
      this._signOut()
    }
  }
  @action _signOut = () => {
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

  @action reconnect = () => {
    this.pbxTotalFailure = 0
    this.sipTotalFailure = 0
    this.ucTotalFailure = 0
  }
  @action reconnectPbx = () => {
    this.reconnect()
    this.pbxState = 'stopped'
  }
  @action reconnectSip = () => {
    this.reconnect()
    this.sipState = 'stopped'
  }
  @action reconnectWithUcLoginFromAnotherPlace = () => {
    this.reconnect()
    this.ucLoginFromAnotherPlace = false
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

  signInByNotification = async (n: ParsedPn) => {
    runInAction(() => {
      this.sipPn = n.sipPn
    })
    this.reconnect()
    await profileStore.profilesLoaded()
    // Find account for the notification target
    const p = this.findProfile({
      ...n,
      pbxUsername: n.to,
      pbxTenant: n.tenant,
    })
    if (!p?.id) {
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
    // PN of current signed in account
    // If PN came and still no sip call it is likely disconnected
    // Set states to failure to reconnect them
    if (
      n.isCall &&
      !callStore.calls.length &&
      Date.now() > callStore.recentCallActivityAt + 30000
    ) {
      await pbx.client?._pal('getProductInfo').catch((err: Error) => {
        if (authStore.pbxState === 'connecting') {
          return
        }
        console.error(`PN debug: PBX reconnect: getProductInfo() error=${err}`)
        this.reconnectPbx()
      })
      const s = sip.phone?.getPhoneStatus()
      if (s && s !== 'starting' && s !== 'started') {
        console.error(`PN debug: SIP reconnect: getPhoneStatus()=${s}`)
        this.reconnectSip()
      }
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

const authStore = new AuthStore()

setAuthStore(authStore)

export default authStore
