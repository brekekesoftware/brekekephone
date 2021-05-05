import { debounce } from 'lodash'
import { Lambda, observe } from 'mobx'

import pbx from '../api/pbx'
import { getAuthStore } from './authStore'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'

class AuthPBX {
  private clearObserve?: Lambda
  auth() {
    this.authWithCheck()
    this.clearObserve = observe(
      getAuthStore(),
      'pbxShouldAuth',
      this.authWithCheckDebounced,
    )
  }
  dispose() {
    this.clearObserve?.()
    pbx.disconnect()
    getAuthStore().pbxState = 'stopped'
  }

  private authWithCheck = () => {
    if (!getAuthStore().pbxShouldAuth) {
      return
    }
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
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export default AuthPBX
