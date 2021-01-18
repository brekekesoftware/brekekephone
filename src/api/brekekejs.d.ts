declare global {
  interface Window {
    Brekeke: Brekeke
  }
}

export type Brekeke = {
  pbx: {
    getPal(wsUri: string, options: GetPalOptions): Pbx
  }
  WebrtcClient: {
    Phone: Sip
  }
}

export type GetPalOptions = {
  tenant: string
  login_user: string
  login_password: string
  _wn: string
  park: string[]
  voicemail: string
  user: string
  status: boolean
  secure_login_password: boolean
  phonetype: string
}

/* PBX */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export type Pbx = PbxPal & {
  login(resolve: () => void, reject: ErrorHandler): void
  close(): void

  debugLevel: number

  onClose?(): void
  onError?(err: Error): void
  notify_serverstatus?(e: PbxEvent['serverStatus']): void
  notify_status?(e: PbxEvent['userStatus']): void
  notify_park?(e: PbxEvent['park']): void
  notify_voicemail?(e: PbxEvent['voicemail']): void

  // not actually exist in the sdk, should be added manually
  _pal<K extends keyof PbxPal, P = Parameters<PbxPal[K]>[0]>(
    k: K,
    ...p: P extends undefined ? [] : [P]
  ): Promise<Parameters<Parameters<PbxPal[K]>[1]>[0]>
}

export type PbxEvent = {
  serverStatus: {
    status: 'active' | 'inactive'
  }
  userStatus: {
    status: string
    user: string
    talker_id: string
  }
  park: {
    park: string
    status: 'on' | 'off'
  }
  voicemail: {
    new: number
  }
}

export type PbxPal = {
  getProductInfo(
    p: undefined,
    resolve: (i: PbxGetProductInfoRes) => void,
    reject: ErrorHandler,
  ): void
  createAuthHeader(
    p: PbxCreateAuthHeaderParam,
    resolve: (authHeader: string) => void,
    reject: ErrorHandler,
  ): void

  getExtensions(
    p: PbxGetExtensionsParam,
    resolve: (extensions: string[]) => void,
    reject: ErrorHandler,
  ): void
  getExtensionProperties<T extends string | string[]>(
    p: PbxGetExtensionPropertiesParam,
    resolve: (properties: T[]) => void,
    reject: ErrorHandler,
  ): void
  setExtensionProperties(
    p: PbxSetExtensionPropertiesParam,
    resolve: () => void,
    reject: ErrorHandler,
  ): void

  getContactList(
    p: PbxGetContactListParam,
    resolve: (res: PbxGetContactListItem[]) => void,
    reject: ErrorHandler,
  ): void
  getContact(
    p: PbxGetContactParam,
    resolve: (res: PbxContact) => void,
    reject: ErrorHandler,
  ): void
  setContact(
    p: PbxContact,
    resolve: (res: PbxContact) => void,
    reject: ErrorHandler,
  ): void

  pnmanage(p: PbxPnmanageParam, resolve: () => void, reject: ErrorHandler): void

  hold(p: PbxHoldParam, resolve: () => void, reject: ErrorHandler): void
  unhold: PbxPal['hold']

  startRecording: PbxPal['hold']
  stopRecording: PbxPal['hold']

  transfer(p: PbxTransferParam, resolve: () => void, reject: ErrorHandler): void

  conference: PbxPal['hold']
  cancelTransfer: PbxPal['hold']

  park(p: PbxParkParam, resolve: () => void, reject: ErrorHandler): void

  sendDTMF(p: PbxSendDtmfParam, resolve: () => void, reject: ErrorHandler): void
}
export type PbxGetProductInfoRes = {
  'sip.wss.port': string
  'webrtcclient.dtmfSendMode': number | string
  'webphone.dtmf.pal': string
  'webphone.turn.server': string
  'webphone.turn.username': string
  'webphone.turn.credential': string
  'webphone.uc.host': string
}
export type PbxCreateAuthHeaderParam = {
  username: string
}
export type PbxGetExtensionsParam = {
  tenant: string
  pattern: '..*'
  type: 'user'
  limit: number
}
export type PbxGetExtensionPropertiesParam = {
  tenant: string
  extension: T
  property_names: string[]
}
export type PbxSetExtensionPropertiesParam = {
  tenant: string
  extension: string
  properties: PbxExtensionProperties
}
export type PbxExtensionProperties = {
  p1_ptype?: string
  p2_ptype?: string
  p3_ptype?: string
  p4_ptype?: string
  pnumber: string
}
export type PbxGetContactListParam = {
  shared: string
  offset: number
  limit: number
}
export type PbxGetContactListItem = {
  aid: string
  display_name: string
}
export type PbxGetContactParam = {
  aid: string
}
export type PbxPnmanageParam = {
  command: string
  service_id: string
  application_id: string
  user_agent: string
  username: string
  device_id?: string
  endpoint?: string
  auth_secret?: string
  key?: string
}
export type PbxHoldParam = {
  tenant: string
  tid: string
}
export type PbxTransferParam = {
  tenant: string
  user: string
  tid: string
  mode?: string
}
export type PbxParkParam = {
  tenant: string
  tid: string
  number: string
}

