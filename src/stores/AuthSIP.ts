import debounce from 'lodash/debounce'
import { Lambda, observe } from 'mobx'

import pbx from '../api/pbx'
import sip from '../api/sip'
import updatePhoneIndex from '../api/updatePhoneIndex'
import authStore from './authStore'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

class AuthSIP {
  clearObserve?: Lambda
  auth() {
    this._auth2()
    this.clearObserve = observe(authStore, 'sipShouldAuth', this._auth2)
  }
  dispose() {
    this.clearObserve?.()
    authStore.sipState = 'stopped'
    sip.disconnect()
  }

  _auth0 = async () => {
    authStore.sipState = 'connecting'
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
    const pbxUserConfig = await pbx.getUserForSelf(
      authStore.currentProfile.pbxTenant,
      authStore.currentProfile.pbxUsername,
    )
    if (!pbxUserConfig) {
      console.error('Invalid PBX user config')
      return
    }
    authStore.userExtensionProperties = pbxUserConfig as typeof authStore.userExtensionProperties
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
      hostname: authStore.currentProfile.pbxHostname,
      port: sipWSSPort,
      tenant: authStore.currentProfile.pbxTenant,
      username: webPhone.id,
      accessToken: sipAccessToken,
      pbxTurnEnabled: authStore.currentProfile.pbxTurnEnabled,
      dtmfSendMode,
      turnConfig,
    })
  }
  _auth = debounce(
    () => {
      this._auth0().catch((err: Error) => {
        authStore.sipState = 'failure'
        authStore.sipTotalFailure += 1
        sip.disconnect()
        RnAlert.error({
          message: intlDebug`Failed to connect to SIP`,
          err,
        })
      })
    },
    300,
    {
      maxWait: 1000,
    },
  )
  _auth2 = () => authStore.sipShouldAuth && this._auth()
}

export default AuthSIP
