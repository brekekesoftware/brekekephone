import 'brekekejs/lib/jsonrpc'
import 'brekekejs/lib/webrtcclient'

import EventEmitter from 'eventemitter3'
import { Platform } from 'react-native'

import appPackageJson from '../../package.json'
import { cancelRecentPn } from '../stores/cancelRecentPn'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { CallOptions, Sip } from './brekekejs'
import getFrontCameraSourceId from './getFrontCameraSourceId'
import pbx from './pbx'
import turnConfig from './turnConfig'

const sipCreateMediaConstraints = (sourceId?: string) => {
  return ({
    audio: false,
    video: {
      mandatory: {
        minWidth: 0,
        minHeight: 0,
        minFrameRate: 0,
      },
      facingMode: Platform.OS === 'web' ? undefined : 'user',
      optional: sourceId ? [{ sourceId }] : [],
    },
  } as unknown) as MediaStreamConstraints
}

export class SIP extends EventEmitter {
  phone: Sip = null!
  init = async (o: SipLoginOption) => {
    const sourceId = await getFrontCameraSourceId()
    const phone = new window.Brekeke.WebrtcClient.Phone({
      logLevel: 'all',
      multiSession: 1,
      defaultOptions: {
        videoOptions: {
          call: {
            mediaConstraints: sipCreateMediaConstraints(sourceId),
          },
          answer: {
            mediaConstraints: sipCreateMediaConstraints(sourceId),
          },
        },
      },
      dtmfSendMode: isNaN(o.dtmfSendMode) ? 1 : o.dtmfSendMode,
      ctiAutoAnswer: 1,
      eventTalk: 1,
      configuration: {
        socketKeepAlive: 60,
      },
    })
    this.phone = phone

    const h = (ev: { phoneStatus: string }) => {
      if (!ev) {
        return
      }
      if (ev.phoneStatus === 'started') {
        return this.emit('connection-started')
      }
      if (ev.phoneStatus === 'stopping' || ev.phoneStatus === 'stopped') {
        phone.removeEventListener('phoneStatusChanged', h)
        BackgroundTimer.setTimeout(() => this.disconnect(), 0)
        BackgroundTimer.setTimeout(
          () => this.emit('connection-stopped', ev),
          300,
        )
      }
      return
    }
    phone.addEventListener('phoneStatusChanged', h)

    // sessionId: "1"
    // sessionStatus: "dialing"
    // answering: false
    // audio: true
    // video: false
    // remoteStreamObject: MediaStream{...}
    // localStreamObject: MediaStream{...}
    // remoteWithVideo: false
    // withVideo: true
    // shareStream: false
    // exInfo: ""
    // muted: {main: false, videoClient: false}
    // localVideoStreamObject: null
    // videoClientSessionTable: {}
    // rtcSession: RTCSession{...}
    // incomingMessage: null
    // remoteUserOptionsTable: {}
    // analyser: null
    phone.addEventListener('sessionCreated', ev => {
      if (!ev) {
        return
      }
      this.emit('session-started', {
        id: ev.sessionId,
        incoming: ev.rtcSession.direction === 'incoming',
        partyNumber: ev.rtcSession.remote_identity.uri.user,
        partyName: ev.rtcSession.remote_identity.display_name,
        remoteVideoEnabled: ev.remoteWithVideo,
        localVideoEnabled: ev.withVideo,
      })
    })
    phone.addEventListener('sessionStatusChanged', ev => {
      if (!ev) {
        return
      }
      if (ev.sessionStatus === 'terminated') {
        return this.emit('session-stopped', ev.sessionId)
      }
      const patch = {
        id: ev.sessionId,
        answered: ev.sessionStatus === 'connected',
        voiceStreamObject: ev.remoteStreamObject,
        localVideoEnabled: ev.withVideo,
        remoteVideoEnabled: ev.remoteWithVideo,
        pbxTenant: '',
        pbxRoomId: '',
        pbxTalkerId: '',
        pbxUsername: '',
      }
      if (ev.incomingMessage) {
        const pbxSessionInfo = ev.incomingMessage.getHeader(
          'X-PBX-Session-Info',
        )
        if (typeof pbxSessionInfo === 'string') {
          const infos = pbxSessionInfo.split(';')
          patch.pbxTenant = infos[0]
          patch.pbxRoomId = infos[1]
          patch.pbxTalkerId = infos[2]
          patch.pbxUsername = infos[3]
        }
      }
      this.emit('session-updated', patch)
      return
    })

    phone.addEventListener('videoClientSessionCreated', ev => {
      if (!ev) {
        return
      }
      const session = phone.getSession(ev.sessionId)
      const videoSession =
        session.videoClientSessionTable[ev.videoClientSessionId]
      this.emit('session-updated', {
        id: ev.sessionId,
        videoSessionId: ev.videoClientSessionId,
        remoteVideoEnabled: true,
        remoteVideoStreamObject: videoSession.remoteStreamObject,
      })
    })
    phone.addEventListener('videoClientSessionEnded', ev => {
      if (!ev) {
        return
      }
      this.emit('session-updated', {
        id: ev.sessionId,
        videoSessionId: ev.videoClientSessionId,
        remoteVideoEnabled: false,
        remoteVideoStreamObject: null,
      })
    })

    phone.addEventListener('rtcErrorOccurred', ev => {
      console.error('sip.phone.rtcErrorOccurred:', ev) // TODO
    })
  }

