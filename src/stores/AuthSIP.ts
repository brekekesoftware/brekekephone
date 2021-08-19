import CiruclarJSON from 'circular-json'
import { debounce } from 'lodash'
import { action, autorun, Lambda } from 'mobx'

import { PbxGetProductInfoRes } from '../api/brekekejs'
import pbx from '../api/pbx'
import sip from '../api/sip'
import updatePhoneIndex from '../api/updatePhoneIndex'
import { SipPn } from '../utils/PushNotification-parse'
import { getAuthStore } from './authStore'
import { intlDebug } from './intl'
import RnAlert from './RnAlert'
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
    console.error('SIP PN debug: set sipState stopped dispose')
    this.clearObserve?.()
    const s = getAuthStore()
    s.sipPn = {}
    s.sipState = 'stopped'
    sip.stopWebRTC()
  }

  private authPnWithoutCatch = async (pn: Partial<SipPn>) => {
    const p = getAuthStore().currentProfile
    if (!p) {
      console.error('SIP PN debug: Already signed out after long await')
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
    let dtmfSendMode = Number(pn.dtmfPal)
    if (isNaN(dtmfSendMode)) {
      dtmfSendMode = pn.dtmfPal === 'false' || pn.dtmfPal === '0' ? 0 : 1
    }
    await sip.connect({
      hostname: p.pbxHostname,
      port: pn.sipWssPort,
      username: pn.phoneId,
      accessToken: pn.sipAuth,
      pbxTurnEnabled: p.pbxTurnEnabled,
      dtmfSendMode,
      turnConfig,
    })
  }

  @action private authWithoutCatch = async () => {
    console.error('SIP PN debug: set sipState connecting')
    const s = getAuthStore()
    s.sipState = 'connecting'
    sipErrorEmitter.removeAllListeners()
    sipErrorEmitter.on('error', () => {
      console.error('SIP PN debug: got error from sipErrorEmitter')
      this.dispose()
      this.authWithCheck()
    })
    //
    const pn = s.sipPn
    if (pn.sipAuth) {
      console.error('SIP PN debug: AuthSIP.authPnWithoutCatch')
      this.authPnWithoutCatch(pn)
      return
    }
    console.error('SIP PN debug: AuthSIP.authWithoutCatch')
    //
    pn.sipWssPort = pn.sipWssPort || (await getPbxConfig('sip.wss.port'))
    pn.dtmfPal = pn.dtmfPal || (await getPbxConfig('webrtcclient.dtmfSendMode'))
    pn.turnServer =
      pn.turnServer || (await getPbxConfig('webphone.turn.server'))
    pn.turnUsername =
      pn.turnUsername || (await getPbxConfig('webphone.turn.username'))
    pn.turnCredential =
      pn.turnCredential || (await getPbxConfig('webphone.turn.credential'))
    pn.phoneId = pn.phoneId || (await updatePhoneIndex().then(p => p?.id))
    if (!pn.phoneId) {
      // Already logged out and show error above?
      return
    }
    pn.sipAuth = await pbx.createSIPAccessToken(pn.phoneId)
    await this.authPnWithoutCatch(pn)
  }
  authWithCheck = () => {
    const s = getAuthStore()
    const sipShouldAuth = s.sipShouldAuth()
    console.error(
      `SIP PN debug: authWithCheck ${sipShouldAuth} ${JSON.stringify({
        sipState: s.sipState,
        signedInId: !!s.signedInId,
        sipAuth: !!s.sipPn.sipAuth,
        pbxState: s.pbxState,
        sipTotalFailure: s.sipTotalFailure,
      })}`,
    )
    if (!sipShouldAuth) {
      return
    }
    this.authWithoutCatch().catch(
      action((err: Error) => {
        console.error('SIP PN debug: set sipState failure catch')
        s.sipState = 'failure'
        s.sipTotalFailure += 1
        sip.stopWebRTC()
        RnAlert.error({
          message: intlDebug`Failed to connect to SIP`,
          err,
        })
      }),
    )
  }
  private authWithCheckDebounced = debounce(this.authWithCheck, 300)
}

export const authSIP = new AuthSIP()
