import { observe } from 'mobx'

import pbx from '../api/pbx'
import sip from '../api/sip'
import updatePhoneIndex from '../api/updatePhoneIndex'
import { intlDebug } from '../intl/intl'
import authStore from './authStore'
import RnAlert from './RnAlert'

class AuthSIP {
  clearObserve: any
  auth() {
    this._auth2()
    this.clearObserve = observe(authStore, 'sipShouldAuth', this._auth2)
  }
  dispose() {
    void this.clearObserve?.()
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
    authStore.userExtensionProperties = pbxUserConfig
    //
    const language = pbxUserConfig.language
    void language
    //
    const webPhone = await updatePhoneIndex()
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
    await sip.connect({
      hostname: authStore.currentProfile.pbxHostname,
      port: sipWSSPort,
      tenant: authStore.currentProfile.pbxTenant,
      username: webPhone.id,
      accessToken: sipAccessToken,
      pbxTurnEnabled: authStore.currentProfile.pbxTurnEnabled,
    })
  }
  _auth = () => {
    this._auth0().catch(err => {
      authStore.sipState = 'failure'
      authStore.sipTotalFailure += 1
      sip.disconnect()
      RnAlert.error({
        message: intlDebug`Failed to connect to SIP`,
        err,
      })
    })
  }
  _auth2 = () => authStore.sipShouldAuth && this._auth()
}

export default AuthSIP
