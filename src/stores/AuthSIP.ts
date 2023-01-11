import CiruclarJSON from 'circular-json'
import { debounce } from 'lodash'
import { action, autorun, Lambda } from 'mobx'

import { PbxGetProductInfoRes } from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { sip } from '../api/sip'
import { updatePhoneIndex } from '../api/updatePhoneIndex'
import { SipPn } from '../utils/PushNotification-parse'
import { toBoolean } from '../utils/string'
import { waitTimeout } from '../utils/waitTimeout'
import { getAuthStore } from './authStore'
import { sipErrorEmitter } from './sipErrorEmitter'

const getPbxConfig = <K extends keyof PbxGetProductInfoRes>(k: K) =>
  pbx.getConfig().then(c => c && c[k])

class AuthSIP {
  private clearObserve?: Lambda

  auth = () => {
    this.authWithCheck()
    this.clearObserve?.()
    const s = getAuthStore()
    this.clearObserve = autorun(() => {
      void s.sipShouldAuth()
      this.authWithCheckDebounced()
    })
  }
  @action dispose = () => {
    console.log('SIP PN debug: set sipState stopped dispose')
    this.clearObserve?.()
    const s = getAuthStore()
    s.sipState = 'stopped'
    sip.stopWebRTC()
  }

  private authPnWithoutCatch = async (pn: Partial<SipPn>) => {
    const p = getAuthStore().getCurrentAccount()
    if (!p) {
      console.log('SIP PN debug: Already signed out after long await')
      return
    }
    if (!pn.sipAuth || !pn.sipWssPort || !pn.phoneId) {
      console.error(
        `SIP PN debug: Invalid sip PN data: ${CiruclarJSON.stringify(pn)}`,
      )
      this.dispose()
      return
    }
    const turnConfig: RTCIceServer | undefined = pn.turnServer
      ? {
          urls: pn.turnServer.split(',').map(s => s.trim()),
          username: pn.turnUsername,
          credential: pn.turnCredential,
        }
      : undefined
    await sip.connect({
      hostname: p.pbxHostname,
      port: pn.sipWssPort,
      username: pn.phoneId,
      accessToken: pn.sipAuth,
      pbxTurnEnabled: p.pbxTurnEnabled,
      dtmfSendPal: toBoolean(pn.dtmfSendPal),
      turnConfig,
    })
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

  private waitingTimeout = false
  authWithCheck = async () => {
    const s = getAuthStore()
    if (!s.sipPn.sipAuthAt || Date.now() - s.sipPn.sipAuthAt > 90000) {
      // Empty or expire after 90 seconds
      s.sipPn = {}
    }
    const sipShouldAuth = s.sipShouldAuth()
    console.log(
      `SIP PN debug: authWithCheck ${sipShouldAuth} ${JSON.stringify({
        sipState: s.sipState,
        signedInId: !!s.signedInId,
        sipAuth: !!s.sipPn.sipAuth,
        pbxState: s.pbxState,
        sipTotalFailure: s.sipTotalFailure,
        waitingTimeout: this.waitingTimeout,
      })}`,
    )
    if (!sipShouldAuth || this.waitingTimeout) {
      return
    }
    if (s.sipTotalFailure > 1) {
      const timeWait = s.sipTotalFailure < 5 ? s.sipTotalFailure * 1000 : 15000
      this.waitingTimeout = true
      await waitTimeout(timeWait)
    }
    this.authWithoutCatch().catch(
      action((err: Error) => {
        console.log('SIP PN debug: set sipState failure catch')
        s.sipState = 'failure'
        s.sipTotalFailure += 1
        sip.stopWebRTC()
        console.error('Failed to connect to sip:', err)
      }),
    )
    this.waitingTimeout = false
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authSIP = new AuthSIP()
