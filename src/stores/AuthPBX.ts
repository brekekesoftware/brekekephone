import { debounce } from 'lodash'
import type { Lambda } from 'mobx'
import { action, reaction } from 'mobx'

import { pbx } from '../api/pbx'
import { waitTimeout } from '../utils/waitTimeout'
import { getAuthStore } from './authStore'

class AuthPBX {
  private clearShouldAuthReaction?: Lambda

  auth = () => {
    this.authWithCheck()
    this.clearShouldAuthReaction?.()
    const s = getAuthStore()
    this.clearShouldAuthReaction = reaction(
      s.pbxShouldAuth,
      this.authWithCheckDebounced,
    )
  }
  @action dispose = () => {
    console.log('PBX PN debug: disconnect by AuthPBX.dispose')
    this.clearShouldAuthReaction?.()
    this.clearShouldAuthReaction = undefined
    pbx.disconnect()
    const s = getAuthStore()
    s.pbxState = 'stopped'
  }

  @action authWithCheck = async () => {
    const s = getAuthStore()
    if (!s.pbxShouldAuth()) {
      return
    }
    if (s.pbxTotalFailure > 1) {
      s.pbxState = 'waiting'
      await waitTimeout(
        s.pbxTotalFailure < 5 ? s.pbxTotalFailure * 1000 : 15000,
      )
      if (s.pbxState !== 'waiting') {
        return
      }
    }
    const ca = s.getCurrentAccount()
    if (!ca) {
      return
    }
    console.log('PBX PN debug: disconnect by AuthPBX.authWithCheck')
    pbx.disconnect()
    s.pbxState = 'connecting'
    pbx
      .connect(ca)
      .then(connected => {
        if (!connected) {
          throw new Error('PBX login connection timed out')
        }
      })
      .catch(
        action((err: Error) => {
          s.pbxState = 'failure'
          s.pbxTotalFailure += 1
          console.error('Failed to connect to pbx:', err)
          this.authWithCheck()
        }),
      )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authPBX = new AuthPBX()
