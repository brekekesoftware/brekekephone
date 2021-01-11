import debounce from 'lodash/debounce'
import { Lambda, observe } from 'mobx'

import pbx from '../api/pbx'
import { getAuthStore } from './authStore'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

class AuthPBX {
  clearObserve?: Lambda
  auth() {
    this._auth2()
    this.clearObserve = observe(getAuthStore(), 'pbxShouldAuth', this._auth2)
  }
  dispose() {
    this.clearObserve?.()
    pbx.disconnect()
    getAuthStore().pbxState = 'stopped'
  }

  _auth = debounce(
    () => {
      pbx.disconnect()
      getAuthStore().pbxState = 'connecting'
      pbx
        .connect(getAuthStore().currentProfile)
        .then(() => {
          getAuthStore().pbxState = 'success'
        })
        .catch((err: Error) => {
          getAuthStore().pbxState = 'failure'
          getAuthStore().pbxTotalFailure += 1
          RnAlert.error({
            message: intlDebug`Failed to connect to pbx`,
            err,
          })
        })
    },
    50,
    {
      maxWait: 300,
    },
  )
  _auth2 = () => getAuthStore().pbxShouldAuth && this._auth()
}

export default AuthPBX
