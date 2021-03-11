import { debounce } from 'lodash'
import { Lambda, observe } from 'mobx'

import pbx from '../api/pbx'
import sip from '../api/sip'
import updatePhoneIndex from '../api/updatePhoneIndex'
import { getAuthStore } from './authStore'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

class AuthSIP {
  private clearObserve?: Lambda
  auth() {
    this.authWithCheckDebounced()
    this.clearObserve = observe(
      getAuthStore(),
      'sipShouldAuth',
      this.authWithCheckDebounced,
    )
  }
  dispose() {
    console.error('SIP PN debug: set sipState stopped dispose')
    this.clearObserve?.()
    getAuthStore().sipState = 'stopped'
    sip.disconnect()
  }

  private authPnWithoutCatch = async () => {
    const s = getAuthStore()
    const p = s.sipPn
    if (!p || !p.sipAuth) {
      console.error('SIP PN debug: Invalid sip PN login logic')
      return
    }
    const turnConfig: RTCIceServer | undefined = p.turnServer
      ? {
          urls: p.turnServer.split(',').map(s => s.trim()),
          username: p.turnUsername,
          credential: p.turnCredential,
        }
      : undefined
    let dtmfSendMode = Number(p.dtmfPal)
    if (isNaN(dtmfSendMode)) {
      dtmfSendMode = p.dtmfPal === 'false' || p.dtmfPal === '0' ? 0 : 1
    }
    await sip.connect({
      hostname: s.currentProfile.pbxHostname,
      port: p.sipWssPort || '',
      username: p.phoneId || '',
      accessToken: p.sipAuth || '',
      pbxTurnEnabled: s.currentProfile.pbxTurnEnabled,
      dtmfSendMode,
      turnConfig,
    })
  }

  private authWithoutCatch = async () => {
    const s = getAuthStore()
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
      console.error('Invalid PBX config')
      return
    }
    //
    const sipWSSPort = pbxConfig['sip.wss.port']
    if (!sipWSSPort) {
      console.error('Invalid SIP WSS port')
      return
    }
    //
    getAuthStore().userExtensionProperties =
      getAuthStore().userExtensionProperties ||
      (await pbx.getUserForSelf(
        getAuthStore().currentProfile.pbxTenant,
        getAuthStore().currentProfile.pbxUsername,
      ))
    const pbxUserConfig = getAuthStore().userExtensionProperties
    if (!pbxUserConfig) {
      console.error('Invalid PBX user config')
      return
    }
    //
    const language = pbxUserConfig.language
    void language
    //
    const webPhone = (await updatePhoneIndex()) as { id: string }
    if (!webPhone) {
      return
    }
    //
    const sipAccessToken = await pbx.createSIPAccessToken(webPhone.id)
    if (!sipAccessToken) {
      console.error('Invalid SIP access token')
      return
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
    await sip.connect({
      hostname: getAuthStore().currentProfile.pbxHostname,
      port: sipWSSPort,
      username: webPhone.id,
      accessToken: sipAccessToken,
      pbxTurnEnabled: getAuthStore().currentProfile.pbxTurnEnabled,
      dtmfSendMode: Number(dtmfSendMode),
      turnConfig,
    })
  }
  private authWithCheck = () => {
    if (!getAuthStore().sipShouldAuth) {
      return
    }
    this.authWithoutCatch().catch((err: Error) => {
      console.error('SIP PN debug: set sipState failure catch')
      getAuthStore().sipState = 'failure'
      getAuthStore().sipTotalFailure += 1
      sip.disconnect()
      RnAlert.error({
        message: intlDebug`Failed to connect to SIP`,
        err,
      })
    })
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export default AuthSIP
