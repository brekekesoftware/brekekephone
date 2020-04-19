import { observe } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import sip from '../api/sip'
import updatePhoneIndex from '../api/updatePhoneIndex'
import g from '../global'
import authStore from '../global/authStore'
import { intlDebug } from '../intl/intl'

@observer
class AuthSIP extends React.Component {
  constructor() {
    // TODO notification login not work
    super()
    this.autoAuth()
    this.clearObserve = observe(authStore, 'sipShouldAuth', this.autoAuth)
  }
  componentWillUnmount() {
    this.clearObserve()
    authStore.sipState = 'stopped'
    sip.disconnect()
  }

  _auth = async () => {
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
  auth = () => {
    this._auth().catch(err => {
      authStore.sipState = 'failure'
      authStore.sipTotalFailure += 1
      sip.disconnect()
      g.showError({
        message: intlDebug`Failed to connect to SIP`,
        err,
      })
    })
  }
  autoAuth = () => authStore.sipShouldAuth && this.auth()

  render() {
    return null
  }
}

export default AuthSIP
