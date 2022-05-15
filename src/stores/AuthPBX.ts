import { debounce } from 'lodash'
import { action, autorun, Lambda } from 'mobx'

import { pbx } from '../api/pbx'
import { BackgroundTimer } from '../utils/BackgroundTimer'
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
    console.error('PBX PN debug: disconnect by AuthPBX.dispose')
    this.clearObserve?.()
    this.clearObserve = undefined
    pbx.disconnect()
    const s = getAuthStore()
    s.pbxState = 'stopped'
  }

  @action private authWithCheck = () => {
    const s = getAuthStore()
    if (!s.pbxShouldAuth() || !s.currentProfile) {
      return
    }
    if (s.pbxTotalFailure > 1) {
      BackgroundTimer.setTimeout(
        this.authWithCheckDebounced,
        s.pbxTotalFailure < 5 ? s.pbxTotalFailure * 1000 : 15000,
      )
      return
    }
    console.error('PBX PN debug: disconnect by AuthPBX.authWithCheck')
    pbx.disconnect()
    s.pbxState = 'connecting'
    pbx.connect(s.currentProfile).catch(
      action((err: Error) => {
        s.pbxState = 'failure'
        s.pbxTotalFailure += 1
        console.error('Failed to connect to pbx', err)
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authPBX = new AuthPBX()
