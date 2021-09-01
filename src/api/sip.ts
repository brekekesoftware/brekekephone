import 'brekekejs/lib/jsonrpc'
import 'brekekejs/lib/webrtcclient'

import EventEmitter from 'eventemitter3'
import { Platform } from 'react-native'

import { currentVersion } from '../components/variables'
import { cancelRecentPn } from '../stores/cancelRecentPn'
import { chatStore } from '../stores/chatStore'
import { CallOptions, Sip } from './brekekejs'
import { getFrontCameraSourceId } from './getFrontCameraSourceId'
import { pbx } from './pbx'
import { turnConfig } from './turnConfig'

const sipCreateMediaConstraints = (sourceId?: string) => {
  return {
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
  } as unknown as MediaStreamConstraints
}

export class SIP extends EventEmitter {
  phone?: Sip
  private init = async (o: SipLoginOption) => {
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
      dtmfSendPal: o.dtmfSendPal,
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
        this.emit('connection-started')
        return
      }
      const s = ev.phoneStatus
      if (s === 'stopping' || s === 'stopped') {
        phone._removeEventListenerPhoneStatusChange?.()
        this.emit('connection-stopped', ev)
        console.error(`SIP PN debug: phoneStatusChanged: phoneStatus=${s}`)
        this.phone?._removeEventListenerPhoneStatusChange?.()
        this.phone = undefined
      }
    }
    phone.addEventListener('phoneStatusChanged', h)
    phone._removeEventListenerPhoneStatusChange = () => {
      phone._removeEventListenerPhoneStatusChange = undefined
      phone.removeEventListener('phoneStatusChanged', h)
    }

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
      const partyNumber = ev.rtcSession.remote_identity.uri.user
      let partyName = ev.rtcSession.remote_identity.display_name
      if (
        (!partyName || partyName.startsWith('uc')) &&
        partyNumber.startsWith('uc')
      ) {
        partyName =
          chatStore.getGroupById(partyNumber.replace('uc', ''))?.name ||
          partyName ||
          partyNumber
      }
      partyName = partyName || partyNumber

      this.emit('session-started', {
        id: ev.sessionId,
        pnId: ev.incomingMessage?.getHeader('X-PN-ID'),
        incoming: ev.rtcSession.direction === 'incoming',
        partyNumber,
        partyName,
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
        const pbxSessionInfo =
          ev.incomingMessage.getHeader('X-PBX-Session-Info')
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

    return phone
  }

  connect = async (sipLoginOption: SipLoginOption) => {
    console.error('SIP PN debug: call sip.stopWebRTC in sip.connect')
    this.phone?._removeEventListenerPhoneStatusChange?.()
    this.stopWebRTC()
    const phone = await this.init(sipLoginOption)
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
    const appVersion = currentVersion
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
    phone.setDefaultCallOptions(callOptions)
    //
    phone.startWebRTC({
      url: `wss://${sipLoginOption.hostname}:${sipLoginOption.port}/phone`,
      tls: true,
      user: sipLoginOption.username,
      auth: sipLoginOption.accessToken,
      useVideoClient: true,
      userAgent: lUseragent,
    })

    console.error('SIP PN debug: added listener on _ua')

    // temporary cancel PN via SIP ua
    phone._ua?.on('newNotify', e => {
      const pnIds = e?.request?.data
        ?.match(/\w+\W*INVITE\s*,.+,\s*Canceled/)?.[0]
        ?.split(/,\s*Canceled/)
        .map(s => s.trim())
        .filter(s => s)
        .map(s => s.match(/(\w+)\W*INVITE/)?.[1])
        .filter(s => s)
      console.error(`SIP PN debug: newNotify fired on _ua pnIds=${pnIds}`)
      pnIds?.forEach(cancelRecentPn)
    })
  }

  private hackJssipFork = () => {
    const socket = sip.phone?._ua?._transport?.socket
    socket && Object.assign(socket, { __brekekephone_stopped: true })
  }
  stopWebRTC = () => {
    this.hackJssipFork()
    if (this.phone) {
      console.error('SIP PN debug: sip.stopWebRTC: call phone.stopWebRTC')
      this.phone.stopWebRTC()
      this.phone = undefined
    } else {
      console.error('SIP PN debug: sip.stopWebRTC: already disconnected')
    }
  }
  destroyWebRTC = () => {
    this.hackJssipFork()
    if (this.phone) {
      console.error('SIP PN debug: sip.destroyWebRTC: call phone.destroyWebRTC')
      this.phone.destroyWebRTC()
      this.phone = undefined
    } else {
      console.error('SIP PN debug: sip.destroyWebRTC: already disconnected')
    }
  }

  createSession = (number: string, opts: { videoEnabled?: boolean } = {}) => {
    return this.phone?.makeCall(number, null, opts.videoEnabled)
  }

  hangupSession = (sessionId: string) => {
    const session = this.phone?.getSession(sessionId)
    const rtcSession = session && session.rtcSession
    return rtcSession && rtcSession.terminate()
  }
  answerSession = (
    sessionId: string,
    opts: { videoEnabled?: boolean } = {},
  ) => {
    return this.phone?.answer(sessionId, null, opts.videoEnabled)
  }
  sendDTMF = async (p: {
    signal: string
    sessionId: string
    tenant: string
    talkerId: string
  }) => {
    if (!this.phone) {
      return
    }
    const c = await pbx.getConfig()
    const dtmfSendMode = Number(c?.['webrtcclient.dtmfSendMode']) || 0
    this.phone._options.dtmfSendMode = dtmfSendMode
    this.phone.dtmfSendMode = dtmfSendMode
    return !this.phone._options.dtmfSendPal
      ? this.phone.sendDTMF(p.signal, p.sessionId)
      : pbx.sendDTMF(p.signal, p.tenant, p.talkerId)
  }
  enableVideo = (sessionId: string) => {
    return this.phone?.setWithVideo(sessionId, true)
  }
  disableVideo = (sessionId: string) => {
    return this.phone?.setWithVideo(sessionId, false)
  }
  setMuted = (muted: boolean, sessionId: string) => {
    return this.phone?.setMuted({ main: muted }, sessionId)
  }
}

export const sip = new SIP()

export interface SipLoginOption {
  hostname: string
  port: string
  pbxTurnEnabled: boolean
  username: string
  accessToken: string
  dtmfSendPal: boolean
  turnConfig?: RTCIceServer
}
