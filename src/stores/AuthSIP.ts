import { debounce } from 'lodash'
import type { Lambda } from 'mobx'
import { action, reaction, when } from 'mobx'

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
    if (ctx.auth.sipTotalFailure > 3 && !hasRingingCallWithSipPn()) {
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
    // BUG-1207: while signInByNotification is mid-transition, dispose() sets
    // sipState='stopped' and onCallKeepDidDisplayIncomingCall sees that and
    // schedules a redundant sip.connect. The 2nd connect calls resetProcessedPn
    // which wipes user actions captured between the two connects. Skip here so
    // only the App.tsx onAuthUpdate reaction (after signIn completes) drives auth.
    if (ctx.auth.isSigningInByNotification) {
      console.log(
        'SIP PN debug: skip authWithCheck during signInByNotification',
      )
      return
    }
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
      const ms = hasRingingCallWithSipPn()
        ? 2000
        : ctx.auth.sipTotalFailure < 5
          ? ctx.auth.sipTotalFailure * 1000
          : 15000
      // the pn sip login is rejected until the pal session exists, so once pbx is up
      // there is nothing left to wait for - retry immediately instead of ringing out.
      // re-evaluated on every observable change, so a pn arriving mid backoff is picked
      // up too. when().cancel() rejects, hence the catch
      const w = when(
        () =>
          ctx.auth.sipState !== 'waiting' ||
          (hasRingingCallWithSipPn() && ctx.auth.pbxState === 'success'),
      )
      await Promise.race([waitTimeout(ms), w.catch(() => undefined)])
      w.cancel()
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

// The wss connect can fail for a few seconds right after a PN wakes the app: the process
// is in background and its network is not usable yet. sipShouldAuth can only auth in that
// state through `signedInId && sipPn.sipAuth`, so dropping the PN token on failure stops
// every retry until the app becomes active - and the ringing call is already gone by then.
// Keep retrying with a short backoff while the callkeep call is still ringing; the token
// still expires via isSipPnExpired, and callkeepMap is cleared after 20s by
// callStore.setAutoEndCallKeepTimer, so this cannot retry forever.
export const hasRingingCallWithSipPn = () =>
  !!Object.keys(ctx.call.callkeepMap).length &&
  !!ctx.auth.sipPn.sipAuth &&
  !isSipPnExpired(ctx.auth.sipPn)