export type PbxContact = {
  aid: string
  phonebook: string
  shared: string
  info: {
    $firstname: string
    $lastname: string
    $tel_work: string
    $tel_home: string
    $tel_mobile: string
    $address: string
    $company: string
    $email: string
    $title: string
    $hidden: string
  }
}
export type PbxSendDtmfParam = {
  tenant: string
  talker_id: string
  signal: string
}

/* SIP */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export type Sip = {
  new (o: SipConstructorOptions): Sip

  addEventListener<K extends keyof SipEventMap>(
    type: K,
    listener: (e: SipEventMap[K]) => void,
  ): void
  removeEventListener<K extends keyof SipEventMap>(
    type: K,
    listener: (e: SipEventMap[K]) => void,
  ): void

  startWebRTC(configuration: SipConfiguration): void
  stopWebRTC(): void

  setDefaultCallOptions(options: CallOptions): void
  getSession(sessionId: string): Session
  makeCall(number: string, options: null, videoEnabled?: boolean): void
  answer(sessionId: string, options: null, videoEnabled?: boolean): void
  setWithVideo(sessionId: string, withVideo?: boolean): void
  setMuted(options: { main: boolean }, sessionId: string): void

  sendDTMF(dtmf: string, sessionId: string): void
  getPhoneStatus(): string
}

export type SipConstructorOptions = {
  logLevel: string
  multiSession: number
  dtmfSendMode: number
  ctiAutoAnswer: number
  eventTalk: number
  defaultOptions: {
    videoOptions: {
      call: {
        mediaConstraints: MediaStreamConstraints
      }
      answer: {
        mediaConstraints: MediaStreamConstraints
      }
    }
  }
  configuration?: Partial<SipConfiguration>
}

export type SipConfiguration = {
  url?: string
  host?: string
  port?: string
  tls?: boolean

  user: string
  auth?: string
  password?: string

  useVideoClient?: boolean
  videoClientUser?: string

  user_agent?: string
  userAgent?: string
  register?: boolean
  socketKeepAlive?: number // unit: second
}

export type CallOptions = {
  pcConfig?: {
    iceServers?: RTCIceServer[]
    bundlePolicy?: RTCBundlePolicy
  }
}

export type SipEventMap = {
  phoneStatusChanged: PhoneStatusChangedEvent
  sessionCreated: Session
  sessionStatusChanged: Session
  videoClientSessionCreated: VideoSession
  videoClientSessionEnded: VideoSession
  rtcErrorOccurred: Error
}
export type PhoneStatusChangedEvent = {
  phoneStatus: 'starting' | 'started' | 'stopping' | 'stopped'
  from: string
  reason: string
  response: unknown
}
export type Session = {
  sessionId: string
  sessionStatus: 'dialing' | 'terminated' | 'connected'
  rtcSession: {
    remote_identity: {
      display_name: string
      uri: {
        user: string
      }
    }
    direction: 'outgoing' | 'incoming'
    terminate(): void
  }
  withVideo: boolean
  remoteWithVideo: boolean
  remoteStreamObject: MediaStream
  localStreamObject: MediaStream
  incomingMessage?: {
    getHeader(h: string): string
  }
  videoClientSessionTable: {
    [id: string]: Session
  }
  // Unused properties
  answering: boolean
  audio: boolean
  video: boolean
  shareStream: boolean
  exInfo: string
  muted: {
    main: boolean
    videoClient: boolean
  }
  remoteUserOptionsTable: null
  analyzer: null
}
export type VideoSession = {
  sessionId: string
  videoClientSessionId: string
}

/* UC */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export type UcErrors = {
  PLEONASTIC_LOGIN: number
}

