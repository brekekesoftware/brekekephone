import { debounce } from 'lodash'
import { action, Lambda, observe, runInAction } from 'mobx'

import pbx from '../api/pbx'
import sip from '../api/sip'
import updatePhoneIndex from '../api/updatePhoneIndex'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { getAuthStore, waitSip } from './authStore'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

class AuthSIP {
  private clearObserve?: Lambda

  auth = () => {
    this.authWithCheck()
    this.clearObserve?.()
    const s = getAuthStore()
    this.clearObserve = observe(s, 'sipShouldAuth', this.authWithCheckDebounced)
  }
  @action dispose = () => {
    console.error('SIP PN debug: set sipState stopped dispose')
    this.clearObserve?.()
    const s = getAuthStore()
    s.sipState = 'stopped'
    s.lastSipAuth = 0
    sip.disconnect()
  }

  private authPnWithoutCatch = async () => {
    const s = getAuthStore()
    const p = s.currentProfile
    if (!p) {
      console.error('SIP PN debug: Already signed out after long await')
      return
    }
    const pn = s.sipPn
    runInAction(() => {
      s.sipPn = {}
    })
    if (!pn?.sipAuth) {
      console.error('SIP PN debug: Invalid sip PN login logic')
      this.dispose()
      return
    }
    const turnConfig: RTCIceServer | undefined = pn.turnServer
      ? {
          urls: pn.turnServer.split(',').map(s => s.trim()),
          username: pn.turnUsername,
          credential: pn.turnCredential,
        }
      : undefined
    let dtmfSendMode = Number(pn.dtmfPal)
    if (isNaN(dtmfSendMode)) {
      dtmfSendMode = pn.dtmfPal === 'false' || pn.dtmfPal === '0' ? 0 : 1
    }
    // If after 10s and still not connected => reconnect
    // May be due to the PN auth token has been expired
    waitSip().then(isConnected => {
      if (!isConnected) {
        this.dispose()
        this.auth()
      }
    })
    await sip.connect({
      hostname: p.pbxHostname,
      port: pn.sipWssPort || '',
      username: pn.phoneId || '',
      accessToken: pn.sipAuth || '',
      pbxTurnEnabled: p.pbxTurnEnabled,
      dtmfSendMode,
      turnConfig,
    })
  }

  @action private authWithoutCatch = async () => {
    console.error('SIP PN debug: set sipState connecting')
    const s = getAuthStore()
    s.lastSipAuth = Date.now()
    s.sipState = 'connecting'
    if (s.sipPn.sipAuth) {
      console.error('SIP PN debug: AuthSIP.authPnWithoutCatch')
      this.authPnWithoutCatch()
      return
    }
    console.error('SIP PN debug: AuthSIP.authWithoutCatch')
    //
    const pbxConfig = await pbx.getConfig()
    if (!pbxConfig) {
      throw new Error('Empty response from pal getProductInfo')
    }
    //
    const sipWSSPort = pbxConfig['sip.wss.port']
    if (!sipWSSPort) {
      throw new Error('Empty sip.wss.port from pal getProductInfo')
    }
    //
    let p = s.currentProfile
    if (!p) {
      console.error('SIP PN debug: Already signed out after long await')
      return
    }
    //
    s.userExtensionProperties =
      s.userExtensionProperties ||
      (await pbx.getUserForSelf(p.pbxTenant, p.pbxUsername)) ||
      s.userExtensionProperties
    const pbxUserConfig = s.userExtensionProperties
    if (!pbxUserConfig) {
      throw new Error('Empty response from pal getExtensionProperties')
    }
    //
    const language = pbxUserConfig.language
    void language
    //
    const webPhone = (await updatePhoneIndex()) as { id: string }
    if (!webPhone) {
      // Already signout and show error in above updatePhoneIndex
      return
    }
    //
    const sipAccessToken = await pbx.createSIPAccessToken(webPhone.id)
    if (!sipAccessToken) {
      throw new Error('Empty response from pal createAuthHeader')
    }
    //
    const dtmfSendMode = pbxConfig['webrtcclient.dtmfSendMode']
    const turnServer = pbxConfig['webphone.turn.server']
    const turnUser = pbxConfig['webphone.turn.username']
    const turnCred = pbxConfig['webphone.turn.credential']
    const turnConfig: RTCIceServer | undefined = turnServer
      ? {
          urls: turnServer.split(',').map(s => s.trim()),
          username: turnUser,
          credential: turnCred,
        }
      : undefined
    //
    p = s.currentProfile
    if (!p) {
      console.error('SIP PN debug: Already signed out after long await')
      return
    }
    await sip.connect({
      hostname: p.pbxHostname,
      port: sipWSSPort,
      username: webPhone.id,
      accessToken: sipAccessToken,
      pbxTurnEnabled: p.pbxTurnEnabled,
      dtmfSendMode: Number(dtmfSendMode),
      turnConfig,
    })
  }
  private authWithCheck = () => {
    const s = getAuthStore()
    if (Date.now() - s.lastSipAuth < 2000) {
      BackgroundTimer.setTimeout(this.authWithCheckDebounced, 10000)
      return
    }
    if (!s.sipShouldAuth) {
      return
    }
    this.authWithoutCatch().catch(
      action((err: Error) => {
        console.error('SIP PN debug: set sipState failure catch')
        s.sipState = 'failure'
        s.sipTotalFailure += 1
        sip.disconnect()
        RnAlert.error({
          message: intlDebug`Failed to connect to SIP`,
          err,
        })
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authSIP = new AuthSIP()
