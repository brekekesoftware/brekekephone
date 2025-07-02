import { debounce } from 'lodash'
import type { Lambda } from 'mobx'
import { action, reaction } from 'mobx'

import { ctx } from '#/stores/ctx'
import { waitTimeout } from '#/utils/waitTimeout'

export class AuthPBX {
  private clearShouldAuthReaction?: Lambda

  auth = () => {
    this.authWithCheck()
    this.clearShouldAuthReaction?.()

    this.clearShouldAuthReaction = reaction(
      ctx.auth.pbxShouldAuth,
      this.authWithCheckDebounced,
    )
  }
  @action dispose = () => {
    console.log('PBX PN debug: disconnect by AuthPBX.dispose')
    this.clearShouldAuthReaction?.()
    this.clearShouldAuthReaction = undefined
    ctx.pbx.disconnect()

    ctx.auth.pbxState = 'stopped'
  }

  @action private authWithCheck = async () => {
    if (!ctx.auth.pbxShouldAuth()) {
      return
    }
    if (ctx.auth.pbxTotalFailure > 1) {
      ctx.auth.pbxState = 'waiting'
      await waitTimeout(
        ctx.auth.pbxTotalFailure < 5 ? ctx.auth.pbxTotalFailure * 1000 : 15000,
      )
      if (ctx.auth.pbxState !== 'waiting') {
        return
      }
    }
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return
    }
    console.log('PBX PN debug: disconnect by AuthPBX.authWithCheck')
    ctx.pbx.disconnect()
    ctx.auth.pbxState = 'connecting'
    ctx.pbx
      .connect(ca)
      .then(connected => {
        if (!connected) {
          throw new Error('PBX login connection timed out')
        }
      })
      .catch(
        action((err: Error) => {
          ctx.auth.pbxState = 'failure'
          ctx.auth.pbxTotalFailure += 1
          console.error('Failed to connect to pbx:', err)
          this.authWithCheck()
        }),
      )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

ctx.authPBX = new AuthPBX()
