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
    if (!this.clearObserve) {
      const s = getAuthStore()
      this.clearObserve = observe(
        s,
        'pbxShouldAuth',
        this.authWithCheckDebounced,
      )
    }
  }
  dispose() {
    console.error('PBX PN debug: disconnect by AuthPBX.dispose')
    this.clearObserve?.()
    this.clearObserve = undefined
    pbx.disconnect()
    const s = getAuthStore()
    s.pbxState = 'stopped'
  }

  private authWithCheck = () => {
    const s = getAuthStore()
    if (!s.pbxShouldAuth) {
      return
    }
    console.error('PBX PN debug: disconnect by AuthPBX.authWithCheck')
    pbx.disconnect()
    s.pbxState = 'connecting'
    pbx
      .connect(s.currentProfile)
      .then(() => {
        s.pbxState = 'success'
      })
      .catch((err: Error) => {
        s.pbxState = 'failure'
        s.pbxTotalFailure += 1
        RnAlert.error({
          message: intlDebug`Failed to connect to pbx`,
          err,
        })
      })
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authPBX = new AuthPBX()