  connect = async (sipLoginOption: SipLoginOption) => {
    this.disconnect()
    await this.init(sipLoginOption)
    //
    let platformOs: string = Platform.OS
    if (platformOs === 'ios') {
      platformOs = 'iOS'
    } else if (platformOs === 'android') {
      platformOs = 'Android'
    } else if (platformOs === 'web') {
      platformOs = 'Web'
    }
    //
    const jssipVersion = '3.2.15'
    const appVersion = appPackageJson.version
    const lUseragent =
      'Brekeke Phone for ' +
      platformOs +
      ' ' +
      appVersion +
      '/JsSIP ' +
      jssipVersion
    //
    const callOptions = ((sipLoginOption.pbxTurnEnabled && turnConfig) ||
      {}) as CallOptions
    if (!callOptions.pcConfig) {
      callOptions.pcConfig = {}
    }
    if (!Array.isArray(callOptions.pcConfig.iceServers)) {
      callOptions.pcConfig.iceServers = []
    }
    if (sipLoginOption.turnConfig) {
      callOptions.pcConfig.iceServers.push(sipLoginOption.turnConfig)
    }
    this.phone.setDefaultCallOptions(callOptions)
    //
    this.phone.startWebRTC({
      url: `wss://${sipLoginOption.hostname}:${sipLoginOption.port}/phone`,
      tls: true,
      user: sipLoginOption.username,
      auth: sipLoginOption.accessToken,
      useVideoClient: true,
      userAgent: lUseragent,
    })

    console.error('SIP PN debug: added listener on _ua')

    const ua = (this.phone as any)._ua
    ua?.on('newNotify', (e: any) => {
      const d = e?.request?.data
      const canceled = d && /INVITE,.+, Canceled/.test(d)
      console.error(
        `SIP PN debug: newNotify fired on _ua, canceled=${canceled}`,
      )
      if (canceled) {
        cancelRecentPn()
      }
    })
  }

  disconnect = () => {
    if (this.phone) {
      this.phone.stopWebRTC()
      this.phone = null!
    }
  }

  createSession = (number: string, opts: { videoEnabled?: boolean } = {}) => {
    return this.phone.makeCall(number, null, opts.videoEnabled)
  }

  hangupSession = (sessionId: string) => {
    const session = this.phone.getSession(sessionId)
    const rtcSession = session && session.rtcSession
    return rtcSession && rtcSession.terminate()
  }
  answerSession = (
    sessionId: string,
    opts: { videoEnabled?: boolean } = {},
  ) => {
    return this.phone.answer(sessionId, null, opts.videoEnabled)
  }
  sendDTMF = async (p: {
    signal: string
    sessionId: string
    tenant: string
    talkerId: string
  }) => {
    const c = await pbx.getConfig()
    const dtmfSendMode = c['webrtcclient.dtmfSendMode']
    if (dtmfSendMode && dtmfSendMode !== 'false' && dtmfSendMode !== '0') {
      await pbx.client._pal('sendDTMF', {
        signal: p.signal,
        tenant: p.tenant,
        talker_id: p.talkerId,
      })
      return
    }
    return this.phone.sendDTMF(p.signal, p.sessionId)
  }
  enableVideo = (sessionId: string) => {
    return this.phone.setWithVideo(sessionId, true)
  }
  disableVideo = (sessionId: string) => {
    return this.phone.setWithVideo(sessionId, false)
  }
  setMuted = (muted: boolean, sessionId: string) => {
    return this.phone.setMuted({ main: muted }, sessionId)
  }
}

const sip = new SIP()
export default sip

export interface SipLoginOption {
  hostname: string
  port: string
  pbxTurnEnabled: boolean
  username: string
  accessToken: string
  dtmfSendMode: number
  turnConfig?: RTCIceServer
}
