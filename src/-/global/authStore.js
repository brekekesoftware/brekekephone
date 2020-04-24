import debounce from 'lodash/debounce'
import { computed, observable } from 'mobx'

import sip from '../api/sip'
import { intlDebug } from '../intl/intl'
import { getUrlParams } from '../native/deeplink'
import { AppState } from '../Rn'
import { arrToMap } from '../utils/toMap'
import g from './_'
import callStore from './callStore'

const compareField = (p1, p2, field) => {
  const v1 = p1[field]
  const v2 = p2[field]
  return !v1 || !v2 || v1 === v2
}
const compareProfile = (p1, p2) => {
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
      this.signedInId &&
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

  findProfile = _p => {
    return g.profiles.find(p => compareProfile(p, _p))
  }
  pushRecentCall = call => {
    this.currentData.recentCalls = [call, ...this.currentData.recentCalls]
    if (this.currentData.recentCalls.length > 20) {
      this.currentData.recentCalls.pop()
    }
    g.saveProfilesToLocalStorage()
  }
  @computed get _profilesMap() {
    return arrToMap(g.profiles, 'id', p => p)
  }
  getProfile = id => {
    return this._profilesMap[id]
  }

  @observable signedInId = null
  @computed get currentProfile() {
    return this.getProfile(this.signedInId)
  }
  @computed get currentData() {
    const p = this.currentProfile
    return p && g.getProfileData(p)
  }
  signIn = id => {
    const p = this.getProfile(id)
    if (!p) {
      return false
    }
    const d = g.getProfileData(p)
    if (!p.pbxPassword && !d.accessToken) {
      g.goToPageProfileUpdate(p.id)
      g.showError({
        message: intlDebug`The account password is empty`,
      })
      return true
    }
    if (p.ucEnabled && (!p.ucHostname || !p.ucPort)) {
      g.goToPageProfileUpdate(p.id)
      g.showError({
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
      const id = setInterval(() => {
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
    this.signedInId = null
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
    this.ucLoginFromAnotherPlace = false
  }, 1000)

  handleUrlParams = async () => {
    await g.profilesLoaded
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
      const d = g.getProfileData(p)
      if (_wn) {
        d.accessToken = _wn
      }
      //
      g.upsertProfile(p)
      if (p.pbxPassword || d.accessToken) {
        this.signIn(p.id)
      } else {
        g.goToPageProfileUpdate(p.id)
      }
      return
    }
    //
    const newP = {
      ...g.genEmptyProfile(),
      pbxTenant: tenant,
      pbxUsername: user,
      pbxHostname: host,
      pbxPort: port,
      pbxPhoneIndex,
    }
    const d = g.getProfileData(newP)
    //
    g.upsertProfile(newP)
    if (d.accessToken) {
      this.signIn(newP.id)
    } else {
      g.goToPageProfileUpdate(newP.id)
    }
  }

  @observable isSignInByNotification = false
  clearSignInByNotification = debounce(
    () => {
      // clearSignInByNotification will activate UC login
      // We will only allow UC login when the app is active
      if (AppState.currentState !== 'active') {
        setTimeout(this.clearSignInByNotification, 17)
      } else {
        this.isSignInByNotification = false
      }
    },
    10000,
    {
      maxWait: 15000,
    },
  )

  signInByNotification = async n => {
    const state = AppState.currentState
    await g.profilesLoaded
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
      // Attempt to reconnect on notification if state is currently failure
      this.reconnect()
      return state !== 'active'
    }
    // Call signIn
    return this.signIn(p?.id)
  }

  // id
  // name
  // language
  // phones[]
  //   id
  //   type
  userExtensionProperties = null
}

const authStore = new AuthStore()

export { compareProfile }
export default authStore
