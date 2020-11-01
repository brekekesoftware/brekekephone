import { Lambda, observe } from 'mobx'

import pbx from '../api/pbx'
import { intlDebug } from '../intl/intl'
import authStore from './authStore'
import RnAlert from './RnAlert'

class AuthPBX {
  clearObserve?: Lambda
  auth() {
    this._auth2()
    this.clearObserve = observe(authStore, 'pbxShouldAuth', this._auth2)
  }
  dispose() {
    this.clearObserve?.()
    pbx.disconnect()
    authStore.pbxState = 'stopped'
  }

  _auth = () => {
    pbx.disconnect()
    authStore.pbxState = 'connecting'
    pbx
      .connect(authStore.currentProfile)
      .then(() => {
        authStore.pbxState = 'success'
      })
      .catch((err: Error) => {
        authStore.pbxState = 'failure'
        authStore.pbxTotalFailure += 1
        RnAlert.error({
          message: intlDebug`Failed to connect to pbx`,
          err,
        })
      })
  }
  _auth2 = () => authStore.pbxShouldAuth && this._auth()
}

export default AuthPBX
