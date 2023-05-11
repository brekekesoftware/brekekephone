import CiruclarJSON from 'circular-json'
import { debounce } from 'lodash'
import { action, Lambda, reaction } from 'mobx'

import { PbxGetProductInfoRes } from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { sip, SipLoginOption } from '../api/sip'
import { updatePhoneIndex } from '../api/updatePhoneIndex'
import { SipPn } from '../utils/PushNotification-parse'
import { toBoolean } from '../utils/string'
import { waitTimeout } from '../utils/waitTimeout'
import { getAuthStore } from './authStore'
import { sipErrorEmitter } from './sipErrorEmitter'

const getPbxConfig = <K extends keyof PbxGetProductInfoRes>(k: K) =>
  pbx.getConfig().then(c => c && c[k])

class AuthSIP {
  private clearShouldAuthReaction?: Lambda

  auth = () => {
    this.authWithCheck()
    this.clearShouldAuthReaction?.()
    const s = getAuthStore()
    this.clearShouldAuthReaction = reaction(
      s.sipShouldAuth,
      this.authWithCheckDebounced,
    )
  }
  @action dispose = () => {
    console.log('SIP PN debug: set sipState stopped dispose')
    this.clearShouldAuthReaction?.()
    const s = getAuthStore()
    s.sipState = 'stopped'
    sip.stopWebRTC()
  }

  private onSipFailure = () => {
    sip.stopWebRTC()
    const s = getAuthStore()
    s.sipState = 'failure'
    s.sipTotalFailure += 1
    if (s.sipTotalFailure > 3) {
      s.sipPn = {}
    }
  }

  private authPnWithoutCatch = async (pn: Partial<SipPn>) => {
    const as = getAuthStore()
    const ca = as.getCurrentAccount()
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
      console.error(
        `SIP PN debug: Invalid sip PN data: ${CiruclarJSON.stringify(pn)}`,
      )
      as.sipPn = {}
      as.pbxConfig = undefined
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
    await sip.connect(o, ca)
  }

  @action private authWithoutCatch = async () => {
    console.log('SIP PN debug: set sipState connecting')
    const s = getAuthStore()
    s.sipState = 'connecting'
    sipErrorEmitter.removeAllListeners()
    sipErrorEmitter.on('error', () => {
      console.log('SIP PN debug: got error from sipErrorEmitter')
      this.dispose()
      this.authWithCheck()
    })
    //
    if (isSipPnExpired(s.sipPn)) {
      s.sipPn = {}
    }
    const pn = s.sipPn
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
    pn.sipAuth = await pbx.createSIPAccessToken(pn.phoneId)
    pn.sipAuthAt = Date.now()
    await this.authPnWithoutCatch(pn)
  }

  authWithCheck = async () => {
    const s = getAuthStore()
    if (isSipPnExpired(s.sipPn)) {
      s.sipPn = {}
    }
    const sipShouldAuth = s.sipShouldAuth()
    console.log(`SIP PN debug: authWithCheck ${sipShouldAuth}`, {
      sipState: s.sipState,
      signedInId: !!s.signedInId,
      sipAuth: !!s.sipPn.sipAuth,
      pbxState: s.pbxState,
      sipTotalFailure: s.sipTotalFailure,
    })
    if (!sipShouldAuth) {
      return
    }
    if (s.sipTotalFailure > 1) {
      s.sipState = 'waiting'
      await waitTimeout(
        s.sipTotalFailure < 5 ? s.sipTotalFailure * 1000 : 15000,
      )
      if (s.sipState !== 'waiting') {
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
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authSIP = new AuthSIP()

// Empty or expire after 90 seconds
const isSipPnExpired = (pn: Partial<SipPn>) =>
  !pn.sipAuthAt || Date.now() - pn.sipAuthAt > 90000
