import { debounce } from 'lodash'
import { action, autorun, Lambda } from 'mobx'

import { pbx } from '../api/pbx'
import { waitTimeout } from '../utils/waitTimeout'
import { getAuthStore } from './authStore'

class AuthPBX {
  private clearObserve?: Lambda

  auth = () => {
    this.authWithCheck()
    this.clearObserve?.()
    const s = getAuthStore()
    this.clearObserve = autorun(() => {
      void s.pbxShouldAuth()
      this.authWithCheckDebounced()
    })
  }
  @action dispose = () => {
    console.log('PBX PN debug: disconnect by AuthPBX.dispose')
    this.clearObserve?.()
    this.clearObserve = undefined
    pbx.disconnect()
    const s = getAuthStore()
    s.pbxState = 'stopped'
  }

  private waitingTimeout = false
  @action private authWithCheck = async () => {
    const s = getAuthStore()
    if (!s.pbxShouldAuth() || !s.getCurrentAccount() || this.waitingTimeout) {
      return
    }
    if (s.pbxTotalFailure > 1) {
      this.waitingTimeout = true
      await waitTimeout(
        s.pbxTotalFailure < 5 ? s.pbxTotalFailure * 1000 : 15000,
      )
    }
    console.log('PBX PN debug: disconnect by AuthPBX.authWithCheck')
    pbx.disconnect()
    s.pbxState = 'connecting'
    pbx
      .connect(s.getCurrentAccount())
      .then(connected => {
        if (!connected) {
          throw new Error('Pbx login connection timed out')
        }
      })
      .catch(
        action((err: Error) => {
          s.pbxState = 'failure'
          s.pbxTotalFailure += 1
          console.error('Failed to connect to pbx:', err)
        }),
      )
    this.waitingTimeout = false
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authPBX = new AuthPBX()