export type UcChatClient = {
  new (log: UcLogger): UcChatClient
  setEventListeners(listeners: UcListeners): void
  signIn(
    uri: string,
    path: string,
    pbxTenant: string,
    pbxUsername: string,
    pbxPassword: string,
    option?: object,
    resolve: () => void,
    reject: ErrorHandler,
  ): void
  signOut(): void
  getProfile(): {
    user_id: string
    name: string
    profile_image_url: string
  }
  getStatus(): {
    status: number // 0 | 1 | 2 | 3
    display: string
  }
  changeStatus(
    status: string,
    dislay: string,
    resolve: () => void,
    reject: ErrorHandler,
  )
  getBuddylist(): {
    user: UcUser[]
  }
  receiveUnreadText(
    resolve: (res: UcReceieveUnreadText) => void,
    reject: ErrorHandler,
  )
  readText(map: object): void
  searchTexts(
    opt: UcSearchTextsParam,
    resolve: (res: UcSearchTexts) => void,
    reject: ErrorHandler,
  ): void
  sendText(
    text: string,
    opt: UcSendTextParam,
    resolve: (res: UcSendText) => void,
    reject: ErrorHandler,
  ): void
  sendConferenceText(
    text: string,
    conf_id: string,
    resolve: (res: UcSendText) => void,
    reject: ErrorHandler,
  ): void
  createConference(
    subject: string,
    members: string[],
    resolve: (res: UcCreateConference) => void,
    reject: ErrorHandler,
  ): void
  joinConference(
    conf_id: string,
    opt?: unknown,
    resolve: () => void,
    reject: ErrorHandler,
  ): void
  leaveConference(
    conf_id: string,
    resolve: () => void,
    reject: ErrorHandler,
  ): void
  inviteToConference(
    conf_id: string,
    members: string[],
    resolve: () => void,
    reject: ErrorHandler,
  ): void
  acceptFileWithXhr(
    file: unknown,
    xhr: XMLHttpRequest,
    reject: ErrorHandler,
  ): void
  cancelFile(file_id: string, reject: ErrorHandler): void
  sendFile(
    opt: UcSendFileParam,
    input: unknown,
    resolve: (res: UcSendFile) => void,
    reject: ErrorHandler,
  ): void
  sendFiles(
    opt: UcSendFilesParam,
    file: unknown[],
    resolve: (res: UcSendFiles) => void,
    reject: ErrorHandler,
  ): void
}

export type UcUser = {
  user_id: string
  name: string
  profile_image_url: string
  status: number
  display: string
}
export type UcReceieveUnreadText = {
  messages: UcMessage[]
}
export type UcMessage = {
  requires_read: boolean
  received_text_id: string
  text: string
  sender?: {
    user_id: string
  }
  sent_ltime: string
}
export type UcSearchTextsParam = {
  user_id?: string
  conf_id?: string
  max?: number
  begin?: number
  end?: number
  asc?: boolean
}
export type UcSearchTexts = {
  logs: UcMessageLog[]
}
export type UcMessageLog = {
  log_id: string
  ctype: number // content type
  content: string
  sender: {
    user_id: string
  }
  ltime: number
}
export type UcSendTextParam = {
  user_id: string
}
export type UcSendText = {
  text_id: string
  ltime: number
}
export type UcCreateConference = {
  conference: UcConference
}
export type UcConference = {
  conf_id: string
  subject: string
}
export type UcSendFileParam = {
  user_id: string
}
export type UcSendFile = {
  text_id: string
  ltime: number
  fileInfo: UcFileInfo
}
export type UcFileInfo = {
  file_id: string
  name: string
  size: number
  status: number
  progress: number
}
export type UcSendFilesParam = {
  conf_id: string
  input: unknown
}
export type UcSendFiles = {
  infoList: UcSendFile[]
}

export type UcLogger = {
  new (lv: string): UcLogger
}

export type UcListeners = {
  forcedSignOut?: (e: UcEventMap['forcedSignOut']) => void
  buddyStatusChanged?: (e: UcEventMap['buddyStatusChanged']) => void
  receivedTyping?: (e: UcEventMap['receivedTyping']) => void
  receivedText?: (e: UcEventMap['receivedText']) => void
  fileReceived?: (e: UcEventMap['fileReceived']) => void
  fileInfoChanged?: (e: UcEventMap['fileInfoChanged']) => void
  fileTerminated?: (e: UcEventMap['fileTerminated']) => void
  invitedToConference?: (e: UcEventMap['invitedToConference']) => void
  conferenceMemberChanged?: (e: UcEventMap['conferenceMemberChanged']) => void
}
export type UcEventMap = {
  forcedSignOut: {
    code: string
  }
  buddyStatusChanged: {
    user_id: string
    name: string
    profile_image_url: string
    status: number // 0 | 1 | 2 | 3
    display: string
  }
  receivedTyping: {
    tenant: string
    user_id: string
    request_ltime: string
    request_tstamp: number
  }
  receivedText: {
    sender: {
      user_id: string
    }
    conf_id: string
    received_text_id: string
    text: string
    sent_ltime: string
    sent_tstime: number
  }
  fileReceived: {
    fileInfo: {
      file_id: string
      name: string
      size: number
      status: number // 0 | 1 | 2 | 3 | 4 | 5 | 6
      progress: number
      target: {
        user_id: string
      }
    }
    conf_id: string
    text_id: string
    sent_ltime: string
    sent_tstime: number
  }
  fileInfoChanged: UcEventMap['fileReceived']
  fileTerminated: UcEventMap['fileReceived']
  invitedToConference: {
    conference: {
      conf_id: string
      subject: string
      from: {
        user_id: string
      }
      user?: {
        user_id: string
        conf_status: 0 | 2
      }[]
      conf_status: 0 | 2
    }
  }
  conferenceMemberChanged: UcEventMap['invitedToConference']
}

type ErrorHandler = (err: Error) => void
