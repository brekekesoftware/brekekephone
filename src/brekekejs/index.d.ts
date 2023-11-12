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
  Phone: {
    render: Function
  }
  Phonebook: Phonebook
  WebNotification: WebNotification
}
export type WebNotification = {
  requestPermission(Options: OptionRequestNotification): void
  showNotification(Options: OptionShowNotification): string
  closeNotification(Options: OptionCloseNotification): void
}

export type OptionCloseNotification = {
  notificationId: string
  reason?: string
}
export type OptionRequestNotification = {
  document: Document
  callback: (result: string) => void
}
export type OptionShowNotification = {
  document: Document
  timeout?: number
  interval?: number
  title: string
  body: string
  icon: string
  tag?: string
  renotify?: boolean
  noisiness?: number // whether sounds or vibrations should be issued (0: silent, 1: once, 2: every) (default: 0)
  onclick: (ev: Event) => void
  onclose: (ev: Event) => void
}

export type Phonebook = {
  getManager(lan: string): ManagerPhonebook | undefined
  getManagers(): ManagerPhonebook[]
}
export type ManagerPhonebook = {
  item: ItemPhonebook[]
  toDisplayName(map: object): string
  getLang(): void
  toSortStr(map: object): void
}
export type ItemPhonebook = {
  id: string
  caption?: string
  onscreen?: boolean
  type?: string
}
export type GetPalOptions = {
  tenant: string
  login_user: string
  login_password: string
  _wn: string
  park: string[]
  voicemail: string
  user?: string
  status: boolean
  secure_login_password: boolean
  phonetype: string
  callrecording: string
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
  notify_callrecording?(e: PbxEvent['callRecording']): void
  // not actually exist in the sdk, should be added manually
  call_pal<K extends keyof PbxPal>(
    k: K,
    ...p: Parameters<PbxPal[K]>[0] extends undefined
      ? []
      : [Parameters<PbxPal[K]>[0]]
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
  callRecording: {
    user: string
    talker_id: string
    status: string // on or off
  }
}

export type PbxPal = {
  getProductInfo(
    p: PbxGetProductInfoParam,
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
    resolve: (properties: string[][]) => void,
    reject: ErrorHandler,
  ): void
  getExtensionProperties(
    p: PbxGetExtensionPropertiesParam,
    resolve: (properties: string[][]) => void,
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
  getPhonebooks(
    p: undefined,
    resolve: (res: PbxBook[]) => void,
    reject: ErrorHandler,
  ): void
  deleteContact(
    p: PbxDeleteContactParam,
    resolve: (res: PbxDeleteContactResponse) => void,
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
  getToken(
    p: undefined,
    resolve: (res: any) => void,
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

export type PbxCustomPage = {
  id: string
  url: string
  title: string
  pos: string
  incoming?: string
}
export type PbxGetProductInfoRes = {
  'sip.wss.port': string
  'webphone.allusers': string
  'webphone.call.dtmf': string
  'webphone.call.hangup': string
  'webphone.call.hold': string
  'webphone.call.mute': string
  'webphone.call.park': string
  'webphone.call.record': string
  'webphone.call.speaker': string
  'webphone.call.transfer': string
  'webphone.call.video': string
  'webphone.desktop.notification': string
  'webphone.dtmf.send.pal': string
  'webphone.lpc.keyhash': string
  'webphone.lpc.pn': string
  'webphone.lpc.port': string
  'webphone.lpc.wifi': string
  'webphone.pal.param.user': string
  'webphone.pn_expires': string
  'webphone.turn.credential': string
  'webphone.turn.server': string
  'webphone.turn.username': string
  'webphone.uc.host': string
  'webphone.useragent': string
  'webphone.users.max': string
  'webrtcclient.dtmfSendMode': string
  version: string
}
export type PbxGetProductInfoParam = {
  webphone: string
}
export type PbxCreateAuthHeaderParam = {
  username: string
}
export type PbxGetExtensionsParam = {
  tenant: string
  pattern: '..*'
  type: 'user'
  limit: number
  property_names: string[]
}
export type PbxGetExtensionPropertiesParam = {
  tenant: string
  extension: string[]
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
  phonebook?: string
  search_text?: string
  offset: number
  limit: number
}
export type PbxGetContactListItem = {
  aid: string
  display_name: string
  phonebook: string
  user?: string
}

export type PbxGetContactParam = {
  aid: string
}
export type PbxDeleteContactParam = {
  aid: string[]
}
export type PbxDeleteContactResponse = {
  succeeded: number[] | string[]
  failed: number[] | string[]
}
export type PbxPnmanageParam = {
  command: string
  service_id: string | string[]
  application_id: string
  user_agent: string
  username: string
  device_id?: string
  device_id_voip?: string
  endpoint?: string
  auth_secret?: string
  key?: string
  add_voip?: boolean
  add_device_id_suffix?: boolean
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
export type PbxBook = {
  phonebook: string
  shared?: string
}
export type PbxContact = {
  aid: string
  phonebook: string
  shared: string
  display_name: string
  info: object
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

  _options: SipConstructorOptions
  dtmfSendMode: number

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
  destroyWebRTC(): void

  setDefaultCallOptions(options: CallOptions): void
  getSession(sessionId: string): Session
  getSessionCount(): number
  makeCall: MakeCallFn
  answer: MakeCallFn
  setWithVideo(sessionId: string, withVideo?: boolean): void
  setMuted(options: { main: boolean }, sessionId: string): void
  setWithVideo(
    sessionId: string,
    withVideo?: boolean,
    videoOptions?: VideoOptions,
  ): void
  sendDTMF(dtmf: string, sessionId: string): void
  getPhoneStatus(): string

  _ua?: {
    _transport?: {
      socket?: object
    }
    registrator?(): {
      _registered: boolean
      setExtraHeaders: Function
    }
    on(n: 'newNotify', l: (e?: { request?: { data?: string } }) => void): void
  }
  _removeEventListenerPhoneStatusChange?: Function
}

export type MakeCallFn = (
  number: string,
  options?: object,
  videoEnabled?: boolean,
  videoOptions?: object,
  exInfo?: object,
) => void

export type VideoOptions = {
  call: {
    mediaConstraints: MediaStreamConstraints
  }
  answer: {
    mediaConstraints: MediaStreamConstraints
  }
}
export type SipConstructorOptions = {
  logLevel: string
  multiSession: number
  dtmfSendPal: boolean
  dtmfSendMode?: number
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
export type SessionStatus = 'dialing' | 'terminated' | 'connected' | 'progress'
export type Session = {
  sessionId: string
  sessionStatus: SessionStatus
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
    getHeader(h: string): string | undefined
    body?: object
  }
  videoClientSessionTable: {
    [id: string]: Session
  }
  // unused properties
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
  getAllUsers(): {
    user: [
      {
        disabledBuddy?: boolean
        user_group: string
        user_id: string
        user_name: string
      },
    ]
  }
  getProfile(): {
    user_id: string
    name: string
    profile_image_url: string
    tenant: string
  }
  getConfigProperties(): UcConfig

  saveProperties(
    profile?: null,
    settings?: null,
    buddylist: {
      screened: boolean
      user: (UcBuddy | UcBuddyGroup)[]
    },
    resolve: () => void,
    reject: ErrorHandler,
  )

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
    user: (UcBuddy | UcBuddyGroup)[]
    screened: boolean
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
  sendCallResult(
    options?: {
      user_id?: string
      tenant?: string
      conf_id?: string
      targets?: {
        user_id: string
        tenant?: string
      }[]
    },
    text: string,
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
    opt?: UcJoinConferenceOption,
    resolve: () => void,
    reject: ErrorHandler,
  ): void
  leaveConference(
    opt: UcLeaveConferenceOption,
    resolve: (res: UcResponseLeaveConf) => void,
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
  peekWebchatConferenceText(
    opt: UcWebchatParams,
    resolve: (res: UcWebchatConferenceText) => void,
    reject: ErrorHandler,
  ): void
  getConference(conf_id: string): Conference
}

export type UcJoinConferenceOption = {
  exclusive: boolean
}
export type UcLeaveConferenceOption = {
  conf_id: string
  rejoinable: boolean
}
export type UcResponseLeaveConf = {
  closes: boolean
  ltime: string
  tstamp: number
}
export type UcFuncError = {
  code: number
  message: string
}
export type UcWebchatConferenceText = {
  hasMore: boolean
  messages: {
    sender: {
      tenant: string
      user_id: string
    }
    text: string
    object?: object
    conf_id?: string
    ctype: number
    received_text_id: string
    ltime: string
    tstamp: number
    sent_ltime: string
    sent_tstamp: number
    requires_read: boolean
  }[]
}
export type UcWebchat = {
  conf_id: string
  messageList: object
  conf_status: number
  creator: {
    tenant: string
    user_id: string
    user_name: string
    conf_status: number
  }
  assigned: {
    tenant: string
    user_id: string
    conf_status: number
  }
  webchatinfo: object
  created_tstamp: number
  baseTime: number
  isTalking: boolean
}
export type UcBuddy = {
  disabledBuddy?: boolean
  user_id: string
  name: string
  profile_image_url: string
  group: string
  tenant: string
  block_settings: object
  status?: string
}
export type UcBuddyGroup = {
  id: string
  name?: string
  group?: string
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
  tstamp: number
  topic_id?: string
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
  topic_id: string
}
export type UcFileInfo = {
  file_id: string
  name: string
  size: number
  status: number
  progress: number
}
export type UcWebchatParams = {
  conf_id: string
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

export type ReceivedText = {
  sender: {
    tenant: string
    user_id: string
  }
  text: string
  conf_id?: string
  ctype: number
  received_text_id: string
  topic_id: string
  ltime: string
  tstamp: number
  sent_ltime: string
  sent_tstamp: number
  requires_read: boolean
}

export type Conference = {
  conf_id: string
  subject: string
  created_time: string
  created_tstamp: number
  from: {
    user_id: string
  }
  creator: {
    tenant: string
    user_id: string
    user_name: string
    conf_status: number
  }
  user?: {
    user_id: string
    conf_status: 0 | 2
  }[]
  conf_status: number
  assigned: {
    tenant: string
    user_id: string
    conf_status: number
  }
  webchatinfo: {
    profinfo_formatted: string
    profinfo_json: object
    conf_ext: string
  }
  invite_properties: {
    invisible: boolean
    rejoinable: boolean
    webchatfromguest?: object
  }
  texts: string[] // text display on list webchat
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
    topic_id: string
  }
  fileInfoChanged: UcEventMap['fileReceived']
  fileTerminated: UcEventMap['fileReceived']
  invitedToConference: {
    conference: Conference
  }
  conferenceMemberChanged: UcEventMap['invitedToConference']
}
export type UcConfig = {
  buddy_mode: number
  chat_mode: number
  webnotif_timeout: number
  webchat_enabled: string
  optional_config: {
    buddy_max: number
  }
}

export type UcConstants = {
  STATUS_OFFLINE: 0
  STATUS_AVAILABLE: 1
  STATUS_IDLE: 2
  STATUS_BUSY: 3
  USER_TYPE_SYSTEM_ADMIN: 1
  USER_TYPE_TENANT_ADMIN: 2
  USER_TYPE_TENANT_USER: 3
  USER_TYPE_TENANT_GUEST: 4
  BUDDY_MODE_MANUAL: 0
  BUDDY_MODE_AUTO: 1
  BUDDY_MODE_GROUP: 2
  CONF_STATUS_INACTIVE: 0
  CONF_STATUS_INVITED: 1
  CONF_STATUS_JOINED: 2
  CONF_STATUS_INVITED_WEBCHAT: 5
  FILE_STATUS_UNPREPARED: 0
  FILE_STATUS_UNACCEPTED: 1
  FILE_STATUS_TRANSFERRING: 2
  FILE_STATUS_COMPLETED: 3
  FILE_STATUS_LOCAL_CANCEL: 4
  FILE_STATUS_REMOTE_CANCEL: 5
  FILE_STATUS_ERROR: 6
  CALL_STATUS_TERMINATED: 0
  CALL_STATUS_INCOMING: 1
  CALL_STATUS_ANSWERING: 2
  CALL_STATUS_DIALING: 3
  CALL_STATUS_PROGRESS: 4
  CALL_STATUS_TALKING: 5
  CALL_DIRECTION_UNKNOWN: 0
  CALL_DIRECTION_INCOMING: 1
  CALL_DIRECTION_OUTGOING: 2
  STREAM_STATUS_DIALING: 3
  STREAM_STATUS_TALKING: 5
  CTYPE_TEXT: 1
  CTYPE_FILE_REQUEST: 5
  CTYPE_FILE_ACCEPT: 6
  CTYPE_FILE_REJECT: 7
  CTYPE_FILE_CANCEL: 8
  CTYPE_FILE_PROGRESS: 9
  CTYPE_CALL_RESULT: 26
  CTYPE_OBJECT: 101
}

type ErrorHandler = (err: Error) => void
