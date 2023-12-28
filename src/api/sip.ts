import EventEmitter from 'eventemitter3'
import jsonStableStringify from 'json-stable-stringify'
import { Platform } from 'react-native'

import { CallOptions, Session, Sip } from '../brekekejs'
import { currentVersion } from '../components/variables'
import { embedApi } from '../embed/embedApi'
import { accountStore, AccountUnique } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { Call, CallConfig } from '../stores/Call'
import { getCallStore } from '../stores/callStore'
import { cancelRecentPn } from '../stores/cancelRecentPn'
import { chatStore } from '../stores/chatStore'
import { ParsedPn } from '../utils/PushNotification-parse'
import { toBoolean } from '../utils/string'
import { waitTimeout } from '../utils/waitTimeout'
import { getCameraSourceIds } from './getCameraSourceId'
import { pbx } from './pbx'
import { turnConfig } from './turnConfig'

type DeviceInputWeb = {
  deviceId: string
  kind: string
  label: string
  groupId: string
  facing: string
}
const alreadyRemovePnTokenViaSip: { [k: string]: boolean } = {}
export const checkAndRemovePnTokenViaSip = async (n: ParsedPn) => {
  const acc = await accountStore.findByPn(n)
  const k = n.id || jsonStableStringify(n)
  if (!alreadyRemovePnTokenViaSip[k] && !acc) {
    alreadyRemovePnTokenViaSip[k] = true
    removePnTokenViaSip(n)
  }
  return acc
}

const removePnTokenViaSip = async (n: ParsedPn) => {
  const s = getCallStore()
  if (n.callkeepUuid) {
    s.onCallKeepEndCall(n.callkeepUuid)
  }
  if (!n.sipPn.sipAuth) {
    console.log(
      `checkAndRemovePnTokenViaSip debug: no sip auth token isCall=${n.isCall}`,
    )
    return
  }
  console.log('checkAndRemovePnTokenViaSip debug: begin')
  const phone = getWebrtcClient(toBoolean(n.sipPn.dtmfSendPal))
  const userAgent = await getUserAgent(n)
  phone.startWebRTC({
    register: false,
    url: getWssUrl(n.pbxHostname, n.sipPn.sipWssPort || n.pbxPort),
    tls: true,
    user: n.sipPn.phoneId,
    auth: n.sipPn.sipAuth,
    useVideoClient: true,
    userAgent,
  })
  const started = await new Promise(async r => {
    phone.addEventListener('phoneStatusChanged', e => {
      if (e.phoneStatus === 'started') {
        r(true)
      }
    })
    await waitTimeout(10000)
    r(false)
  })
  const o = phone._ua?.registrator?.()!
  if (!started || !o) {
    console.log(
      `checkAndRemovePnTokenViaSip debug: started=${started} registrator=${!!o}`,
    )
  }
  o._registered = true
  o.setExtraHeaders(['X-PN-Manage: remove'])
  phone.stopWebRTC()
  console.log('checkAndRemovePnTokenViaSip debug: done')
}

export class SIP extends EventEmitter {
  phone?: Sip
  currentCamera: string | undefined = '1'

