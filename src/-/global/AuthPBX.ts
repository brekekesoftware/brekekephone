import { observe } from 'mobx'

import pbx from '../api/pbx'
import { intlDebug } from '../intl/intl'
import Alert from './Alert'
import authStore from './authStore'

class AuthPBX {
  clearObserve: any
  auth() {
    this._auth2()
    this.clearObserve = observe(authStore, 'pbxShouldAuth', this._auth2)
  }
  dispose() {
    void this.clearObserve?.()
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
      .catch(err => {
        authStore.pbxState = 'failure'
        authStore.pbxTotalFailure += 1
        Alert.error({
          message: intlDebug`Failed to connect to pbx`,
          err,
        })
      })
  }
  _auth2 = () => authStore.pbxShouldAuth && this._auth()
}

export default AuthPBX
