import { debounce } from 'lodash'
import type { Lambda } from 'mobx'
import { action, reaction } from 'mobx'

import type { SipLoginOption } from '#/api/sip'
import { updatePhoneIndex } from '#/api/updatePhoneIndex'
import type { PbxGetProductInfoRes } from '#/brekekejs'
import { defaultTimeout } from '#/config'
import { ctx } from '#/stores/ctx'
import { sipErrorEmitter } from '#/stores/sipErrorEmitter'
import { jsonSafe } from '#/utils/jsonSafe'
import type { SipPn } from '#/utils/PushNotification-parse'
import { toBoolean } from '#/utils/string'
import { waitTimeout } from '#/utils/waitTimeout'

const getPbxConfig = <K extends keyof PbxGetProductInfoRes>(k: K) =>
  ctx.pbx.getConfig().then(c => c && c[k])

export class AuthSIP {
  private clearShouldAuthReaction?: Lambda

  auth = () => {
    this.authWithCheck()
    this.clearShouldAuthReaction?.()

    this.clearShouldAuthReaction = reaction(
      ctx.auth.sipShouldAuth,
      this.authWithCheckDebounced,
    )
  }
  @action dispose = () => {
    console.log('SIP PN debug: set sipState stopped dispose')
    this.clearShouldAuthReaction?.()

    ctx.auth.sipState = 'stopped'
    ctx.sip.stopWebRTC()
  }

  private onSipFailure = () => {
    console.log('SIP PN debug: set sipState failure')
    ctx.sip.stopWebRTC()

    ctx.auth.sipState = 'failure'
    ctx.auth.sipTotalFailure += 1
    if (ctx.auth.sipTotalFailure > 3) {
      ctx.auth.sipPn = {}
    }
    // auto reconnect
    this.authWithCheck()
  }

  private authPnWithoutCatch = async (pn: Partial<SipPn>) => {
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      console.log('SIP PN debug: Already signed out after long await')
      return
    }
    if (isSipPnExpired(pn)) {
      console.error('SIP PN debug: expired auth token')
      this.onSipFailure()
      return
    }
    if (!pn.sipAuth || !pn.sipWssPort || !pn.phoneId) {
      console.error(`SIP PN debug: Invalid sip PN data: ${jsonSafe(pn)}`)
      ctx.auth.sipPn = {}
      ctx.auth.pbxConfig = undefined
      this.onSipFailure()
      return
    }
    const turnConfig: RTCIceServer | undefined = pn.turnServer
      ? {
          urls: pn.turnServer.split(',').map(s => s.trim()),
          username: pn.turnUsername,
          credential: pn.turnCredential,
        }
      : undefined
    const o: SipLoginOption = {
      hostname: ca.pbxHostname,
      port: pn.sipWssPort,
      username: pn.phoneId,
      accessToken: pn.sipAuth,
      pbxTurnEnabled: ca.pbxTurnEnabled,
      dtmfSendPal: toBoolean(pn.dtmfSendPal),
      turnConfig,
    }
    await ctx.sip.connect(o, ca)
  }

  @action private authWithoutCatch = async () => {
    console.log('SIP PN debug: set sipState connecting')

    ctx.auth.sipState = 'connecting'
    sipErrorEmitter.removeAllListeners()
    sipErrorEmitter.on('error', () => {
      console.log('SIP PN debug: got error from sipErrorEmitter')
      const count = ctx.sip.phone?.getSessionCount()
      if (count) {
        console.log(
          `SIP PN debug: can not dispose sip due to ongoing sessions getSessionCount=${count}`,
        )
        return
      }
      this.dispose()
      this.authWithCheckDebounced()
    })
    //
    if (isSipPnExpired(ctx.auth.sipPn)) {
      ctx.auth.sipPn = {}
    }
    const pn = ctx.auth.sipPn
    if (pn.sipAuth) {
      console.log('SIP PN debug: AuthSIP.authPnWithoutCatch')
      this.authPnWithoutCatch(pn)
      return
    }
    console.log('SIP PN debug: AuthSIP.authWithoutCatch')
    //
    pn.sipWssPort = pn.sipWssPort || (await getPbxConfig('sip.wss.port'))
    pn.dtmfSendPal =
      pn.dtmfSendPal || (await getPbxConfig('webphone.dtmf.send.pal'))
    pn.turnServer =
      pn.turnServer || (await getPbxConfig('webphone.turn.server'))
    pn.turnUsername =
      pn.turnUsername || (await getPbxConfig('webphone.turn.username'))
    pn.turnCredential =
      pn.turnCredential || (await getPbxConfig('webphone.turn.credential'))
    pn.phoneId = pn.phoneId || (await updatePhoneIndex().then(p => p?.id))
    if (!pn.phoneId) {
      throw new Error('Failed to get phoneId from updatePhoneIndex')
    }
    pn.sipAuth = await ctx.pbx.createSIPAccessToken(pn.phoneId)
    pn.sipAuthAt = Date.now()
    await this.authPnWithoutCatch(pn)
  }

  @action private authWithCheck = async () => {
    if (isSipPnExpired(ctx.auth.sipPn)) {
      ctx.auth.sipPn = {}
    }
    const sipShouldAuth = ctx.auth.sipShouldAuth()
    console.log(`SIP PN debug: authWithCheck ${sipShouldAuth}`, {
      sipState: ctx.auth.sipState,
      signedInId: !!ctx.auth.signedInId,
      sipAuth: !!ctx.auth.sipPn.sipAuth,
      pbxState: ctx.auth.pbxState,
      sipTotalFailure: ctx.auth.sipTotalFailure,
    })
    if (!sipShouldAuth) {
      return
    }
    if (ctx.auth.sipTotalFailure > 1) {
      ctx.auth.sipState = 'waiting'
      await waitTimeout(
        ctx.auth.sipTotalFailure < 5 ? ctx.auth.sipTotalFailure * 1000 : 15000,
      )
      if (ctx.auth.sipState !== 'waiting') {
        return
      }
    }
    this.authWithoutCatch().catch(
      action((err: Error) => {
        console.log('SIP PN debug: set sipState failure catch')
        this.onSipFailure()
        console.error('Failed to connect to sip:', err)
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, defaultTimeout)
}

ctx.authSIP = new AuthSIP()

// empty or expire after 90 seconds
const isSipPnExpired = (pn: Partial<SipPn>) =>
  !pn.sipAuthAt || Date.now() - pn.sipAuthAt > 90000