  cameraIds?: DeviceInputWeb[] = []
  private init = async (o: SipLoginOption) => {
    this.cameraIds = await getCameraSourceIds()

    this.currentCamera = this.cameraIds?.[0]?.deviceId || '1'

    const phone = getWebrtcClient(o.dtmfSendPal, this.currentCamera)
    this.phone = phone

    // emit to embed api
    if (!window._BrekekePhoneWebRoot) {
      embedApi.emit('webrtcclient', phone)
    }

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
        console.log(`SIP PN debug: phoneStatusChanged: phoneStatus=${s}`)
        this.phone?._removeEventListenerPhoneStatusChange?.()
        this.phone = undefined
      }
    }
    phone.addEventListener('phoneStatusChanged', h)
    phone._removeEventListenerPhoneStatusChange = () => {
      phone._removeEventListenerPhoneStatusChange = undefined
      phone.removeEventListener('phoneStatusChanged', h)
    }

    const computeCallPatch = async (ev: Session) => {
      const m = ev.incomingMessage
      //
      const withSDP =
        ev.rtcSession.direction === 'outgoing' &&
        ev.sessionStatus === 'progress' &&
        !!m?.body
      //
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
      const d = await getAuthStore().getCurrentDataAsync()
      partyName =
        partyName ||
        d.recentCalls.find(c => c.partyNumber === partyNumber)?.partyName ||
        partyNumber
      //
      const arr = m?.getHeader('X-PBX-Session-Info')?.split(';')
      const patch: Partial<Call> = {
        rawSession: ev,
        id: ev.sessionId,
        pnId: m?.getHeader('X-PN-ID'),
        incoming: ev.rtcSession.direction === 'incoming',
        partyNumber,
        partyName,
        remoteVideoEnabled: ev.remoteWithVideo,
        localVideoEnabled: ev.withVideo,
        sessionStatus: ev.sessionStatus,
        callConfig: getCallConfigFromHeader(m?.getHeader('X-WEBPHONE-CALL')),
        answered: ev.sessionStatus === 'connected',
        voiceStreamObject: ev.remoteStreamObject,
        withSDP,
        earlyMedia: withSDP ? ev.remoteStreamObject : null,
        partyImageUrl: m?.getHeader('X-PBX-IMAGE-RINGING'),
        talkingImageUrl: m?.getHeader('X-PBX-IMAGE-TALKING'),
        partyImageSize: m?.getHeader('X-PBX-IMAGE-SIZE'),
        pbxTenant: arr?.[0],
        pbxRoomId: arr?.[1],
        pbxTalkerId: arr?.[2],
        pbxUsername: arr?.[3],
      }
      if (!patch.pbxTalkerId) {
        delete patch.pbxTalkerId
      }
      for (const k in patch) {
        if (patch[k] === undefined) {
          delete patch[k]
        }
      }
      return patch
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
    phone.addEventListener('sessionCreated', async ev => {
      if (!ev) {
        return
      }
      const p = await computeCallPatch(ev)
      this.emit('session-started', p)
    })
    phone.addEventListener('sessionStatusChanged', async ev => {
      if (!ev) {
        return
      }
      if (ev.sessionStatus === 'terminated') {
        this.emit('session-stopped', ev)
        return
      }
      const p = await computeCallPatch(ev)
      this.emit('session-updated', p)
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
      console.error('sip.phone.rtcErrorOccurred:', ev)
    })

    return phone
  }

  connect = async (o: SipLoginOption, a: AccountUnique) => {
    console.log('SIP PN debug: call sip.stopWebRTC in sip.connect')
    this.phone?._removeEventListenerPhoneStatusChange?.()
    this.stopWebRTC()
    const phone = await this.init(o)
    //
    const callOptions = ((o.pbxTurnEnabled && turnConfig) || {}) as CallOptions
    if (!callOptions.pcConfig) {
      callOptions.pcConfig = {}
    }
    if (!Array.isArray(callOptions.pcConfig.iceServers)) {
      callOptions.pcConfig.iceServers = []
    }
    if (o.turnConfig) {
      callOptions.pcConfig.iceServers.push(o.turnConfig)
    }
    phone.setDefaultCallOptions(callOptions)
    //
    const userAgent = await getUserAgent(a)
    phone.startWebRTC({
      url: getWssUrl(o.hostname, o.port),
      tls: true,
      user: o.username,
      auth: o.accessToken,
      useVideoClient: true,
      userAgent,
    })
    //
    console.log('SIP PN debug: added listener on _ua')
    phone._ua?.on('newNotify', e => {
      const data = e?.request?.data
      if (!data) {
        return
      }
      console.log(`SIP PN debug: newNotify fired on _ua data=${data}`)
      const pnIds = parseCanceledPnIds(data)
      if (!pnIds?.length) {
        return
      }
      console.log(
        `SIP PN debug: newNotify canceled pnIds=${JSON.stringify(pnIds)}`,
      )
      pnIds.forEach(cancelRecentPn)
    })
  }

  private hackJssipFork = () => {
    const socket = sip.phone?._ua?._transport?.socket
    if (socket) {
      Object.assign(socket, { __brekekephone_stopped: true })
    }
  }
  stopWebRTC = () => {
    const count = this.phone?.getSessionCount()
    if (count) {
      console.error(
        `SIP PN debug: sip.stopWebRTC: should not stop because getSessionCount=${count}`,
      )
    }
    this.hackJssipFork()
    if (this.phone) {
      console.log('SIP PN debug: sip.stopWebRTC: call phone.stopWebRTC')
      this.phone.stopWebRTC()
      this.phone = undefined
    } else {
      console.log('SIP PN debug: sip.stopWebRTC: already disconnected')
    }
  }
  destroyWebRTC = () => {
    this.hackJssipFork()
    if (this.phone) {
      console.log('SIP PN debug: sip.destroyWebRTC: call phone.destroyWebRTC')
      this.phone.destroyWebRTC()
      this.phone = undefined
    } else {
      console.log('SIP PN debug: sip.destroyWebRTC: already disconnected')
    }
  }

  hangupSession = (sessionId: string) => {
    const session = this.phone?.getSession(sessionId)
    return session?.rtcSession?.terminate()
  }
  disableMedia = (sessionId: string) => {
    const session = this.phone?.getSession(sessionId)
    session?.remoteStreamObject?.getTracks().forEach(track => {
      track.enabled = false
    })
  }
  enableMedia = (sessionId: string) => {
    const session = this.phone?.getSession(sessionId)
    session?.remoteStreamObject?.getTracks().forEach(track => {
      track.enabled = true
    })
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
  switchCamera = async (sessionId: string, isFrontCamera: boolean) => {
    // alert(this.currentFrontCamera)
    if (!this.phone) {
      return
    }
    // get camera info again for web mobile
    if (this.cameraIds === undefined || this.cameraIds.length === 0) {
      this.cameraIds = await getCameraSourceIds()
    }
    // if don't have camera
    if (this.cameraIds === undefined || this.cameraIds.length === 0) {
      return
    }
    const cameras = this.cameraIds.map(s => s.deviceId)
    this.currentCamera = isFrontCamera ? cameras[1] : cameras[0]

    const videoOptions = {
      call: {
        mediaConstraints: sipCreateMediaConstraints(
          this.currentCamera,
          isFrontCamera,
        ),
      },
      answer: {
        mediaConstraints: sipCreateMediaConstraints(
          this.currentCamera,
          isFrontCamera,
        ),
      },
    }
    this.phone?.setWithVideo(sessionId, false, videoOptions)
    this.phone?.setWithVideo(sessionId, true, videoOptions)
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

const parseCanceledPnIds = (data?: string) => {
  if (!data || !/Canceled/i.test(data)) {
    return
  }
  const m = data.match(/Content-Length:\s*(\d+)\s*/i)
  if (!m) {
    return
  }
  const i = m.index
  const l = parseInt(m[1])
  if (typeof i !== 'number' || isNaN(l)) {
    return
  }
  const msg = data.substr(i + m[0].length)
  console.log(`parseCanceledPnIds: msg.length=${msg.length} l=${l}`)
  return msg.split(/\n/g).map(s => {
    const lowers = s.toLowerCase()
    return lowers.replace(/\s+/g, '').includes(',canceled')
      ? {
          pnId: s.match(/(\w+)\W*INVITE/)?.[1],
          completedElseWhere: lowers.includes('call completed elsewhere'),
        }
      : undefined
  })
}

const osMap: { [k: string]: string } = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
}
const getUserAgent = async (a: ParsedPn | AccountUnique) => {
  const au = 'to' in a ? await accountStore.findByPn(a) : a
  const d = await accountStore.findData(au)
  if (d?.userAgent) {
    return d.userAgent
  }
  const os = osMap[Platform.OS]
  return `Brekeke Phone for ${os} ${currentVersion}, JsSIP 3.2.15`
}

const getWssUrl = (host?: string, port?: string) =>
  `wss://${host}:${port}/phone`

const sipCreateMediaConstraints = (
  sourceId?: string,
  isFrontCamera?: boolean,
) => {
  // web change config for browser chromium 2016
  // https://bugs.chromium.org/p/chromium/issues/detail?id=614716
  const webVideoConfig = {
    facingMode: isFrontCamera ? 'user' : 'environment',
    deviceId: sourceId ? { exact: sourceId } : undefined,
  }
  const appVideoConfig = {
    mandatory: {
      minWidth: 0,
      minHeight: 0,
      minFrameRate: 0,
    },
    facingMode: isFrontCamera ? 'user' : 'environment',
    optional: sourceId ? [{ sourceId }] : [],
  }

  return {
    audio: false,
    video: Platform.OS === 'web' ? webVideoConfig : appVideoConfig,
  } as any as MediaStreamConstraints
}
const getWebrtcClient = (dtmfSendPal = false, sourceId?: string) =>
  new window.Brekeke.WebrtcClient.Phone({
    logLevel: 'all',
    multiSession: 1,
    defaultOptions: {
      videoOptions: {
        call: {
          mediaConstraints: sipCreateMediaConstraints(sourceId, true),
        },
        answer: {
          mediaConstraints: sipCreateMediaConstraints(sourceId, true),
        },
      },
    },
    dtmfSendPal,
    ctiAutoAnswer: 1,
    eventTalk: 1,
    configuration: {
      socketKeepAlive: 60,
    },
  })

const getCallConfigFromHeader = (config?: string): CallConfig =>
  config
    ? Object.fromEntries(
        config
          .split(';')
          .map(c =>
            c
              .split(':')
              .map(kv => kv.trim())
              .filter(kv => kv),
          )
          .filter(a => a.length === 2),
      )
    : {}
