/* eslint-disable */

/**
 * webrtcclient.js
 *
 * require jssip/jssip-3.2.15.js
 */

if (!window.Brekeke) {
  window.Brekeke = {}
}
var Brekeke = window.Brekeke

/**
 * instance Brekeke.WebrtcClient
 */
if (!Brekeke.WebrtcClient) {
  Brekeke.WebrtcClient = {}
}
;(function (WebrtcClient) {
  var WEBRTC_CLIENT_VERSION = '2.0.30.333'
  var Phone
  var Logger
  var jssipHack
  var jssipRtcSessionHack
  var jssipIncomingRequestHack
  var by
  var clone
  var stringify
  var stringifyError
  var int
  var string

  /**
   * class Brekeke.WebrtcClient.Phone
   */
  Phone = function (options) {
    var d
    var self = this

    /**
     * private fields
     */
    this._options = clone(options) || {}
    this._logLevel = this._options.logLevel || 'log'
    this._jssipLogLevel = this._options.jssipLogLevel || this._logLevel
    this._logger =
      this._options.logger ||
      new Brekeke.WebrtcClient.Logger(this._logLevel, null, true)
    this._audioContext =
      this._options.audioContext ||
      (window.AudioContext ? new window.AudioContext() : {})
    this._mediaStreamConverter = this._options.mediaStreamConverter || null

    this._lastCreatedEventId = 0
    this._eventIdFuncTable = {}
    this._eventNameIdsTable = {}

    this._destroyed = false

    this._ua = null
    this._vua = null // video client

    this._uaStarting = false
    this._vuaStarting = false
    this._phoneStatus = 'stopped'
    this._stopReasonInfo = null
    this._aliveSessions = []

    this._gettingUserMedia = false

    this._defaultGatheringTimeout = 2000

    this._user = ''
    this._videoClientUser = ''
    this._register = true
    this._socketKeepAlive = 0
    this._uaSocket = null
    this._uaSocketKeepAliveTimer = null
    this._vuaSocket = null
    this._vuaSocketKeepAliveTimer = null

    this._lastCreatedSessionId = 0
    this._lastSessionEndTime = 0
    this._sessionTable = {}
    this._sessionIceCandidateInfoTable = {}
    this._sessionRemoteStreamsTable = {}
    this._sessionLocalMediaTable = {}
    this._outgoingRtcInfo = {}
    this._lastCreatedVideoClientSessionId = 0
    this._ridVideoClientSessionsTable = {}
    this._ridMembersTable = {}
    this._tryingVideoCallTargets = {}

    this._masterVolume =
      typeof this._options.masterVolume === 'number'
        ? this._options.masterVolume
        : 1000

    this._lastDefaultOptionsPosition = {}

    this._jssipLoadingFailed =
      typeof JsSIP === 'undefined' || !JsSIP.Utils || !JsSIP.UA

    this.UA_WO_GAIN = ''
    this.CHECK_CTX_STATE = 1
    this.FORCE_CREATE_OSCILLATOR = false
    this.SDP_RA_UPDATEABLE = false
    this.STOP_WEBRTC_WAIT = 100
    this.USE_TRANSPORT_WSS_IN_CONTACT = false
    this.URL_PATH = '/webrtcclient'
    this.COMPLEMENT_URL_PATH = true
    this.HANDLE_BYE_IN_STATUS_WAITING_FOR_ACK = true

    this.WEBRTC_CLIENT_VERSION = WEBRTC_CLIENT_VERSION

    /**
     * field autoAnswer
     */
    this.autoAnswer = this._options.autoAnswer || false

    /**
     * field ctiAutoAnswer
     */
    this.ctiAutoAnswer = this._options.ctiAutoAnswer || false

    /**
     * field eventTalk
     */
    this.eventTalk = this._options.eventTalk || false

    /**
     * field autoFocusWindow
     */
    this.autoFocusWindow = this._options.autoFocusWindow || false

    /**
     * field doNotDisturb
     */
    this.doNotDisturb = this._options.doNotDisturb || false

    /**
     * field multiSession
     */
    this.multiSession = this._options.multiSession || false

    /**
     * field dtmfSendMode
     */
    this.dtmfSendMode = int(this._options.dtmfSendMode)

    /**
     * field analyserMode
     */
    this.analyserMode = int(this._options.analyserMode)

    /**
     * field getUserMediaTimeout
     */
    this.getUserMediaTimeout =
      typeof this._options.getUserMediaTimeout !== 'undefined'
        ? int(this._options.getUserMediaTimeout)
        : 30

    /**
     * field iceCandidateGatheringTimeout
     */
    this.iceCandidateGatheringTimeout =
      typeof this._options.iceCandidateGatheringTimeout !== 'undefined'
        ? int(this._options.iceCandidateGatheringTimeout)
        : 2000

    /**
     * field defaultOptions
     */
    d = this._options.defaultOptions
    this.defaultOptions = {
      main: {
        call: (d && d.main && d.main.call) || {
          mediaConstraints: { audio: true, video: false },
        },
        answer: (d && d.main && d.main.answer) || {
          mediaConstraints: { audio: true, video: false },
        },
      },
      withVideo: Boolean(d && d.withVideo),
      videoOptions: {
        call: (d && d.videoOptions && d.videoOptions.call) || {
          mediaConstraints: { audio: false, video: true },
        },
        answer: (d && d.videoOptions && d.videoOptions.answer) || {
          mediaConstraints: { audio: false, video: true },
        },
        shareStream: Boolean(d && d.videoOptions && d.videoOptions.shareStream),
        screenCapture: Boolean(
          d && d.videoOptions && d.videoOptions.screenCapture,
        ),
      },
      exInfo: '',
    }

    /**
     * field configuration
     */
    this.configuration = this._options.configuration || {}

    // shim
    if (
      window.RTCPeerConnection &&
      !window.RTCPeerConnection.prototype.addStream
    ) {
      window.RTCPeerConnection.prototype.addStream = function (stream) {
        var pc = this
        stream.getTracks().forEach(function (track) {
          window.RTCPeerConnection.prototype.addTrack.call(pc, track, stream)
        })
      }
    }
    var Event_shim = (function () {
      try {
        new Event('trial')
        return true
      } catch (ex) {
        return false
      }
    })()
      ? Event
      : typeof Event !== 'undefined' &&
          typeof document !== 'undefined' &&
          document.createEvent
        ? function (type) {
            // for ie
            var event = document.createEvent('Event')
            event.initEvent(type, false, false)
            return event
          }
        : function (type) {
            // for event-target-shim
            this.type = type
          }
    var addsOntrack =
      typeof window === 'object' &&
      window.RTCPeerConnection &&
      !('ontrack' in window.RTCPeerConnection.prototype)
    if (addsOntrack) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get() {
          return this._ontrack
        },
        set(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack)
          }
          this.addEventListener('track', (this._ontrack = f))
        },
      })
    }
    var origSetRemoteDescription =
      window.RTCPeerConnection.prototype.setRemoteDescription
    window.RTCPeerConnection.prototype.setRemoteDescription = function () {
      var pc = this
      if (addsOntrack && !pc._ontrackpoly) {
        pc._ontrackpoly = function (e) {
          // onaddstream does not fire when a track is added to an existing
          // stream. But stream.onaddtrack is implemented so we use that.
          e.stream.addEventListener('addtrack', function (te) {
            var receiver
            if (window.RTCPeerConnection.prototype.getReceivers) {
              receiver = pc.getReceivers().find(function (r) {
                return r.track && r.track.id === te.track.id
              })
            } else {
              receiver = { track: te.track }
            }

            var event = new Event_shim('track')
            event.track = te.track
            event.receiver = receiver
            event.transceiver = { receiver }
            event.streams = [e.stream]
            pc.dispatchEvent(event)
          })
          e.stream.getTracks().forEach(function (track) {
            var receiver
            if (window.RTCPeerConnection.prototype.getReceivers) {
              receiver = pc.getReceivers().find(function (r) {
                return r.track && r.track.id === track.id
              })
            } else {
              receiver = { track }
            }
            var event = new Event_shim('track')
            event.track = track
            event.receiver = receiver
            event.transceiver = { receiver }
            event.streams = [e.stream]
            pc.dispatchEvent(event)
          })
        }
        pc.addEventListener('addstream', pc._ontrackpoly)
      }
      if (
        self.SDP_RA_UPDATEABLE ||
        !arguments[0] ||
        arguments[0].type !== 'answer'
      ) {
        return origSetRemoteDescription.apply(pc, arguments)
      }
      var signalingState = pc.signalingState
      if (pc._mustSkipSetSdpRa) {
        if (signalingState === 'have-local-offer') {
          // 200 OK
          pc._mustSkipSetSdpRa = false
        }
        // skip setRemoteDescription
        self._logger.log(
          'debug',
          'origSetRemoteDescription (' + signalingState + ') skipped',
        )
        return Promise.resolve()
      }
      return origSetRemoteDescription
        .apply(pc, arguments)
        .then(function () {
          self._logger.log(
            'debug',
            'origSetRemoteDescription (' + signalingState + ') OK',
          )
          pc._mustSkipSetSdpRa = true
        })
        .catch(function (error) {
          self._logger.log(
            'warn',
            'origSetRemoteDescription (' + signalingState + ') Error: ' + error,
          )
          throw error
        })
    }

    if (!this._jssipLoadingFailed) {
      // hack jssip
      jssipHack()

      // enable jssip log
      if (this._jssipLogLevel !== 'none' && JsSIP.debug && JsSIP.debug.enable) {
        // jssip 0.6~
        JsSIP.debug.enable('*')
      }

      // for chrome 66~
      this._registerAudioContext()
    }
  }
  /**
   * Phone prototype
   */
  Phone.prototype = {
    /**
     * function addEventListener
     */
    addEventListener(eventName, func) {
      var eventId = 0

      eventId = ++this._lastCreatedEventId
      this._eventIdFuncTable[eventId] = func
      if (!this._eventNameIdsTable[eventName]) {
        this._eventNameIdsTable[eventName] = []
      }
      this._eventNameIdsTable[eventName].push(eventId)

      return string(eventId)
    },

    /**
     * function removeEventListener
     */
    removeEventListener(eventName, eventId) {
      var i = 0

      eventId = int(eventId)

      if (eventId) {
        // remove one
        if (this._eventNameIdsTable[eventName]) {
          for (i = this._eventNameIdsTable[eventName].length; i--; ) {
            if (this._eventNameIdsTable[eventName][i] === eventId) {
              this._eventNameIdsTable[eventName].splice(i, 1)
            }
          }
        }
        delete this._eventIdFuncTable[eventId]
      } else {
        // remove all events in eventName
        if (this._eventNameIdsTable[eventName]) {
          for (i = this._eventNameIdsTable[eventName].length; i--; ) {
            delete this._eventIdFuncTable[this._eventNameIdsTable[eventName][i]]
          }
          this._eventNameIdsTable[eventName] = []
        }
      }
    },

    /**
     * function startWebRTC
     */
    startWebRTC(configuration) {
      var auth = ''
      var configurations
      var defaultConfiguration
      var environment
      var host = ''
      var i
      var password = ''
      var port = 0
      var shareSocket = false
      var sockets = null
      var tls = false
      var url = ''
      var urlUrl = null
      var urlWithParams = ''
      var useVideoClient = false
      var user = ''
      var userAgent = ''
      var videoClientUser = ''

      if (this._jssipLoadingFailed) {
        this._logger.log('error', 'jssip-3.2.15.js is not loaded')
        throw new Error('jssip-3.2.15.js is not loaded')
      }

      // check parameters
      if (!configuration) {
        this._logger.log('warn', 'Empty configuration')
        return
      }
      defaultConfiguration = this.configuration || {}
      user = string(configuration.user || defaultConfiguration.user)
      if (!user) {
        this._logger.log('warn', 'Empty configuration.user')
        return
      }
      auth = string(configuration.auth || defaultConfiguration.auth)
      password = string(configuration.password || defaultConfiguration.password)
      useVideoClient = Boolean(
        typeof configuration.useVideoClient !== 'undefined'
          ? configuration.useVideoClient
          : defaultConfiguration.useVideoClient,
      )
      videoClientUser =
        string(
          configuration.videoClientUser || defaultConfiguration.videoClientUser,
        ) || user + '~video'
      shareSocket = Boolean(
        typeof configuration.shareSocket !== 'undefined'
          ? configuration.shareSocket
          : defaultConfiguration.shareSocket,
      )
      urlWithParams = string(
        configuration.urlWithParams || defaultConfiguration.urlWithParams,
      )
      url =
        urlWithParams || string(configuration.url || defaultConfiguration.url)
      if (url) {
        urlUrl = JsSIP.Grammar.parse(url, 'absoluteURI')
        host = string(urlUrl.host)
        port = int(urlUrl.port)
        tls = Boolean(string(urlUrl.scheme).toLowerCase() === 'wss')
      } else {
        host = string(configuration.host || defaultConfiguration.host)
        if (!host) {
          this._logger.log('warn', 'Empty configuration.host')
          return
        }
        port = int(configuration.port || defaultConfiguration.port)
        if (port <= 0) {
          this._logger.log('warn', 'Invalid configuration.port')
          return
        }
        tls = Boolean(
          typeof configuration.tls !== 'undefined'
            ? configuration.tls
            : defaultConfiguration.tls,
        )
        url = (tls ? 'wss://' : 'ws://') + host + ':' + port
      }
      if (url && !urlWithParams && this.COMPLEMENT_URL_PATH) {
        if (!url.split('/')[3]) {
          url = url.replace(/\/+$/, '') + this.URL_PATH
        }
        if (auth) {
          url +=
            (url.indexOf('?') === -1 ? '?' : '&') +
            'Authorization=' +
            encodeURIComponent(auth) +
            '&phoneid=' +
            encodeURIComponent(user)
        }
      }

      // check environment
      environment = this.getEnvironment()
      if (environment && environment.webRTC) {
        // WebRTC enabled
      } else {
        this._logger.log('warn', 'WebRTC not supported')
        return
      }
      userAgent =
        string(configuration.user_agent || defaultConfiguration.user_agent) ||
        string(
          configuration.userAgent ||
            defaultConfiguration.userAgent ||
            'webrtcclient',
        ) +
          ' w' +
          WEBRTC_CLIENT_VERSION.substring(
            WEBRTC_CLIENT_VERSION.lastIndexOf('.') + 1,
          ) +
          string(environment.name).substring(0, 1) +
          environment.version

      // check started
      if (this._ua) {
        this._logger.log('info', 'WebRTC already started')
        return
      }
      if (this._destroyed) {
        this._logger.log('info', 'WebRTC already destroyed')
        return
      }

      this._register =
        typeof configuration.register === 'boolean'
          ? configuration.register
          : typeof defaultConfiguration.register === 'boolean'
            ? defaultConfiguration.register
            : true
      this._socketKeepAlive =
        typeof configuration.socketKeepAlive === 'number'
          ? configuration.socketKeepAlive
          : typeof defaultConfiguration.socketKeepAlive === 'number'
            ? defaultConfiguration.socketKeepAlive
            : 0

      // instantiate JsSIP.UA
      configurations = []
      for (i = 0; i < (useVideoClient ? 2 : 1); i++) {
        configurations[i] = {
          log: { level: this._jssipLogLevel },
          uri:
            (i === 0 ? user : videoClientUser) +
            '@' +
            string(
              configuration.sip_uri_host ||
                defaultConfiguration.sip_uri_host ||
                host,
            ),
          password,
          sockets:
            (shareSocket && sockets) ||
            (sockets = new JsSIP.WebSocketInterface(url)),
          display_name: string(
            configuration.display_name || defaultConfiguration.display_name,
          ),
          authorization_user: string(
            configuration.authorization_user ||
              defaultConfiguration.authorization_user,
          ),
          register: this._register,
          register_expires:
            typeof configuration.register_expires === 'number'
              ? configuration.register_expires
              : typeof defaultConfiguration.register_expires === 'number'
                ? defaultConfiguration.register_expires
                : 1296000,
          registrar_server: string(
            configuration.registrar_server ||
              defaultConfiguration.registrar_server,
          ),
          no_answer_timeout:
            typeof configuration.no_answer_timeout === 'number'
              ? configuration.no_answer_timeout
              : typeof defaultConfiguration.no_answer_timeout === 'number'
                ? defaultConfiguration.no_answer_timeout
                : 3600,
          use_preloaded_route: Boolean(
            typeof configuration.use_preloaded_route !== 'undefined'
              ? configuration.use_preloaded_route
              : defaultConfiguration.use_preloaded_route,
          ),
          connection_recovery_min_interval:
            typeof configuration.connection_recovery_min_interval === 'number'
              ? configuration.connection_recovery_min_interval
              : typeof defaultConfiguration.connection_recovery_min_interval ===
                  'number'
                ? defaultConfiguration.connection_recovery_min_interval
                : 2,
          connection_recovery_max_interval:
            typeof configuration.connection_recovery_max_interval === 'number'
              ? configuration.connection_recovery_max_interval
              : typeof defaultConfiguration.connection_recovery_max_interval ===
                  'number'
                ? defaultConfiguration.connection_recovery_max_interval
                : 30,
          user_agent: userAgent,
          contact_uri: new JsSIP.URI(
            'sip',
            JsSIP.Utils.createRandomToken(8),
            ''.concat(JsSIP.Utils.createRandomToken(12), '.invalid'),
            null,
            {
              transport:
                this.USE_TRANSPORT_WSS_IN_CONTACT && tls ? 'wss' : 'ws',
            },
          ).toString(),
        }
        ;[
          'instance_id',
          'session_timers',
          'session_timers_refresh_method',
          'realm',
          'ha1',
        ].forEach(function (propName) {
          if (typeof configuration[propName] !== 'undefined') {
            configurations[i][propName] = configuration[propName]
          } else if (typeof defaultConfiguration[propName] !== 'undefined') {
            configurations[i][propName] = defaultConfiguration[propName]
          }
        })
      }
      this._ua = new JsSIP.UA(configurations[0])
      if (useVideoClient) {
        this._vua = new JsSIP.UA(configurations[1])
      }
      // set auth to registrator extra headers
      if (auth) {
        if (typeof this._ua.registrator === 'function') {
          this._ua.registrator().setExtraHeaders(['Authorization: ' + auth])
          if (this._vua) {
            this._vua.registrator().setExtraHeaders(['Authorization: ' + auth])
          }
        } else {
          this._ua.registrator.setExtraHeaders(['Authorization: ' + auth])
          if (this._vua) {
            this._vua.registrator.setExtraHeaders(['Authorization: ' + auth])
          }
        }
      }

      // attach JsSIP.UA event listeners
      this._ua.on('connected', by(this, this._ua_connected))
      this._ua.on('disconnected', by(this, this._ua_disconnected))
      this._ua.on('registered', by(this, this._ua_registered))
      this._ua.on('unregistered', by(this, this._ua_unregistered))
      this._ua.on('registrationFailed', by(this, this._ua_registrationFailed))
      this._ua.on('newRTCSession', by(this, this._ua_newRTCSession))
      if (this._vua) {
        this._vua.on('connected', by(this, this._vua_connected))
        this._vua.on('disconnected', by(this, this._vua_disconnected))
        this._vua.on('registered', by(this, this._vua_registered))
        this._vua.on('unregistered', by(this, this._vua_unregistered))
        this._vua.on(
          'registrationFailed',
          by(this, this._vua_registrationFailed),
        )
        this._vua.on('newRTCSession', by(this, this._vua_newRTCSession))
        this._vua.on('newNotify', by(this, this._vua_newNotify))
      }

      this._changePhoneStatus('starting')
      this._uaStarting = true
      if (this._vua) {
        this._vuaStarting = true
      }

      this._user = user
      this._videoClientUser = videoClientUser

      // start JsSIP.UA
      try {
        if (this._vua) {
          this._vua.start() // start this._ua after _vua_registered
        } else {
          this._ua.start()
        }
      } catch (e) {
        this._logger.log(
          'warn',
          'UA.start error message: ' + e.message + '\nstack: ' + e.stack + '\n',
        )
        this._stopReasonInfo = {
          from: 'jssip',
          reason: e.message,
          response: null,
        }
        this.stopWebRTC(true)
      }
    },

    /**
     * function stopWebRTC
     */
    stopWebRTC(force) {
      var elapsed
      var session
      var sessionId

      // check stopped
      if (!this._ua) {
        this._logger.log('info', 'WebRTC already stopped')
        return
      }

      this._changePhoneStatus('stopping')

      elapsed = +new Date() - this._lastSessionEndTime
      if (elapsed < this.STOP_WEBRTC_WAIT) {
        this._logger.log(
          'debug',
          '_lastSessionEndTime: ' +
            this._lastSessionEndTime +
            ', elapsed: ' +
            elapsed,
        )
        setTimeout(by(this, this.stopWebRTC, [force]), this.STOP_WEBRTC_WAIT)
        return
      }
      for (sessionId in this._sessionTable) {
        session = this._sessionTable[sessionId]
        if (session.sessionStatus !== 'terminated') {
          if (force) {
            this._logger.log('debug', 'force session terminate')
            this._terminateRtcSession(session.rtcSession)
          }
          setTimeout(by(this, this.stopWebRTC, [force]), this.STOP_WEBRTC_WAIT)
          return
        }
      }

      if (this._vua) {
        try {
          this._vua.stop()
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.stop error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          )
        }
        this._vua = null
      }
      if (!this._ua || typeof this._ua.isRegistered !== 'function') {
        return
      }
      if (this._ua.isRegistered()) {
        try {
          this._ua.stop()
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.stop error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          )
        }
        // to _ua_unregistered
      } else {
        try {
          this._ua.stop()
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.stop error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          )
        }
        this._changePhoneStatus('stopped')
        this._ua = null
        this._user = ''
        this._videoClientUser = ''
      }
    },

    /**
     * function destroyWebRTC
     */
    destroyWebRTC() {
      this._eventNameIdsTable = {}
      this._phoneStatus = 'stopped'
      this._uaStarting = false
      this._vuaStarting = false
      try {
        this._uaSocket.disconnect()
      } catch (e) {
        this._logger.log(
          'warn',
          '_uaSocket.disconnect error message: ' +
            e.message +
            '\nstack: ' +
            e.stack +
            '\n',
        )
      }
      try {
        this._ua && this._ua.stop()
      } catch (e) {
        this._logger.log(
          'warn',
          '_ua.stop error message: ' + e.message + '\nstack: ' + e.stack + '\n',
        )
      }
      try {
        this._vuaSocket.disconnect()
      } catch (e) {
        this._logger.log(
          'warn',
          '_vuaSocket.disconnect error message: ' +
            e.message +
            '\nstack: ' +
            e.stack +
            '\n',
        )
      }
      try {
        this._vua && this._vua.stop()
      } catch (e) {
        this._logger.log(
          'warn',
          '_vua.stop error message: ' +
            e.message +
            '\nstack: ' +
            e.stack +
            '\n',
        )
      }
      this._ua = null
      this._vua = null
      this._user = ''
      this._videoClientUser = ''
      this._destroyed = true
    },

    /**
     * function setDefaultCallOptions
     */
    setDefaultCallOptions(callOptions) {
      var assignDeeply
      var assignForEachPosition
      var deleteForEachPosition

      if (!callOptions) {
        this._logger.log('warn', 'Empty callOptions')
        return
      }

      assignDeeply = function (target, targetPosition, object, level) {
        var key

        if (object && typeof object === 'object') {
          for (key in object) {
            if (level === 0 && key === 'position') {
              // skip
            } else if (Array.isArray(object[key])) {
              if (typeof target[key] === 'undefined') {
                target[key] = []
                if (typeof targetPosition === 'object') {
                  targetPosition[key] = true
                }
              } else if (!Array.isArray(target[key])) {
                target[key] = []
                if (
                  typeof targetPosition === 'object' &&
                  !Array.isArray(targetPosition[key])
                ) {
                  targetPosition[key] = []
                }
              } else if (
                typeof targetPosition === 'object' &&
                !Array.isArray(targetPosition[key])
              ) {
                targetPosition[key] = []
              }
              assignDeeply(
                target[key],
                targetPosition && targetPosition[key],
                object[key],
                level + 1,
              )
            } else if (typeof object[key] === 'object') {
              if (typeof target[key] === 'undefined') {
                target[key] = {}
                if (typeof targetPosition === 'object') {
                  targetPosition[key] = true
                }
              } else if (typeof target[key] !== 'object') {
                target[key] = {}
                if (
                  typeof targetPosition === 'object' &&
                  typeof targetPosition[key] !== 'object'
                ) {
                  targetPosition[key] = {}
                }
              } else if (
                typeof targetPosition === 'object' &&
                typeof targetPosition[key] !== 'object'
              ) {
                targetPosition[key] = {}
              }
              assignDeeply(
                target[key],
                targetPosition && targetPosition[key],
                object[key],
                level + 1,
              )
            } else {
              target[key] = object[key]
              if (typeof targetPosition === 'object') {
                targetPosition[key] = true
              }
            }
          }
        }
      }
      assignForEachPosition = function (
        target,
        targetPosition,
        position,
        object,
      ) {
        var key

        if (
          position &&
          typeof position === 'object' &&
          target &&
          typeof target === 'object'
        ) {
          for (key in position) {
            if (typeof target[key] === 'undefined') {
              target[key] = {}
              if (typeof targetPosition === 'object') {
                targetPosition[key] = true
              }
            } else if (typeof target[key] !== 'object') {
              target[key] = {}
              if (
                typeof targetPosition === 'object' &&
                typeof targetPosition[key] !== 'object'
              ) {
                targetPosition[key] = {}
              }
            } else if (
              typeof targetPosition === 'object' &&
              typeof targetPosition[key] !== 'object'
            ) {
              targetPosition[key] = {}
            }
            if (position[key] === true) {
              assignDeeply(
                target[key],
                targetPosition && targetPosition[key],
                object,
                0,
              )
            } else if (typeof position[key] === 'object') {
              assignForEachPosition(
                target[key],
                targetPosition && targetPosition[key],
                position[key],
                object,
              )
            }
          }
        }
      }
      deleteForEachPosition = function (target, position) {
        var key

        if (
          position &&
          typeof position === 'object' &&
          target &&
          typeof target === 'object'
        ) {
          for (key in position) {
            if (position[key] === true) {
              if (Array.isArray(target) && typeof key === 'number') {
                target.splice(key, 1)
              } else {
                delete target[key]
              }
            } else if (typeof position[key] === 'object') {
              deleteForEachPosition(target[key], position[key])
            }
          }
        }
      }

      // delete last defaultCallOptions
      deleteForEachPosition(
        this.defaultOptions,
        this._lastDefaultOptionsPosition,
      )
      this._lastDefaultOptionsPosition = {}
      // set defaultCallOptions
      assignForEachPosition(
        this.defaultOptions,
        this._lastDefaultOptionsPosition,
        callOptions.position || {
          main: {
            call: true,
            answer: true,
          },
          videoOptions: {
            call: true,
            answer: true,
          },
        },
        callOptions,
      )
    },

    /**
     * function checkUserMedia
     */
    checkUserMedia(callback, options, screenCapture, keep) {
      var self = this

      this._disposeLocalMedia('check')

      if (!this._ua || this._phoneStatus !== 'started') {
        if (callback) {
          callback({
            enabled: false,
            message: 'WebRTC not started',
            streamObject: null,
            analyser: null,
            dispose() {},
          })
        }
        return
      }

      options =
        clone(
          options ||
            (this.defaultOptions &&
              this.defaultOptions.main &&
              this.defaultOptions.main.call),
        ) || {}
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: true, video: false }
      }

      // getUserMedia
      this._getUserMedia(
        options.mediaConstraints,
        screenCapture,
        function (stream) {
          if (keep && callback) {
            self._disposeLocalMedia('check')
            self._createLocalMedia(
              'check',
              stream,
              options.mediaConstraints,
              true,
              null,
            )
            try {
              self._connectLocalMediaToAudioNode('check')
            } catch (e) {
              self._logger.log(
                'info',
                '_connectLocalMediaToAudioNode() failed: ' + stringifyError(e),
              )
              self._disposeLocalMedia('check')
              callback({
                enabled: false,
                message: stringifyError(e),
                streamObject: null,
                analyser: null,
                dispose() {},
              })
              return
            }
            callback({
              enabled: true,
              message: '',
              streamObject:
                self._sessionLocalMediaTable['check'].localMediaStreamForCall,
              analyser: self._sessionLocalMediaTable['check'].analyser,
              dispose() {
                self._disposeLocalMedia('check')
              },
            })
          } else {
            JsSIP.Utils.closeMediaStream(stream)
            if (callback) {
              callback({
                enabled: true,
                message: '',
                streamObject: null,
                analyser: null,
                dispose() {},
              })
            }
          }
        },
        function (error) {
          if (callback) {
            callback({
              enabled: false,
              message: stringifyError(error),
              streamObject: null,
              analyser: null,
              dispose() {},
            })
          }
        },
        0,
      )
    },

    /**
     * function makeCall
     */
    makeCall(target, options, withVideo, videoOptions, exInfo) {
      var rtcInfoJsonStr

      if (!this._ua || this._phoneStatus !== 'started') {
        this._logger.log('warn', 'WebRTC not started')
        return
      }

      target = string(target)
      if (!target) {
        this._logger.log('warn', 'Empty target')
        return
      }

      options =
        clone(
          options ||
            (this.defaultOptions &&
              this.defaultOptions.main &&
              this.defaultOptions.main.call),
        ) || {}
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: true, video: false }
      }
      if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
        options.pcConfig = clone(options.pcConfig) || {}
        options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout
      }
      if (!options.extraHeaders) {
        options.extraHeaders = []
      }

      if (withVideo !== true && withVideo !== false) {
        withVideo = Boolean(
          this.defaultOptions && this.defaultOptions.withVideo,
        )
      }
      if (withVideo) {
        if (!this._vua) {
          this._logger.log('warn', 'Video client unavailable')
          return
        }

        videoOptions =
          clone(
            videoOptions ||
              (this.defaultOptions && this.defaultOptions.videoOptions),
          ) || {}

        options.eventHandlers = clone(options.eventHandlers) || {}
        // make call of video session after main session response
        options.eventHandlers['progress'] = by(
          null,
          this._rtcSession_responseAfterMakeCallWithVideo,
          [this, videoOptions, options.eventHandlers['progress']],
        )
        options.eventHandlers['accepted'] = by(
          null,
          this._rtcSession_responseAfterMakeCallWithVideo,
          [this, videoOptions, options.eventHandlers['accepted']],
        )
      }

      exInfo = string(
        typeof exInfo !== 'undefined'
          ? exInfo
          : this.defaultOptions && this.defaultOptions.exInfo,
      )
      rtcInfoJsonStr = JSON.stringify({
        user: '',
        withVideo,
      })
      options.extraHeaders = options.extraHeaders.concat(
        'X-UA-EX: rtcinfo=' + encodeURIComponent(rtcInfoJsonStr) + ';' + exInfo,
      )
      this._outgoingRtcInfo = {
        withVideo,
        exInfo,
      }

      this._doCall(
        target,
        options,
        this._ua,
        null,
        false,
        by(this, this._rtcErrorOccurred, [
          { sessionId: null, target, options, client: 'main' },
        ]),
      )
    },

    /**
     * function setWithVideo
     */
    setWithVideo(sessionId, withVideo, videoOptions, exInfo) {
      var i
      var members
      var options
      var rid
      var rm
      var session
      var targets

      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]

      if (!session) {
        this._logger.log('warn', 'Not found session of sessionId: ' + sessionId)
        return
      }

      if (
        withVideo === true &&
        (!this._vua || this._phoneStatus !== 'started')
      ) {
        this._logger.log('warn', 'Video client unavailable')
        return
      }

      session.exInfo = string(
        typeof exInfo !== 'undefined' ? exInfo : session.exInfo,
      )
      if (session.isConfirmed) {
        this._sendInfoXUaEx(sessionId, false, withVideo, 0)
      } else if (session.rtcSession && session.rtcSession.on) {
        session.rtcSession.on(
          'confirmed',
          by(this, this._sendInfoXUaEx, [sessionId, false, null, 0]),
        )
      }

      if (withVideo === true && !session.withVideo) {
        session.withVideo = true

        // set videoOptions
        session.videoOptions =
          clone(
            videoOptions ||
              session.videoOptions ||
              (this.defaultOptions && this.defaultOptions.videoOptions),
          ) || {}

        // try video call (earlier id -> later id)
        this._tryVideoCall(sessionId)

        // send request video call (later id -> earlier id)
        rid = this._getRid(sessionId)
        rm = rid && this._ridMembersTable[rid]
        members = rm && rm.members
        if (members) {
          targets = []
          for (i = 0; i < members.length; i++) {
            if (this._videoClientUser > members[i].phone_id) {
              // send request only to earlier id
              if (
                members[i].talker_hold !== 'h' &&
                rm.me.talker_hold !== 'h' &&
                members[i].talker_attr === rm.me.talker_attr
              ) {
                targets.push(members[i].phone_id)
              }
            }
          }
          options = clone(session.videoOptions.call) || {}
          options.mediaConstraints = {
            audio: session.audio,
            video: session.video,
          } // dummy (same as main session)
          if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
            options.pcConfig = clone(options.pcConfig) || {}
            options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout
          }
          if (!options.extraHeaders) {
            options.extraHeaders = []
          }
          if (
            !options.extraHeaders.some(function (o) {
              return string(o).split(':')[0].trim() === 'X-PBX'
            })
          ) {
            options.extraHeaders = options.extraHeaders.concat('X-PBX: false')
          }
          options.extraHeaders = options.extraHeaders.concat(
            'X-REQUEST-VIDEO-CALL: true',
          ) // request video call
          for (i = 0; i < targets.length; i++) {
            // send
            this._doCall(
              targets[i],
              options,
              this._vua,
              null,
              false,
              by(this, this._rtcErrorOccurred, [
                {
                  sessionId,
                  target: null,
                  options,
                  client: 'video',
                },
              ]),
            )
          }
        }
      } else if (withVideo === true && session.withVideo) {
        session.videoOptions =
          clone(
            videoOptions ||
              session.videoOptions ||
              (this.defaultOptions && this.defaultOptions.videoOptions),
          ) || {}
      } else if (withVideo === false && session.withVideo) {
        session.withVideo = false
        session.videoOptions = null

        // disconnect all
        this._checkAndTerminateVideo()
      } else {
        this._logger.log('info', 'Skipped changing withVideo')
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
    },

    /**
     * function makeAdditionalVideoCall
     */
    makeAdditionalVideoCall(sessionId, videoOptions, targets) {
      var existing
      var i
      var j
      var members
      var memberTargets
      var options
      var rid
      var rm
      var session

      if (!this._ua || this._phoneStatus !== 'started') {
        this._logger.log('warn', 'WebRTC not started')
        return
      }

      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]

      if (!session) {
        this._logger.log('warn', 'Not found session of sessionId: ' + sessionId)
        return
      }

      if (!session.withVideo) {
        this._logger.log('warn', 'Not with video')
        return
      }

      if (!this._vua) {
        this._logger.log('warn', 'Video client unavailable')
        return
      }

      videoOptions =
        clone(
          videoOptions ||
            session.videoOptions ||
            (this.defaultOptions && this.defaultOptions.videoOptions),
        ) || {}

      // rid
      rid = this._getRid(sessionId)
      if (!rid) {
        this._logger.log(
          'debug',
          'Session info (rid) not received yet: sessionId: ' + sessionId,
        )
        return
      }

      // members
      rm = this._ridMembersTable[rid]
      if (!rm) {
        this._logger.log(
          'debug',
          'Members not notified yet: sessionId: ' + sessionId + ', rid: ' + rid,
        )
        return
      }
      members = rm.members

      // targets
      memberTargets = []
      for (i = 0; i < members.length; i++) {
        if (members[i].phone_id !== this._videoClientUser) {
          if (Array.isArray(targets) && targets.indexOf(members[i].user) >= 0) {
            memberTargets.push(members[i].phone_id)
          }
        }
      }

      // options
      options = clone(videoOptions.call) || {}
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: false, video: true }
      }
      if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
        options.pcConfig = clone(options.pcConfig) || {}
        options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout
      }
      if (!options.extraHeaders) {
        options.extraHeaders = []
      }
      if (
        !options.extraHeaders.some(function (o) {
          return string(o).split(':')[0].trim() === 'X-PBX'
        })
      ) {
        options.extraHeaders = options.extraHeaders.concat('X-PBX: false')
      }

      // make call
      for (i = 0; i < memberTargets.length; i++) {
        this._doCall(
          memberTargets[i],
          options,
          this._vua,
          null,
          session.videoOptions && session.videoOptions.screenCapture,
          by(this, this._rtcErrorOccurred, [
            {
              sessionId,
              target: null,
              options,
              client: 'video',
            },
          ]),
        )
      }
    },

    /**
     * function answer
     */
    answer(sessionId, options, withVideo, videoOptions, exInfo) {
      var rtcInfoJsonStr
      var session

      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]

      if (!session) {
        this._logger.log('warn', 'Not found session of sessionId: ' + sessionId)
        return
      }

      if (
        session.sessionStatus !== 'dialing' &&
        session.sessionStatus !== 'progress'
      ) {
        this._logger.log(
          'warn',
          'Invalid sessionStatus: ' + session.sessionStatus,
        )
        return
      }

      if (session.answeringStarted) {
        this._logger.log('warn', 'Already answering')
        return
      }

      if (withVideo === true) {
        if (!this._vua) {
          this._logger.log('warn', 'Video client unavailable')
          return
        }
        session.withVideo = true
      } else if (withVideo === false) {
        session.withVideo = false
      }
      if (session.withVideo) {
        // set videoOptions
        if (videoOptions) {
          session.videoOptions = clone(videoOptions)
        } else if (!session.videoOptions) {
          session.videoOptions =
            clone(this.defaultOptions && this.defaultOptions.videoOptions) || {}
        }

        this._tryVideoCall(sessionId)
      }

      options =
        clone(
          options ||
            (this.defaultOptions &&
              this.defaultOptions.main &&
              this.defaultOptions.main.answer),
        ) || {}
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: true, video: false }
      }
      if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
        options.pcConfig = clone(options.pcConfig) || {}
        options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout
      }
      if (!options.extraHeaders) {
        options.extraHeaders = []
      }

      session.exInfo = string(
        typeof exInfo !== 'undefined' ? exInfo : session.exInfo,
      )
      rtcInfoJsonStr = JSON.stringify({
        user: string(
          string(
            session.incomingMessage &&
              session.incomingMessage.getHeader &&
              session.incomingMessage.getHeader('X-PBX-Session-Info'),
          ).split(';')[3],
        ),
        withVideo: session.withVideo,
      })
      options.extraHeaders = options.extraHeaders.concat(
        'X-UA-EX: rtcinfo=' +
          encodeURIComponent(rtcInfoJsonStr) +
          ';' +
          session.exInfo,
      )

      session.answeringStarted = true
      if (
        session.sessionStatus === 'dialing' ||
        session.sessionStatus === 'progress'
      ) {
        this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
      }
      this._doAnswer(
        sessionId,
        options,
        session.rtcSession,
        null,
        false,
        by(this, this._answerFailed, [
          {
            sessionId,
            target: null,
            options,
            client: 'main',
          },
        ]),
      )
    },

    /**
     * function reconnectMicrophone
     */
    reconnectMicrophone(sessionId, options) {
      var mediaObject
      var session

      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]
      if (!session) {
        this._logger.log('warn', 'Not found session of sessionId: ' + sessionId)
        return
      }
      mediaObject = this._sessionLocalMediaTable[sessionId]
      if (mediaObject && mediaObject.sourceNode && mediaObject.gainNode) {
        options =
          clone(
            options ||
              (this.defaultOptions &&
                this.defaultOptions.main &&
                (session.rtcSession.direction === 'outgoing'
                  ? this.defaultOptions.main.call
                  : this.defaultOptions.main.answer)),
          ) || {}
        if (!options.mediaConstraints) {
          options.mediaConstraints = { audio: true, video: false }
        }

        // getUserMedia
        this._getUserMedia(
          options.mediaConstraints,
          false,
          function (stream) {
            if (mediaObject === this._sessionLocalMediaTable[sessionId]) {
              if (mediaObject.localMediaStream) {
                JsSIP.Utils.closeMediaStream(mediaObject.localMediaStream)
              }
              try {
                mediaObject.sourceNode.disconnect()
              } catch (e) {}
              mediaObject.sourceNode =
                this._audioContext.createMediaStreamSource(stream)
              mediaObject.sourceNode.connect(mediaObject.gainNode)
              mediaObject.localMediaStream = stream
            } else {
              this._logger.log(
                'warn',
                '_sessionLocalMediaTable[' + sessionId + '] removed',
              )
              JsSIP.Utils.closeMediaStream(stream)
            }
          },
          function (error) {
            this._logger.log(
              'error',
              'getUserMedia() failed: ' + stringifyError(error),
            )
            this._rtcErrorOccurred(
              {
                sessionId,
                target: null,
                options,
                client: 'main',
              },
              { from: 'browser', error },
            )
          },
          0,
        )
      }
    },

    /**
     * function setMuted
     */
    setMuted(muted, sessionId) {
      var mutedOrg
      var rid
      var self = this
      var videoClientSession
      var videoClientSessionId

      muted = muted || {}
      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]

      mutedOrg = {
        main: false,
        videoClient: false,
      }

      if (!session) {
        this._logger.log('warn', 'Not found session of sessionId: ' + sessionId)
        return mutedOrg
      }

      mutedOrg = {
        main: Boolean(session.mainMuted),
        videoClient: Boolean(session.videoClientMuted),
      }

      if (muted.main === true || muted.main === false) {
        session.mainMuted = muted.main
        if (session.rtcSession && session.rtcSession.isEstablished()) {
          if (
            session.rtcSession._connection &&
            !session.rtcSession._connection.getLocalStreams
          ) {
            // for safari
            session.rtcSession._connection.getLocalStreams = function () {
              return [
                self._sessionLocalMediaTable[sessionId].localMediaStreamForCall,
              ]
            }
          }
          if (muted.main) {
            session.rtcSession.mute({ audio: true, video: true })
          } else {
            session.rtcSession.unmute({ audio: true, video: true })
          }
        }
      }

      if (muted.videoClient === true || muted.videoClient === false) {
        session.videoClientMuted = muted.videoClient
        rid = this._getRid(sessionId)
        if (rid && this._ridVideoClientSessionsTable[rid]) {
          for (videoClientSessionId in this._ridVideoClientSessionsTable[rid]) {
            videoClientSession =
              this._ridVideoClientSessionsTable[rid][videoClientSessionId]
            if (
              videoClientSession &&
              videoClientSession.rtcSession &&
              videoClientSession.rtcSession.isEstablished()
            ) {
              if (
                videoClientSession.rtcSession._connection &&
                !videoClientSession.rtcSession._connection.getLocalStreams
              ) {
                // for safari
                videoClientSession.rtcSession._connection.getLocalStreams =
                  function () {
                    return [
                      self._sessionLocalMediaTable[videoClientSessionId]
                        .localMediaStreamForCall,
                    ]
                  }
              }
              if (muted.videoClient) {
                videoClientSession.rtcSession.mute({
                  audio: true,
                  video: true,
                })
              } else {
                videoClientSession.rtcSession.unmute({
                  audio: true,
                  video: true,
                })
              }
            }
          }
        }
      }

      return mutedOrg
    },

    /**
     * function setSessionVolume
     */
    setSessionVolume(volumePercent, sessionId) {
      var mediaObject
      var session

      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]
      mediaObject = this._sessionLocalMediaTable[sessionId]
      if (mediaObject && mediaObject.gainNode) {
        mediaObject.volumePercent = int(volumePercent)
        mediaObject.gainNode.gain.value =
          (this._masterVolume * mediaObject.volumePercent) / 100000
      } else if (session) {
        session.initialVolumePercent = int(volumePercent)
      } else {
        this._logger.log('warn', 'Not found session of sessionId: ' + sessionId)
        return
      }
    },

    /**
     * function sendDTMF
     */
    sendDTMF(tones, sessionId, options) {
      var environment
      var mediaObject
      var self = this
      var sendInbandDTMF
      var session

      options = options || {}
      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]
      mediaObject = this._sessionLocalMediaTable[sessionId]

      if (!session) {
        this._logger.log('warn', 'Not found session of sessionId: ' + sessionId)
        return
      }

      environment = this.getEnvironment()
      if (
        int(this.dtmfSendMode) === 1 &&
        !Boolean(options && options.disableOscillator)
      ) {
        sendInbandDTMF = function () {
          var duration
          var interToneGap
          var tasksLengthOrg
          var volume
          duration = int(options && options.duration) || 100
          interToneGap = int(options && options.interToneGap) || 500
          isNaN((volume = parseInt(options && options.volume, 10))) &&
            (volume = 320)
          tasksLengthOrg = mediaObject.dtmfTasks.length
          string(tones)
            .split('')
            .forEach(function (tone) {
              var oscillator
              if (mediaObject.dtmfOscillatorTable[tone]) {
                oscillator = mediaObject.dtmfOscillatorTable[tone]
                mediaObject.dtmfTasks.push(function () {
                  self._logger.log('debug', 'Play inband DTMF: ' + tone)
                  mediaObject.gainNode.gain.value = 0
                  oscillator.lowerGain.gain.value = volume / 1000
                  oscillator.upperGain.gain.value = volume / 1000
                  if (mediaObject.dtmfTasks.length > 0) {
                    mediaObject.dtmfTimer = setTimeout(
                      mediaObject.dtmfTasks.shift(),
                      duration,
                    )
                  } else {
                    mediaObject.dtmfTimer = null
                  }
                })
                mediaObject.dtmfTasks.push(function () {
                  mediaObject.gainNode.gain.value = 1
                  oscillator.lowerGain.gain.value = 0
                  oscillator.upperGain.gain.value = 0
                  if (mediaObject.dtmfTasks.length > 0) {
                    mediaObject.dtmfTimer = setTimeout(
                      mediaObject.dtmfTasks.shift(),
                      interToneGap,
                    )
                  } else {
                    mediaObject.dtmfTimer = null
                  }
                })
              }
            })
          if (mediaObject.dtmfTasks.length > 0) {
            self._logger.log('debug', 'Prepare inband DTMF: ' + tones)
            if (tasksLengthOrg === 0) {
              mediaObject.dtmfTasks.shift()()
            }
          }
        }
        if (
          mediaObject &&
          mediaObject.gainNode &&
          mediaObject.dtmfOscillatorTable
        ) {
          // send inband DTMF
          sendInbandDTMF()
        } else if (
          mediaObject &&
          !mediaObject.gainNode &&
          !mediaObject.dtmfOscillatorTable &&
          mediaObject.localMediaStream &&
          mediaObject.mediaConstraints &&
          mediaObject.mediaConstraints.audio &&
          !mediaObject.mediaConstraints.video &&
          environment.gain &&
          environment.oscillator
        ) {
          // inband DTMF is available but OscillatorNodes are not prepared yet (on chrome 66~)
          try {
            session.rtcSession.connection.removeStream(
              mediaObject.localMediaStream,
            )
            this._connectLocalMediaToAudioNode(sessionId)
            session.rtcSession.connection.addStream(
              mediaObject.localMediaStreamForCall,
            )
            session.rtcSession.connection.onnegotiationneeded = function () {
              session.rtcSession.connection.onnegotiationneeded = function () {}
              session.rtcSession.connection.createOffer(
                function (desc) {
                  self._logger.log(
                    'debug',
                    'session.rtcSession.connection.createOffer OK',
                  )
                  session.rtcSession.connection.setLocalDescription(
                    desc,
                    function () {
                      self._logger.log(
                        'debug',
                        'session.rtcSession.connection.setLocalDescription OK',
                      )
                      // send inband DTMF
                      sendInbandDTMF()
                    },
                    function (error) {
                      self._logger.log(
                        'warn',
                        'session.rtcSession.connection.setLocalDescription NG',
                      )
                      mediaObject.dtmfOscillatorTable = {} // never retry
                      // send SIP INFO DTMF
                      session.rtcSession.sendDTMF(tones, options)
                    },
                  )
                },
                function (error) {
                  self._logger.log(
                    'warn',
                    'session.rtcSession.connection.createOffer NG',
                  )
                  mediaObject.dtmfOscillatorTable = {} // never retry
                  // send SIP INFO DTMF
                  session.rtcSession.sendDTMF(tones, options)
                },
              )
            }
          } catch (e) {
            this._logger.log(
              'warn',
              'Cannot to prepare OscillatorNodes to send inband DTMF: ' +
                stringifyError(e),
            )
            mediaObject.dtmfOscillatorTable = {} // never retry
            // send SIP INFO DTMF
            session.rtcSession.sendDTMF(tones, options)
          }
        } else {
          this._logger.log('info', 'Cannot to play inband DTMF')
          // send SIP INFO DTMF
          session.rtcSession.sendDTMF(tones, options)
        }
      } else {
        // send SIP INFO DTMF
        session.rtcSession.sendDTMF(tones, options)
      }
    },

    /**
     * function getPhoneStatus
     */
    getPhoneStatus() {
      return string(this._phoneStatus)
    },

    /**
     * function getSession
     */
    getSession(sessionId) {
      var analyser
      var localStreamObject
      var localVideoStreamObject
      var localVideoStreamTimestamp
      var remoteStreamObject
      var remoteUserOptions
      var remoteUserOptionsTable
      var remoteVideoStreamObject
      var remoteWithVideo
      var rid
      var session
      var user
      var videoClientSession
      var videoClientSessionId
      var videoClientSessionTable

      sessionId = string(sessionId) || this._getLatestSessionId()
      session = this._sessionTable[sessionId]

      if (!session) {
        return null
      }

      remoteStreamObject = null
      localStreamObject = null
      localVideoStreamObject = null
      localVideoStreamTimestamp = +new Date() + 1
      videoClientSessionTable = {}
      analyser = null
      if (session.sessionStatus !== 'terminated') {
        try {
          remoteStreamObject =
            (this._sessionRemoteStreamsTable[sessionId] || [])[0] || null
        } catch (e) {
          remoteStreamObject = null
        }

        if (this._sessionLocalMediaTable[sessionId]) {
          localStreamObject =
            this._sessionLocalMediaTable[sessionId].localMediaStreamForCall
        }

        // video client sessions information
        rid = this._getRid(sessionId)
        if (rid) {
          if (this._ridVideoClientSessionsTable[rid]) {
            for (videoClientSessionId in this._ridVideoClientSessionsTable[
              rid
            ]) {
              videoClientSession =
                this._ridVideoClientSessionsTable[rid][videoClientSessionId]
              if (
                videoClientSession &&
                videoClientSession.rtcSession &&
                videoClientSession.rtcSession.isEstablished()
              ) {
                try {
                  remoteVideoStreamObject =
                    (this._sessionRemoteStreamsTable[videoClientSessionId] ||
                      [])[0] || null
                } catch (e) {
                  remoteVideoStreamObject = null
                }
                videoClientSessionTable[videoClientSessionId] = {
                  user: string(
                    videoClientSession.member && videoClientSession.member.user,
                  ),
                  remoteStreamObject: remoteVideoStreamObject,
                  rtcSession: videoClientSession.rtcSession,
                }
                if (this._sessionLocalMediaTable[videoClientSessionId]) {
                  if (
                    this._sessionLocalMediaTable[videoClientSessionId]
                      .timestamp < localVideoStreamTimestamp
                  ) {
                    localVideoStreamObject =
                      this._sessionLocalMediaTable[videoClientSessionId]
                        .localMediaStreamForCall
                    localVideoStreamTimestamp =
                      this._sessionLocalMediaTable[videoClientSessionId]
                        .timestamp
                  }
                }
              }
            }
          }
        }

        // analyser
        if (this._sessionLocalMediaTable[sessionId]) {
          analyser = this._sessionLocalMediaTable[sessionId].analyser
        }
      }

      remoteUserOptionsTable = {}
      remoteWithVideo = false
      for (user in session.remoteUserOptionsTable) {
        remoteUserOptions = session.remoteUserOptionsTable[user]
        remoteUserOptionsTable[user] = {
          withVideo: Boolean(remoteUserOptions.withVideo),
          exInfo: string(remoteUserOptions.exInfo),
        }
        if (remoteUserOptions.withVideo) {
          remoteWithVideo = true
        }
      }

      return {
        sessionId: session.sessionId,
        sessionStatus: session.sessionStatus,
        answering:
          session.answeringStarted &&
          (session.sessionStatus === 'dialing' ||
            session.sessionStatus === 'progress'),
        audio: session.audio,
        video: session.video,
        remoteStreamObject,
        localStreamObject,
        remoteWithVideo,
        withVideo: session.withVideo,
        shareStream: Boolean(
          session.videoOptions && session.videoOptions.shareStream,
        ),
        exInfo: string(session.exInfo),
        muted: {
          main: Boolean(session.mainMuted),
          videoClient: Boolean(session.videoClientMuted),
        },
        localVideoStreamObject,
        videoClientSessionTable,
        rtcSession: session.rtcSession,
        incomingMessage: session.incomingMessage,
        remoteUserOptionsTable,
        analyser,
      }
    },

    /**
     * function getSessionTable
     */
    getSessionTable() {
      var sessionId
      var sessionTable = {}

      // return copy of _sessionTable
      for (sessionId in this._sessionTable) {
        sessionTable[sessionId] = this.getSession(sessionId)
      }
      return sessionTable
    },

    /**
     * function getSessionCount
     */
    getSessionCount() {
      return Object.keys(this._sessionTable).length
    },

    /**
     * function getEnvironment
     */
    getEnvironment() {
      var environment = {
        webRTC: false,
        gain: false,
        oscillator: false,
        name: '',
        version: '',
      }
      var ua
      var uaLower

      ua = string(typeof navigator !== 'undefined' && navigator.userAgent)
      uaLower = ua.toLowerCase()
      if (
        (window.RTCPeerConnection ||
          window.mozRTCPeerConnection ||
          window.webkitRTCPeerConnection) &&
        typeof navigator === 'object' &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      ) {
        environment.webRTC = true
      }
      if (this.UA_WO_GAIN && ua.indexOf(this.UA_WO_GAIN) >= 0) {
        // "Cannot create an offer with no local tracks, no offerToReceiveAudio/Video, and no DataChannel."
      } else if (
        this._audioContext &&
        this._audioContext.createGain &&
        this._audioContext.createMediaStreamSource &&
        this._audioContext.createMediaStreamDestination
      ) {
        environment.gain = true
        if (this._audioContext.createOscillator) {
          environment.oscillator = true
        }
      }

      ;[
        'edge',
        'edg',
        'vivaldi',
        'opera',
        'opr',
        'chrome',
        'safari',
        'firefox',
        'trident',
      ].some(function (name) {
        var found = uaLower.match(new RegExp(name + '\\/([0-9]*)'))
        if (found) {
          environment.name = name
          environment.version = found[1]
          return true
        } else {
          return false
        }
      })

      return environment
    },

    /**
     * getter masterVolume
     */
    get masterVolume() {
      return this._masterVolume
    },

    /**
     * setter masterVolume
     */
    set masterVolume(value) {
      var key
      var mediaObject

      this._masterVolume = int(value)
      for (key in this._sessionLocalMediaTable) {
        mediaObject = this._sessionLocalMediaTable[key]
        if (mediaObject.gainNode) {
          mediaObject.gainNode.gain.value =
            (this._masterVolume * mediaObject.volumePercent) / 100000
        }
      }
    },

    /**
     * private functions
     */
    _emitEvent(eventName, eventArgs) {
      var func
      var i = 0
      var len = 0

      this._logger.log(
        'debug',
        'Emitting event: ' +
          eventName +
          ' eventArgs: { ' +
          stringify(eventArgs) +
          ' }',
      )

      if (this._eventNameIdsTable[eventName]) {
        for (
          i = 0, len = this._eventNameIdsTable[eventName].length;
          i < len;
          i++
        ) {
          func = this._eventIdFuncTable[this._eventNameIdsTable[eventName][i]]
          if (func) {
            try {
              func(eventArgs)
            } catch (e) {
              this._logger.log('error', 'func() failed: ' + stringifyError(e))
            }
          }
        }
      }
    },
    _registerAudioContext() {
      var elems
      var funcToResume
      var self = this

      this._logger.log(
        'debug',
        'AudioContext.state: ' + this._audioContext.state,
      )
      if (this._audioContext.state === 'suspended') {
        try {
          funcToResume = function () {
            try {
              self._logger.log('debug', 'AudioContext.resume()')
              self._audioContext.resume().then(function () {
                self._logger.log('debug', 'AudioContext resumed successfully')
                elems.forEach(function (elem) {
                  elem.removeEventListener('click', funcToResume)
                })
                elems.length = 0
              })
            } catch (e) {
              try {
                self._logger.log('info', stringifyError(e))
              } catch (e) {}
            }
          }
          elems = []
          try {
            elems.push(window.document.body)
            elems.push(window.opener.document.body)
          } catch (e) {}
          elems.forEach(function (elem) {
            elem.addEventListener('click', funcToResume)
          })
        } catch (e) {
          this._logger.log('info', stringifyError(e))
        }
      }
    },
    _changePhoneStatus(status) {
      var dialog_id
      var rtcSession
      var session
      var sessionId
      var target

      if (status !== 'stopping' && status !== 'stopped') {
        this._stopReasonInfo = null
      }
      if (this._phoneStatus !== status) {
        this._phoneStatus = status
        if (status !== 'starting') {
          this._uaStarting = false
          this._vuaStarting = false
        }
        if (status !== 'stopped') {
          this._aliveSessions.length = 0
          if (status === 'stopping') {
            for (sessionId in this._sessionTable) {
              session = this._sessionTable[sessionId]
              rtcSession = session && session.rtcSession
              target = string(
                rtcSession &&
                  rtcSession.remote_identity &&
                  rtcSession.remote_identity.uri &&
                  rtcSession.remote_identity.uri.user,
              )
              dialog_id =
                rtcSession && rtcSession._dialog && rtcSession._dialog.id
              if (target && dialog_id) {
                this._aliveSessions.push({
                  sessionId,
                  target,
                  options: {
                    extraHeaders: [
                      'Replaces: ' +
                        dialog_id.call_id +
                        ';to-tag=' +
                        encodeURIComponent(dialog_id.remote_tag) +
                        ';from-tag=' +
                        encodeURIComponent(dialog_id.local_tag),
                    ],
                  },
                })
              } else {
                this._logger.log('warn', 'Invalid alive session: ' + sessionId)
              }
            }
          }
        }
        this._emitEvent('phoneStatusChanged', {
          phoneStatus: string(this._phoneStatus),
          from: string(this._stopReasonInfo && this._stopReasonInfo.from),
          reason: string(this._stopReasonInfo && this._stopReasonInfo.reason),
          response:
            (this._stopReasonInfo && this._stopReasonInfo.response) || null,
          aliveSessions: this._aliveSessions.concat(),
        })
        if (status === 'stopped') {
          this._aliveSessions.length = 0
        }
      }
    },
    _getUserMedia(
      constraints,
      screenCapture,
      successCallback,
      errorCallback,
      count,
    ) {
      this._logger.log('debug', '_getUserMedia #' + count)
      const ev = {
        constraints,
        screenCapture,
        count,
        extInfo: {},
      }
      if (!count) {
        this._emitEvent('deviceAccessStarted', ev)
      }
      if (this._gettingUserMedia) {
        if (!count || count < this.getUserMediaTimeout) {
          setTimeout(
            by(this, this._getUserMedia, [
              constraints,
              screenCapture,
              successCallback,
              errorCallback,
              (count || 0) + 1,
            ]),
            1000,
          )
        } else {
          this._gettingUserMedia = false
          ev.error = '_getUserMedia timeout'
          this._emitEvent('deviceAccessFailed', ev)
          if (errorCallback) {
            errorCallback.apply(this, ['_getUserMedia timeout'])
          }
        }
        return
      }
      this._gettingUserMedia = true
      if (this.autoFocusWindow) {
        try {
          if (window.opener && window.opener.eval && window.name) {
            window.opener.eval(
              "setTimeout(function() { window.open('', '" +
                window.name +
                "').focus(); }, 0)",
            )
          }
        } catch (e) {
          this._logger.log(
            'warn',
            'autoFocusWindow error message: ' + e.message,
          )
        }
      }
      try {
        navigator.mediaDevices[
          screenCapture ? 'getDisplayMedia' : 'getUserMedia'
        ](constraints).then(
          by(this, function (stream) {
            this._gettingUserMedia = false
            this._emitEvent('deviceAccessEstablished', ev)
            if (successCallback) {
              successCallback.apply(this, [stream])
            }
          }),
          by(this, function (error) {
            this._gettingUserMedia = false
            ev.error = error
            this._emitEvent('deviceAccessFailed', ev)
            if (errorCallback) {
              errorCallback.apply(this, [error])
            }
          }),
        )
      } catch (e) {
        this._gettingUserMedia = false
        if (errorCallback) {
          errorCallback.apply(this, [e])
        }
      }
    },
    _doCall(
      target,
      options,
      ua,
      sourceSessionId,
      screenCapture,
      errorCallback,
    ) {
      options = clone(options)

      if (sourceSessionId) {
        this._doUaCall(
          target,
          options,
          ua,
          false,
          sourceSessionId,
          errorCallback,
          null,
        )
      } else if (options.mediaStream) {
        this._doUaCall(target, options, ua, false, null, errorCallback, null)
      } else {
        // getUserMedia
        this._getUserMedia(
          options.mediaConstraints,
          screenCapture,
          this._doUaCall.bind(
            this,
            target,
            options,
            ua,
            true,
            null,
            errorCallback,
          ),
          function (error) {
            this._logger.log(
              'error',
              'getUserMedia() failed: ' + stringifyError(error),
            )
            if (errorCallback) {
              errorCallback.apply(this, [{ from: 'browser', error }])
            }
          },
          0,
        )
      }
    },
    _doUaCall(
      target,
      options,
      ua,
      isNew,
      sourceSessionId,
      errorCallback,
      stream,
    ) {
      options = clone(options)

      // local media
      this._disposeLocalMedia('outgoing')
      this._createLocalMedia(
        'outgoing',
        stream,
        options.mediaConstraints,
        isNew,
        sourceSessionId,
      )
      if (!options.mediaStream) {
        try {
          this._connectLocalMediaToAudioNode('outgoing')
          options.mediaStream =
            this._sessionLocalMediaTable['outgoing'].localMediaStreamForCall
        } catch (e) {
          this._logger.log(
            'error',
            '_connectLocalMediaToAudioNode() failed: ' + stringifyError(e),
          )
          this._disposeLocalMedia('outgoing')
          if (errorCallback) {
            errorCallback.apply(this, [{ from: 'jssip', error: e }])
          }
          return
        }
      }

      // call
      try {
        ua.call(target, options)
      } catch (e) {
        this._logger.log(
          'error',
          'JsSIP.UA.call() failed: ' + stringifyError(e),
        )
        this._disposeLocalMedia('outgoing')
        if (errorCallback) {
          errorCallback.apply(this, [{ from: 'jssip', error: e }])
        }
      }
    },
    _iceCandidateGatheringTimedOut(iceCandidateInfo) {
      this._logger.log(
        'debug',
        'ice candidate gathering timed out: ' +
          int(
            iceCandidateInfo &&
              iceCandidateInfo.icecandidates &&
              iceCandidateInfo.icecandidates.length,
          ),
      )
      if (iceCandidateInfo && iceCandidateInfo.onGatheringTimedOut) {
        iceCandidateInfo.onGatheringTimedOut()
      }
    },
    _rtcErrorOccurred(eventArgs, e) {
      eventArgs.from = e.from
      eventArgs.error = e.error
      this._emitEvent('rtcErrorOccurred', eventArgs)
    },
    _doAnswer(
      sessionId,
      options,
      rtcSession,
      sourceSessionId,
      screenCapture,
      errorCallback,
    ) {
      if (rtcSession.direction !== 'incoming') {
        this._logger.log(
          'warn',
          'Invalid rtcSession.direction: ' + rtcSession.direction,
        )
        if (errorCallback) {
          errorCallback.apply(this, [{}])
        }
        return
      }
      if (rtcSession.status !== 4) {
        this._logger.log(
          'warn',
          'Invalid rtcSession.status: ' + rtcSession.status,
        )
        if (errorCallback) {
          errorCallback.apply(this, [{}])
        }
        return
      }

      options = clone(options)

      if (sourceSessionId) {
        this._doRtcSessionAnswer(
          sessionId,
          options,
          rtcSession,
          false,
          sourceSessionId,
          errorCallback,
          null,
        )
      } else if (options.mediaStream) {
        this._doRtcSessionAnswer(
          sessionId,
          options,
          rtcSession,
          false,
          null,
          errorCallback,
          null,
        )
      } else {
        // getUserMedia
        this._getUserMedia(
          options.mediaConstraints,
          screenCapture,
          this._doRtcSessionAnswer.bind(
            this,
            sessionId,
            options,
            rtcSession,
            true,
            null,
            errorCallback,
          ),
          function (error) {
            this._logger.log(
              'error',
              'getUserMedia() failed: ' + stringifyError(error),
            )
            if (errorCallback) {
              errorCallback.apply(this, [{ from: 'browser', error }])
            }
          },
          0,
        )
      }
    },
    _doRtcSessionAnswer(
      sessionId,
      options,
      rtcSession,
      isNew,
      sourceSessionId,
      errorCallback,
      stream,
    ) {
      options = clone(options)

      // local media
      this._disposeLocalMedia(sessionId)
      this._createLocalMedia(
        sessionId,
        stream,
        options.mediaConstraints,
        isNew,
        sourceSessionId,
      )
      if (!options.mediaStream) {
        try {
          this._connectLocalMediaToAudioNode(sessionId)
          options.mediaStream =
            this._sessionLocalMediaTable[sessionId].localMediaStreamForCall
        } catch (e) {
          this._logger.log(
            'error',
            '_connectLocalMediaToAudioNode() failed: ' + stringifyError(e),
          )
          this._disposeLocalMedia(sessionId)
          if (errorCallback) {
            errorCallback.apply(this, [{ from: 'jssip', error: e }])
          }
          return
        }
      }

      // answer
      try {
        rtcSession.answer(options)
      } catch (e) {
        this._logger.log(
          'error',
          'JsSIP.RTCSession.answer() failed: ' + stringifyError(e),
        )
        this._disposeLocalMedia(sessionId)
        if (errorCallback) {
          errorCallback.apply(this, [{ from: 'jssip', error: e }])
        }
      }
    },
    _answerFailed(eventArgs, e) {
      var session
      var sessionId

      if (e && e.from) {
        this._rtcErrorOccurred(eventArgs, e)
      }
      sessionId = eventArgs && eventArgs.sessionId
      session = this._sessionTable[sessionId]
      if (session && session.answeringStarted) {
        session.answeringStarted = false
        if (
          session.sessionStatus === 'dialing' ||
          session.sessionStatus === 'progress'
        ) {
          this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
        }
      }
    },
    _tryVideoCall(sessionId) {
      var clearTryingVideoCallTarget
      var doCallFunc
      var i
      var j
      var members
      var membersCache
      var mustUpdateRemoteUserOptions
      var myMemberIndex
      var options
      var rid
      var rm
      var self = this
      var session
      var targets

      this._checkAndTerminateVideo()

      // make video call when all informations (session, rid, members) have been prepared

      // session
      session = this._sessionTable[sessionId]
      if (!session) {
        this._logger.log('info', 'Empty session')
        return
      }

      // rid
      rid = this._getRid(sessionId)
      if (!rid) {
        this._logger.log(
          'debug',
          'Session info (rid) not received yet: sessionId: ' + sessionId,
        )
        return
      }

      // members
      rm = this._ridMembersTable[rid]
      if (!rm) {
        this._logger.log(
          'debug',
          'Members not notified yet: sessionId: ' + sessionId + ', rid: ' + rid,
        )
        return
      }
      members = rm.members

      // targets
      targets = []
      mustUpdateRemoteUserOptions = false
      myMemberIndex = -1
      for (i = 0; i < members.length; i++) {
        if (this._videoClientUser < members[i].phone_id) {
          // make call only from earlier id
          if (
            members[i].talker_hold !== 'h' &&
            rm.me.talker_hold !== 'h' &&
            members[i].talker_attr === rm.me.talker_attr
          ) {
            if (!this._tryingVideoCallTargets[members[i].phone_id]) {
              targets.push(members[i].phone_id)
            }
          }
        } else if (this._videoClientUser === members[i].phone_id) {
          myMemberIndex = i
        }
        if (!session.remoteUserOptionsTable[members[i].user]) {
          mustUpdateRemoteUserOptions = true
        }
      }

      // update remoteUserOptions
      membersCache = JSON.stringify(members)
      if (session.membersCache !== membersCache) {
        try {
          JSON.parse(session.membersCache).filter(function (member) {
            if (
              self._videoClientUser !== member.phone_id &&
              !members.some(function (m) {
                return m.user === member.user
              })
            ) {
              delete session.remoteUserOptionsTable[member.user]
              return true
            } else {
              return false
            }
          }).length &&
            this._emitEvent(
              'remoteUserOptionsChanged',
              this.getSession(sessionId),
            )
        } catch (e) {}
        session.membersCache = membersCache
        session.sendInfoXUaExTime = mustUpdateRemoteUserOptions
          ? +new Date() + myMemberIndex * 1000
          : Number.MAX_VALUE
        session.mustSendInfoXUaEx = false
      }

      if (!session.withVideo) {
        this._logger.log('debug', 'No need to try video call')
        return
      }
      if (!this._vua || this._phoneStatus !== 'started') {
        this._logger.log('warn', 'Video client unavailable')
        return
      }
      for (i = 0; i < targets.length; i++) {
        this._tryingVideoCallTargets[targets[i]] = true
      }

      doCallFunc = function (target) {
        var creatingLocalMedia = false
        var i
        var session
        var sourceSessionId
        var target

        if (!targets || !targets.length) {
          return
        }

        if (!self._sessionTable[sessionId]) {
          self._logger.log(
            'info',
            'Cannot do video call (main session terminated)',
          )
          for (i = 0; i < targets.length; i++) {
            self._clearTryingVideoCallTarget(targets[i])
          }
          return
        }
        session = self._sessionTable[sessionId]
        sourceSessionId = null
        if (session.videoOptions && session.videoOptions.shareStream) {
          sourceSessionId =
            (self._ridVideoClientSessionsTable[rid] &&
              Object.keys(self._ridVideoClientSessionsTable[rid]).filter(
                function (vcsid) {
                  if (
                    self._ridVideoClientSessionsTable[rid][vcsid] &&
                    self._ridVideoClientSessionsTable[rid][vcsid]
                      .outgoingRequestVideoCall
                  ) {
                    return false
                  }
                  if (!self._sessionLocalMediaTable[vcsid]) {
                    creatingLocalMedia = true
                    return false
                  }
                  return true
                },
              )[0]) ||
            null
          if (!sourceSessionId && creatingLocalMedia) {
            // wait for creating previous local media
            self._logger.log(
              'debug',
              'Waiting for creating previous local media...',
            )
            setTimeout(doCallFunc, 1000)
            return
          }
          if (self._gettingUserMedia) {
            // wait for getting another local user media
            self._logger.log(
              'debug',
              'Waiting for creating another local user media...',
            )
            setTimeout(doCallFunc, 1000)
            return
          }
        }

        target = targets.shift()

        // options
        options = clone(session.videoOptions && session.videoOptions.call) || {}
        if (!options.mediaConstraints) {
          options.mediaConstraints = { audio: false, video: true }
        }
        if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
          options.pcConfig = clone(options.pcConfig) || {}
          options.pcConfig.gatheringTimeout = self._defaultGatheringTimeout
        }
        if (!options.extraHeaders) {
          options.extraHeaders = []
        }
        if (
          !options.extraHeaders.some(function (o) {
            return string(o).split(':')[0].trim() === 'X-PBX'
          })
        ) {
          options.extraHeaders = options.extraHeaders.concat('X-PBX: false')
        }
        options.eventHandlers = clone(options.eventHandlers) || {}
        clearTryingVideoCallTarget = by(
          self,
          self._clearTryingVideoCallTarget,
          [target],
        )
        options.eventHandlers['failed'] = clearTryingVideoCallTarget
        options.eventHandlers['ended'] = clearTryingVideoCallTarget

        // make call
        self._doCall(
          target,
          options,
          self._vua,
          sourceSessionId,
          session.videoOptions && session.videoOptions.screenCapture,
          by(self, self._tryVideoCallFailed, [
            target,
            {
              sessionId: string(sessionId),
              target: null,
              options,
              client: 'video',
            },
          ]),
        )

        setTimeout(doCallFunc, 0)
      }
      doCallFunc()
    },
    _tryVideoCallFailed(target, eventArgs, e) {
      this._clearTryingVideoCallTarget(target)
      this._rtcErrorOccurred(eventArgs, e)
    },
    _clearTryingVideoCallTarget(target) {
      delete this._tryingVideoCallTargets[target]
    },
    _checkAndTerminateVideo() {
      var i
      var member
      var memberOk
      var members
      var rid
      var rm
      var sessionId
      var sessionOk
      var videoClientSessionId

      // check all video client sessions
      for (rid in this._ridVideoClientSessionsTable) {
        // check main session
        sessionOk = false
        for (sessionId in this._sessionTable) {
          if (
            rid === this._getRid(sessionId) &&
            this._sessionTable[sessionId].withVideo
          ) {
            sessionOk = true
          }
        }
        for (videoClientSessionId in this._ridVideoClientSessionsTable[rid]) {
          memberOk = false
          if (sessionOk) {
            // check member
            member =
              this._ridVideoClientSessionsTable[rid][videoClientSessionId]
                .member
            rm = this._ridMembersTable[rid]
            if (rm) {
              members = rm.members
              for (i = 0; i < members.length; i++) {
                if (members[i].phone_id === member.phone_id) {
                  if (
                    members[i].talker_hold !== 'h' &&
                    rm.me.talker_hold !== 'h' &&
                    members[i].talker_attr === rm.me.talker_attr
                  ) {
                    memberOk = true
                    break
                  }
                }
              }
            }
          }
          // terminate ng video client session
          if (!sessionOk || !memberOk) {
            this._terminateRtcSession(
              this._ridVideoClientSessionsTable[rid][videoClientSessionId]
                .rtcSession,
            )
          }
        }
      }
    },
    _terminateRtcSession(rtcSession) {
      try {
        rtcSession.terminate()
      } catch (e) {
        this._logger.log(
          'info',
          'RTCSession.terminate error message: ' +
            e.message +
            '\nstack: ' +
            e.stack +
            '\n',
        )
      }
    },
    _getLatestSessionId() {
      var sid
      var sessionId

      sessionId = ''
      for (sid in this._sessionTable) {
        if (this._sessionTable[sid].sessionStatus !== 'terminated') {
          if (int(sid) > int(sessionId)) {
            sessionId = sid
          }
        }
      }
      return sessionId
    },
    _createLocalMedia(
      sessionId,
      stream,
      mediaConstraints,
      isNew,
      sourceSessionId,
    ) {
      if (sourceSessionId) {
        this._sessionLocalMediaTable[sessionId] =
          this._sessionLocalMediaTable[sourceSessionId]
      } else {
        this._sessionLocalMediaTable[sessionId] = {
          localMediaStream: isNew ? stream : null,
          localMediaStreamForCall: stream,
          mediaConstraints,
          volumePercent:
            this._sessionTable[sessionId] &&
            typeof this._sessionTable[sessionId].initialVolumePercent ===
              'number'
              ? this._sessionTable[sessionId].initialVolumePercent
              : 100,
          gainNode: null,
          sourceNode: null,
          destinationNode: null,
          oscillators: null,
          dtmfOscillatorTable: null,
          dtmfTasks: [],
          dtmfTimer: null,
          analyser: null,
          timestamp: +new Date(),
        }
      }
    },
    _connectLocalMediaToAudioNode(sessionId) {
      var analyser = null
      var connectorNode = null
      var environment
      var destinationNode = null
      var dtmfOscillatorTable = null
      var gainNode = null
      var mediaConstraints
      var mediaObject
      var oscillators = null
      var sourceNode = null
      var stream
      var volumePercent

      mediaObject = this._sessionLocalMediaTable[sessionId]
      if (!mediaObject) {
        this._logger.log(
          'warn',
          'Not found local media of sessionId: ' + sessionId,
        )
        return
      }
      if (
        mediaObject.gainNode ||
        mediaObject.sourceNode ||
        mediaObject.destinationNode ||
        mediaObject.oscillators ||
        mediaObject.dtmfOscillatorTable ||
        mediaObject.analyser
      ) {
        this._logger.log(
          'warn',
          'Already connected local media of sessionId: ' + sessionId,
        )
        return
      }
      stream = mediaObject.localMediaStream
      mediaConstraints = mediaObject.mediaConstraints
      volumePercent = mediaObject.volumePercent
      environment = this.getEnvironment()
      if (
        environment.gain &&
        stream &&
        mediaConstraints &&
        mediaConstraints.audio &&
        !mediaConstraints.video &&
        (!(
          (this.CHECK_CTX_STATE === 1 && int(this.dtmfSendMode) !== 1) ||
          this.CHECK_CTX_STATE === 2
        ) ||
          this._audioContext.state === 'running')
      ) {
        if (int(this.analyserMode) === 1 && this._audioContext.createAnalyser) {
          // create analyser
          analyser = this._audioContext.createAnalyser()
        }

        // connect GainNode to control microphone volume
        gainNode = this._audioContext.createGain()
        sourceNode = this._audioContext.createMediaStreamSource(stream)
        destinationNode = this._audioContext.createMediaStreamDestination()
        sourceNode.connect(gainNode)
        connectorNode = gainNode
        if (typeof this._mediaStreamConverter === 'function') {
          connectorNode = this._mediaStreamConverter(connectorNode, sessionId)
        }
        if (analyser) {
          connectorNode = connectorNode.connect(analyser)
        }
        connectorNode.connect(destinationNode)
        gainNode.gain.value = (this._masterVolume * volumePercent) / 100000

        if (
          environment.oscillator &&
          (int(this.dtmfSendMode) === 1 || this.FORCE_CREATE_OSCILLATOR)
        ) {
          // prepare OscillatorNodes to send inband DTMF
          oscillators = {}
          dtmfOscillatorTable = {}
          ;[
            ['1', [697, 1209]],
            ['2', [697, 1336]],
            ['3', [697, 1477]],
            ['A', [697, 1633]],
            ['4', [770, 1209]],
            ['5', [770, 1336]],
            ['6', [770, 1477]],
            ['B', [770, 1633]],
            ['7', [852, 1209]],
            ['8', [852, 1336]],
            ['9', [852, 1477]],
            ['C', [852, 1633]],
            ['*', [941, 1209]],
            ['0', [941, 1336]],
            ['#', [941, 1477]],
            ['D', [941, 1633]],
          ].forEach(
            function (a) {
              var frequencies
              var tone
              tone = a[0]
              frequencies = a[1]
              frequencies.forEach(
                function (frequency) {
                  var oscillatorNode
                  var oscillatorGain
                  if (oscillators[frequency]) {
                    return
                  }
                  oscillatorNode = this._audioContext.createOscillator()
                  oscillatorGain = this._audioContext.createGain()
                  oscillatorNode.frequency.value = frequency
                  oscillatorNode.connect(oscillatorGain)
                  oscillatorGain.connect(destinationNode)
                  oscillatorGain.gain.value = 0
                  oscillatorNode.start(0)
                  oscillators[frequency] = {
                    oscillatorNode,
                    oscillatorGain,
                  }
                }.bind(this),
              )
              dtmfOscillatorTable[tone] = {
                lowerNode: oscillators[frequencies[0]].oscillatorNode,
                upperNode: oscillators[frequencies[1]].oscillatorNode,
                lowerGain: oscillators[frequencies[0]].oscillatorGain,
                upperGain: oscillators[frequencies[1]].oscillatorGain,
              }
            }.bind(this),
          )
        }

        mediaObject.localMediaStreamForCall = destinationNode.stream
        mediaObject.gainNode = gainNode
        mediaObject.sourceNode = sourceNode
        mediaObject.destinationNode = destinationNode
        mediaObject.oscillators = oscillators
        mediaObject.dtmfOscillatorTable = dtmfOscillatorTable
        mediaObject.analyser = analyser
      }
    },
    _disposeLocalMedia(sessionId) {
      var existing = false
      var mediaObject
      var sid

      mediaObject = this._sessionLocalMediaTable[sessionId]
      if (mediaObject) {
        for (sid in this._sessionLocalMediaTable) {
          if (
            sid !== string(sessionId) &&
            this._sessionLocalMediaTable[sid] === mediaObject
          ) {
            existing = true
            break
          }
        }
        if (!existing) {
          if (mediaObject.dtmfTimer) {
            clearTimeout(mediaObject.dtmfTimer)
          }
          if (mediaObject.localMediaStream) {
            JsSIP.Utils.closeMediaStream(mediaObject.localMediaStream)
          }
          if (mediaObject.oscillators) {
            Object.keys(mediaObject.oscillators).forEach(function (i) {
              var oscillator = mediaObject.oscillators[i]
              try {
                oscillator.oscillatorGain.disconnect()
              } catch (e) {}
              try {
                oscillator.oscillatorNode.stop()
              } catch (e) {}
              try {
                oscillator.oscillatorNode.disconnect()
              } catch (e) {}
            })
          }
          if (mediaObject.gainNode) {
            try {
              mediaObject.gainNode.disconnect()
            } catch (e) {}
          }
          if (mediaObject.sourceNode) {
            try {
              mediaObject.sourceNode.disconnect()
            } catch (e) {}
          }
          if (mediaObject.destinationNode) {
            try {
              mediaObject.destinationNode.disconnect()
            } catch (e) {}
          }
          if (mediaObject.analyser) {
            try {
              mediaObject.analyser.disconnect()
            } catch (e) {}
          }
        }
        delete this._sessionLocalMediaTable[sessionId]
      }
    },
    _getRid(sessionId) {
      var rid = ''
      var session

      session = this._sessionTable[sessionId]
      if (
        session &&
        session.incomingMessage &&
        session.incomingMessage.getHeader
      ) {
        rid = string(session.incomingMessage.getHeader('X-PBX-Session-Info'))
        rid = rid.split(';')
        rid = string(rid[1])
      }

      return rid
    },
    _checkSendInfoXUaEx(sessionId) {
      var i
      var self = this
      var session

      session = this._sessionTable[sessionId]
      if (
        session &&
        session.isConfirmed &&
        session.sendInfoXUaExTime < +new Date()
      ) {
        session.sendInfoXUaExTime = Number.MAX_VALUE
        if (!session.mustSendInfoXUaEx) {
          try {
            if (
              JSON.parse(session.membersCache).every(function (member) {
                return (
                  session.remoteUserOptionsTable[member.user] ||
                  self._videoClientUser === member.phone_id
                )
              })
            ) {
              return
            }
          } catch (e) {}
        }
        session.mustSendInfoXUaEx = false
        this._sendInfoXUaEx(sessionId, session.remoteUserOptionsTable, null, 0)
      }
    },
    _sendInfoXUaEx(sessionId, echo, withVideo, delay) {
      var session

      if (delay) {
        setTimeout(
          by(this, this._sendInfoXUaEx, [sessionId, echo, withVideo, 0]),
          delay,
        )
        return
      }
      session = this._sessionTable[sessionId]
      try {
        session.rtcSession.sendInfo('application/x-ua-ex', null, {
          extraHeaders: [
            'X-UA-EX: rtcinfo=' +
              encodeURIComponent(
                JSON.stringify({
                  user: string(
                    string(
                      session.incomingMessage &&
                        session.incomingMessage.getHeader &&
                        session.incomingMessage.getHeader('X-PBX-Session-Info'),
                    ).split(';')[3],
                  ),
                  withVideo:
                    typeof withVideo === 'boolean'
                      ? withVideo
                      : Boolean(session.withVideo),
                  echo,
                }),
              ) +
              ';' +
              session.exInfo,
          ],
        })
      } catch (e) {
        this._logger.log(
          'error',
          'session.rtcSession.sendInfo() failed: ' + stringifyError(e),
        )
      }
    },
    _putRemoteUserOptions(sessionId, xUaEx) {
      var exInfo = ''
      var myUser
      var result = false
      var rtcInfo = null
      var self = this
      var session
      var u
      var user
      var withVideo
      var xUaExEntries
      var xUaExRtcInfo = ''

      session = this._sessionTable[sessionId]
      if (session && xUaEx) {
        xUaExEntries = string(xUaEx).split(';')
        xUaExEntries.forEach(function (s) {
          if (s.substr(0, 'rtcinfo='.length) === 'rtcinfo=') {
            xUaExRtcInfo = s
          } else {
            if (exInfo !== '') {
              exInfo += ';'
            }
            exInfo += s
          }
        })
        if (xUaExRtcInfo) {
          try {
            rtcInfo = JSON.parse(
              decodeURIComponent(xUaExRtcInfo.substr('rtcinfo='.length)),
            )
          } catch (e) {
            this._logger.log(
              'warn',
              'Cannot decode ' + xUaExRtcInfo + ' : ' + e.message,
            )
          }
        }
        if (rtcInfo && rtcInfo.echo) {
          if (rtcInfo.echo === true) {
            this._sendInfoXUaEx(
              sessionId,
              false,
              null,
              Math.floor(Math.random() * 500) + 500,
            ) // reply to ver. < 2.0.12.254
          } else {
            myUser = string(
              string(
                session.incomingMessage &&
                  session.incomingMessage.getHeader &&
                  session.incomingMessage.getHeader('X-PBX-Session-Info'),
              ).split(';')[3],
            )
            if (
              !rtcInfo.echo[myUser] ||
              rtcInfo.echo[myUser].withVideo !== Boolean(session.withVideo) ||
              rtcInfo.echo[myUser].exInfo !== session.exInfo
            ) {
              session.sendInfoXUaExTime = +new Date()
              if (!rtcInfo.echo[myUser]) {
                try {
                  JSON.parse(session.membersCache).some(function (member) {
                    if (self._videoClientUser === member.phone_id) {
                      return true
                    } else if (!rtcInfo.echo[member.user]) {
                      session.sendInfoXUaExTime += 1000
                      return false
                    }
                  })
                } catch (e) {}
              }
              session.mustSendInfoXUaEx = true
            } else {
              session.mustSendInfoXUaEx = false
            }
            for (u in rtcInfo.echo) {
              if (
                u !== myUser &&
                rtcInfo.echo[u] &&
                !session.remoteUserOptionsTable[u]
              ) {
                session.remoteUserOptionsTable[u] = {
                  withVideo: Boolean(rtcInfo.echo[u].withVideo),
                  exInfo: string(rtcInfo.echo[u].exInfo),
                }
                result = true
              }
            }
          }
        }
        user = string(
          (rtcInfo && rtcInfo.user) ||
            (session.rtcSession &&
              session.rtcSession.remote_identity &&
              session.rtcSession.remote_identity.uri &&
              session.rtcSession.remote_identity.uri.user),
        )
        if (user) {
          withVideo = Boolean(rtcInfo && rtcInfo.withVideo)
          if (
            !session.remoteUserOptionsTable[user] ||
            session.remoteUserOptionsTable[user].withVideo !== withVideo ||
            session.remoteUserOptionsTable[user].exInfo !== exInfo
          ) {
            session.remoteUserOptionsTable[user] = {
              withVideo,
              exInfo,
            }
            result = true
          } else {
            // not changed
          }
        } else {
          this._logger.log('warn', 'Empty user: ' + xUaEx)
        }
      }
      return result
    },
    _keepAliveUaSocket() {
      if (this._socketKeepAlive && this._uaSocket) {
        this._uaSocket.send('')
        this._uaSocketKeepAliveTimer = setTimeout(
          by(this, this._keepAliveUaSocket),
          this._socketKeepAlive * 1000,
        )
      }
    },
    _keepAliveVuaSocket() {
      if (this._socketKeepAlive && this._vuaSocket) {
        this._vuaSocket.send('')
        this._vuaSocketKeepAliveTimer = setTimeout(
          by(this, this._keepAliveVuaSocket),
          this._socketKeepAlive * 1000,
        )
      }
    },

    /**
     * event listeners
     */
    _ua_connected(e) {
      this._uaSocket = e.socket
      if (!this._register) {
        this._ua_registered(e)
      }
      if (this._socketKeepAlive) {
        this._uaSocketKeepAliveTimer = setTimeout(
          by(this, this._keepAliveUaSocket),
          this._socketKeepAlive * 1000,
        )
      }
    },
    _ua_disconnected(e) {
      this._uaSocket = null
      clearTimeout(this._uaSocketKeepAliveTimer)
    },
    _ua_registered(e) {
      this._uaStarting = false
      if (this._vuaStarting) {
        try {
          this._vua.start()
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.start error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          )
          this._stopReasonInfo = {
            from: 'jssip',
            reason: e.message,
            response: null,
          }
          this.stopWebRTC(true)
        }
      } else {
        this._changePhoneStatus('started')
      }
    },
    _ua_unregistered(e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this._stopReasonInfo = {
          from: 'server',
          reason: string(data && data.cause),
          response: (data && data.response) || null,
        }
        setTimeout(by(this, this.stopWebRTC, [true]), 0)
        return
      }
      this._changePhoneStatus('stopped')
      this._ua = null
      this._user = ''
      this._videoClientUser = ''
    },
    _ua_registrationFailed(e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      this._logger.log(
        'warn',
        'UA.registrationFailed cause: ' + string(data && data.cause),
      )
      this._stopReasonInfo = {
        from: 'server',
        reason: string(data && data.cause),
        response: (data && data.response) || null,
      }
      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this.stopWebRTC(true)
      }
      this._changePhoneStatus('stopped')
      this._ua = null
      this._user = ''
      this._videoClientUser = ''
    },
    async _ua_newRTCSession(e) {
      var audio = false
      var data
      var options
      var rtcInfoJsonStr
      var session
      var sessionId
      var sessionStatus = ''
      var video = false

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      jssipRtcSessionHack(data && data.session, this)

      if (
        this._phoneStatus !== 'started' ||
        (!this.multiSession &&
          this._sessionTable[this._lastCreatedSessionId] &&
          this._sessionTable[this._lastCreatedSessionId].sessionStatus !==
            'terminated') ||
        (this.doNotDisturb && data.session.direction === 'incoming')
      ) {
        this._logger.log(
          'info',
          'Terminate session: phoneStatus: ' + this._phoneStatus,
        )
        if (data.session.direction === 'outgoing') {
          // outgoing
          this._disposeLocalMedia('outgoing')
          this._emitEvent('sessionRejected', {
            withVideo: Boolean(this._outgoingRtcInfo.withVideo),
            exInfo: string(this._outgoingRtcInfo.exInfo),
            rtcSession: data.session,
            incomingMessage: null,
          })
        } else {
          // incoming
          this._emitEvent('sessionRejected', {
            withVideo: Boolean(
              this._vua && this.defaultOptions && this.defaultOptions.withVideo,
            ),
            exInfo: string(this.defaultOptions && this.defaultOptions.exInfo),
            rtcSession: data.session,
            incomingMessage: data.request,
          })
        }
        // terminate
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0)
        // do not create session
        return
      }

      sessionId = string(++this._lastCreatedSessionId)
      sessionStatus = 'dialing'
      if (data.session.direction === 'outgoing') {
        if (this._sessionLocalMediaTable['outgoing']) {
          audio =
            this._sessionLocalMediaTable['outgoing'].mediaConstraints.audio
          video =
            this._sessionLocalMediaTable['outgoing'].mediaConstraints.video
          this._sessionLocalMediaTable[sessionId] =
            this._sessionLocalMediaTable['outgoing']
          delete this._sessionLocalMediaTable['outgoing']
        }
      } else {
        if (data.request.body) {
          audio = data.request.body.indexOf('m=audio') >= 0
          video = data.request.body.indexOf('m=video') >= 0
        }
      }
      session = this._sessionTable[sessionId] = {
        sessionId,
        sessionStatus,
        answeringStarted: false,
        audio: Boolean(audio),
        video: Boolean(video),
        withVideo:
          data.session.direction === 'outgoing'
            ? Boolean(this._outgoingRtcInfo.withVideo)
            : false,
        exInfo:
          data.session.direction === 'outgoing'
            ? string(this._outgoingRtcInfo.exInfo)
            : '',
        mainMuted: false,
        videoClientMuted: false,
        initialVolumePercent: null,
        rtcSession: data.session,
        incomingMessage:
          data.session.direction === 'outgoing' ? null : data.request,
        videoOptions: null,
        remoteUserOptionsTable: {},
        membersCache: '',
        sendInfoXUaExInterval: setInterval(
          by(this, this._checkSendInfoXUaEx, [sessionId]),
          1000,
        ),
        sendInfoXUaExTime: Number.MAX_VALUE,
        mustSendInfoXUaEx: false,
        isConfirmed: false,
      }
      this._sessionRemoteStreamsTable[sessionId] = []
      if (data.session.direction === 'incoming') {
        this._putRemoteUserOptions(sessionId, data.request.getHeader('X-UA-EX'))
      }

      // attach JsSIP.RTCSession event listeners
      data.session.on(
        'progress',
        by(this, this._rtcSession_progress, [sessionId]),
      )
      data.session.on(
        'accepted',
        by(this, this._rtcSession_accepted, [sessionId]),
      )
      data.session.on(
        'confirmed',
        by(this, this._rtcSession_confirmed, [sessionId]),
      )
      data.session.on(
        'notifiedTalk',
        by(this, this._rtcSession_notifiedTalk, [sessionId]),
      )
      data.session.on(
        'notifiedSessionInfo',
        by(this, this._rtcSession_notifiedSessionInfo, [sessionId]),
      )
      data.session.on(
        'newInfo',
        by(this, this._rtcSession_newInfo, [sessionId]),
      )
      data.session.on('failed', by(this, this._rtcSession_ended, [sessionId]))
      data.session.on('ended', by(this, this._rtcSession_ended, [sessionId]))
      data.session.on(
        'connecting',
        by(this, this._rtcSession_connecting, [sessionId]),
      )
      data.session.on(
        'icecandidate',
        by(this, this._rtcSession_icecandidate, [sessionId]),
      )
      data.session.on('sdp', by(this, this._rtcSession_sdp, [sessionId]))
      if (data.session.connection) {
        // outgoing
        data.session.connection.ontrack = by(this, this._rtcSession_ontrack, [
          sessionId,
        ])
        data.session.connection.onicegatheringstatechange = by(
          this,
          this._rtcSession_onicegatheringstatechange,
          [sessionId],
        )
        data.session.connection.oniceconnectionstatechange = by(
          this,
          this._rtcSession_oniceconnectionstatechange,
          [sessionId],
        )
      } else {
        // incoming
        data.session.on(
          'peerconnection',
          by(this, this._rtcSession_peerconnection, [sessionId]),
        )
      }

      if (data.session.direction === 'incoming') {
        if (this.defaultOptions && this.defaultOptions.withVideo) {
          if (this._vua) {
            session.withVideo = true
            session.videoOptions =
              clone(this.defaultOptions && this.defaultOptions.videoOptions) ||
              {}
          } else {
            this._logger.log('warn', 'Video client unavailable')
          }
        }
        if (this.defaultOptions && this.defaultOptions.exInfo) {
          session.exInfo = string(
            this.defaultOptions && this.defaultOptions.exInfo,
          )
        }

        if (this.eventTalk) {
          data.request.brExtraHeaders180 = 'Allow-Events: talk'
        }

        if (
          this.autoAnswer ||
          (this.ctiAutoAnswer &&
            string(data.request.getHeader('Call-Info')).indexOf(
              'answer-after=0',
            ) >= 0)
        ) {
          // auto answer

          if (session.withVideo) {
            setTimeout(by(this, this._tryVideoCall, [sessionId]), 0)
          }

          options =
            clone(
              this.defaultOptions &&
                this.defaultOptions.main &&
                this.defaultOptions.main.answer,
            ) || {}
          if (!options.mediaConstraints) {
            options.mediaConstraints = { audio: true, video: false }
          }
          if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
            options.pcConfig = clone(options.pcConfig) || {}
            options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout
          }
          if (!options.extraHeaders) {
            options.extraHeaders = []
          }
          rtcInfoJsonStr = JSON.stringify({
            user: string(
              string(
                session.incomingMessage &&
                  session.incomingMessage.getHeader &&
                  session.incomingMessage.getHeader('X-PBX-Session-Info'),
              ).split(';')[3],
            ),
            withVideo: session.withVideo,
          })
          options.extraHeaders = options.extraHeaders.concat(
            'X-UA-EX: rtcinfo=' +
              encodeURIComponent(rtcInfoJsonStr) +
              ';' +
              session.exInfo,
          )

          // wait timeout for audio recording service on android
          await new Promise(r => setTimeout(r, 500))

          // answer
          session.answeringStarted = true
          setTimeout(
            by(this, this._doAnswer, [
              sessionId,
              options,
              data.session,
              null,
              false,
              by(this, this._answerFailed, [
                {
                  sessionId,
                  target: null,
                  options,
                  client: 'main',
                },
              ]),
            ]),
            0,
          )
        }
      }

      this._emitEvent('sessionCreated', this.getSession(sessionId))
    },
    _vua_connected(e) {
      this._vuaSocket = e.socket
      if (!this._register) {
        this._vua_registered(e)
      }
      if (this._socketKeepAlive) {
        this._vuaSocketKeepAliveTimer = setTimeout(
          by(this, this._keepAliveVuaSocket),
          this._socketKeepAlive * 1000,
        )
      }
    },
    _vua_disconnected(e) {
      this._vuaSocket = null
      clearTimeout(this._vuaSocketKeepAliveTimer)
    },
    _vua_registered(e) {
      this._vuaStarting = false
      if (this._uaStarting) {
        try {
          this._ua.start()
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.start error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          )
          this._stopReasonInfo = {
            from: 'jssip',
            reason: e.message,
            response: null,
          }
          this.stopWebRTC(true)
        }
      } else {
        this._changePhoneStatus('started')
      }
    },
    _vua_unregistered(e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this._stopReasonInfo = {
          from: 'server',
          reason: string(data && data.cause),
          response: (data && data.response) || null,
        }
        setTimeout(by(this, this.stopWebRTC, [true]), 0)
        return
      }
      this._vua = null
    },
    _vua_registrationFailed(e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      this._logger.log('warn', 'UA.registrationFailed cause: ' + data.cause)
      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this._stopReasonInfo = {
          from: 'server',
          reason: string(data && data.cause),
          response: (data && data.response) || null,
        }
        this.stopWebRTC(true)
      }
      this._vua = null
    },
    _vua_newRTCSession(e, count) {
      var data
      var doAnswerFunc
      var i = 0
      var member
      var members
      var options
      var r
      var rid
      var self = this
      var sessionId
      var sid
      var videoClientSessionId

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      jssipRtcSessionHack(data && data.session, this)

      if (!data || !data.session || data.session.isEnded()) {
        // already ended
        this._logger.log('debug', 'Video client session already ended')
        return
      }

      if (this._phoneStatus !== 'started') {
        this._logger.log(
          'info',
          'Terminate video client session: phoneStatus: ' + this._phoneStatus,
        )
        if (data.session.direction === 'outgoing') {
          // outgoing
          this._disposeLocalMedia('outgoing')
        }
        // terminate
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0)
        // do not create video client session
        return
      }

      videoClientSessionId = 'v' + ++this._lastCreatedVideoClientSessionId

      // specify member and main session
      sessionId = ''
      rid = ''
      member = null
      for (sid in this._sessionTable) {
        if (this._sessionTable[sid].withVideo) {
          r = this._getRid(sid)
          members = (this._ridMembersTable[r] || {}).members || []
          for (i = 0; i < members.length; i++) {
            if (members[i].phone_id === data.session.remote_identity.uri.user) {
              member = members[i]
              break
            }
          }
          if (member) {
            sessionId = sid
            rid = r
            break
          }
        }
      }

      if (
        sessionId &&
        rid &&
        member &&
        data.session.direction === 'incoming' &&
        data.request.getHeader &&
        data.request.getHeader('X-REQUEST-VIDEO-CALL') === 'true'
      ) {
        // receive request video call (later id -> earlier id)

        // terminate this request session
        this._logger.log(
          'info',
          'Terminate video client session of X-REQUEST-VIDEO-CALL',
        )
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0)

        // try video call (earlier id -> later id)
        setTimeout(by(this, this._tryVideoCall, [sessionId]), 0)
      } else if (sessionId && rid && member) {
        // specify ok

        if (data.session.direction === 'outgoing') {
          // outgoing
          if (this._sessionLocalMediaTable['outgoing']) {
            this._sessionLocalMediaTable[videoClientSessionId] =
              this._sessionLocalMediaTable['outgoing']
            delete this._sessionLocalMediaTable['outgoing']
          }
        }

        // create video client session
        if (!this._ridVideoClientSessionsTable[rid]) {
          this._ridVideoClientSessionsTable[rid] = {}
        }
        this._ridVideoClientSessionsTable[rid][videoClientSessionId] = {
          member,
          rtcSession: data.session,
          isFirstSession:
            Object.keys(this._ridVideoClientSessionsTable[rid]).length === 0,
          outgoingRequestVideoCall:
            data.session.direction === 'outgoing' &&
            data.request &&
            data.request.getHeader &&
            data.request.getHeader('X-REQUEST-VIDEO-CALL') === 'true',
        }
        this._sessionRemoteStreamsTable[videoClientSessionId] = []
        member.videoClientSessionId = videoClientSessionId

        // attach JsSIP.RTCSession event listeners
        data.session.on(
          'accepted',
          by(this, this._videoClientRtcSession_accepted, [
            videoClientSessionId,
            sessionId,
          ]),
        )
        data.session.on(
          'failed',
          by(this, this._videoClientRtcSession_ended, [
            videoClientSessionId,
            sessionId,
          ]),
        )
        data.session.on(
          'ended',
          by(this, this._videoClientRtcSession_ended, [
            videoClientSessionId,
            sessionId,
          ]),
        )
        data.session.on(
          'connecting',
          by(this, this._rtcSession_connecting, [videoClientSessionId]),
        )
        data.session.on(
          'icecandidate',
          by(this, this._rtcSession_icecandidate, [videoClientSessionId]),
        )
        data.session.on(
          'sdp',
          by(this, this._rtcSession_sdp, [videoClientSessionId]),
        )
        if (data.session.connection) {
          // outgoing
          data.session.connection.ontrack = by(
            this,
            this._videoClientRtcSession_ontrack,
            [videoClientSessionId, sessionId],
          )
          data.session.connection.onicegatheringstatechange = by(
            this,
            this._videoClientRtcSession_onicegatheringstatechange,
            [videoClientSessionId, sessionId],
          )
          data.session.connection.oniceconnectionstatechange = by(
            this,
            this._videoClientRtcSession_oniceconnectionstatechange,
            [videoClientSessionId, sessionId],
          )
        } else {
          // incoming
          data.session.on(
            'peerconnection',
            by(this, this._videoClientRtcSession_peerconnection, [
              videoClientSessionId,
              sessionId,
            ]),
          )
        }

        if (data.session.direction === 'incoming') {
          // answer
          options =
            clone(
              this._sessionTable[sessionId].videoOptions &&
                this._sessionTable[sessionId].videoOptions.answer,
            ) || {}
          if (!options.mediaConstraints) {
            options.mediaConstraints = { audio: false, video: true }
          }
          if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
            options.pcConfig = clone(options.pcConfig) || {}
            options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout
          }
          doAnswerFunc = function () {
            var creatingLocalMedia = false
            var isFirstSession = false
            var sourceSessionId = null
            if (!self._sessionTable[sessionId]) {
              self._logger.log(
                'info',
                'Cannot answer video session (main session terminated)',
              )
              return
            }
            if (!data || !data.session || data.session.status !== 4) {
              self._logger.log(
                'info',
                'Cannot answer video session (video session status: ' +
                  (data && data.session && data.session.status) +
                  ')',
              )
              return
            }
            if (
              self._sessionTable[sessionId].videoOptions &&
              self._sessionTable[sessionId].videoOptions.shareStream
            ) {
              sourceSessionId =
                (self._ridVideoClientSessionsTable[rid] &&
                  Object.keys(self._ridVideoClientSessionsTable[rid])
                    .filter(function (vcsid) {
                      if (vcsid === videoClientSessionId) {
                        isFirstSession =
                          self._ridVideoClientSessionsTable[rid][vcsid] &&
                          self._ridVideoClientSessionsTable[rid][vcsid]
                            .isFirstSession
                        return false
                      }
                      if (
                        self._ridVideoClientSessionsTable[rid][vcsid] &&
                        self._ridVideoClientSessionsTable[rid][vcsid]
                          .outgoingRequestVideoCall
                      ) {
                        return false
                      }
                      if (!self._sessionLocalMediaTable[vcsid]) {
                        creatingLocalMedia = true
                        return false
                      }
                      return true
                    })
                    .pop()) ||
                null
              if (!sourceSessionId && !isFirstSession && creatingLocalMedia) {
                // wait for creating previous local media
                self._logger.log(
                  'debug',
                  'Waiting for creating previous local media...',
                )
                setTimeout(doAnswerFunc, 1000)
                return
              }
              if (self._gettingUserMedia) {
                // wait for getting another local user media
                self._logger.log(
                  'debug',
                  'Waiting for creating another local user media...',
                )
                setTimeout(doAnswerFunc, 1000)
                return
              }
            }
            self._doAnswer(
              videoClientSessionId,
              options,
              data.session,
              sourceSessionId,
              self._sessionTable[sessionId].videoOptions.screenCapture,
              by(self, self._answerFailed, [
                {
                  sessionId,
                  target: null,
                  options,
                  client: 'video',
                },
              ]),
            )
          }
          setTimeout(doAnswerFunc, 0)
        }
      } else {
        // cannot specify member or main session

        if (data.session.direction === 'outgoing') {
          // outgoing
          this._disposeLocalMedia('outgoing')
        } else {
          // incoming, but informations (session, rid, members) have not been prepared
          count = count || 0
          if (!count) {
            // first try
            // wait and retry
            setTimeout(by(this, this._vua_newRTCSession, [e, count + 1]), 1000)
            return
          } else {
            // retry
            // to terminate
          }
        }

        // terminate
        this._logger.log(
          'warn',
          'Terminate video client session (cannot specify member or main session)',
        )
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0)
        // do not create video client session
        return
      }
    },
    _vua_newNotify(e) {
      var body2 = []
      var data
      var i = 0
      var me = {}
      var members = []
      var member2 = []
      var rid = ''
      var sessionId

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      if (!data) {
        this._logger.log('warn', 'newNotify data empty')
        return
      }
      if (!data.request) {
        this._logger.log('warn', 'newNotify request empty')
        return
      }
      if (data.request.getHeader('Event') !== 'x-video-client') {
        this._logger.log(
          'warn',
          'newNotify invalid header Event: ' + data.request.getHeader('Event'),
        )
        return
      }
      if (!data.request.body) {
        this._logger.log('warn', 'newNotify body empty')
        return
      }

      // <rid>#<user 1>|<phone_id 1>|<talker_id 1>|<talker_attr 1>|<talker_hold 1>#<user 2>|<phone_id 2>|<talker_id 2>|<talker_attr 2>|<talker_hold 2>
      body2 = data.request.body.split('#')
      rid = body2[0]
      if (!rid) {
        this._logger.log('warn', 'newNotify rid empty')
        return
      }
      me = {}
      members = []
      for (i = 1; i < body2.length; i++) {
        member2 = body2[i].split('|')
        members.push({
          user: member2[0] || '',
          phone_id: member2[1] || '',
          talker_id: member2[2] || '',
          talker_attr: member2[3] || '',
          talker_hold: member2[4] || '',
        })
        if (this._videoClientUser === member2[1]) {
          me = members[members.length - 1]
        }
      }

      this._ridMembersTable[rid] = {
        members: members.sort(function (m1, m2) {
          return m1.phone_id < m2.phone_id
            ? -1
            : m1.phone_id > m2.phone_id
              ? 1
              : 0
        }),
        me,
      }

      for (sessionId in this._sessionTable) {
        if (this._getRid(sessionId) === rid) {
          this._tryVideoCall(sessionId)
          break
        }
      }
    },
    _rtcSession_progress(sessionId, e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      this._sessionTable[sessionId].sessionStatus = 'progress'
      if (data && data.response) {
        this._sessionTable[sessionId].incomingMessage = data.response
        if (
          this._putRemoteUserOptions(
            sessionId,
            data.response.getHeader('X-UA-EX'),
          )
        ) {
          this._emitEvent(
            'remoteUserOptionsChanged',
            this.getSession(sessionId),
          )
        }
        this._tryVideoCall(sessionId)
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
    },
    _rtcSession_accepted(sessionId, e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      this._sessionTable[sessionId].sessionStatus = 'connected'
      if (data && data.response) {
        if (
          this._sessionTable[sessionId].incomingMessage &&
          this._sessionTable[sessionId].incomingMessage.method === 'NOTIFY' &&
          this._sessionTable[sessionId].incomingMessage.event &&
          this._sessionTable[sessionId].incomingMessage.event.event ===
            'session-info'
        ) {
          this._logger.log(
            'info',
            'incomingMessage has already been notified by NOTIFY with Event: session-info',
          )
        } else {
          this._sessionTable[sessionId].incomingMessage = data.response
        }
        if (
          this._putRemoteUserOptions(
            sessionId,
            data.response.getHeader('X-UA-EX'),
          )
        ) {
          this._emitEvent(
            'remoteUserOptionsChanged',
            this.getSession(sessionId),
          )
        }
        this._tryVideoCall(sessionId)
      }
      if (
        this._sessionTable[sessionId].mainMuted &&
        this._sessionTable[sessionId].rtcSession &&
        this._sessionTable[sessionId].rtcSession.isEstablished()
      ) {
        this._sessionTable[sessionId].rtcSession.mute({
          audio: true,
          video: true,
        })
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
    },
    _rtcSession_confirmed(sessionId, e) {
      if (this && this._sessionTable && this._sessionTable[sessionId]) {
        this._sessionTable[sessionId].isConfirmed = true
      }
    },
    _rtcSession_notifiedTalk(sessionId, e) {
      var data
      var options
      var rtcInfoJsonStr
      var session

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      if (this.eventTalk) {
        session = this._sessionTable[sessionId]
        if (
          session &&
          session.sessionStatus === 'progress' &&
          !session.answeringStarted
        ) {
          // auto answer

          if (session.withVideo) {
            setTimeout(by(this, this._tryVideoCall, [sessionId]), 0)
          }

          options =
            clone(
              this.defaultOptions &&
                this.defaultOptions.main &&
                this.defaultOptions.main.answer,
            ) || {}
          if (!options.mediaConstraints) {
            options.mediaConstraints = { audio: true, video: false }
          }
          if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
            options.pcConfig = clone(options.pcConfig) || {}
            options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout
          }
          if (!options.extraHeaders) {
            options.extraHeaders = []
          }
          rtcInfoJsonStr = JSON.stringify({
            user: string(
              string(
                session.incomingMessage &&
                  session.incomingMessage.getHeader &&
                  session.incomingMessage.getHeader('X-PBX-Session-Info'),
              ).split(';')[3],
            ),
            withVideo: session.withVideo,
          })
          options.extraHeaders = options.extraHeaders.concat(
            'X-UA-EX: rtcinfo=' +
              encodeURIComponent(rtcInfoJsonStr) +
              ';' +
              session.exInfo,
          )

          // answer
          session.answeringStarted = true
          this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
          setTimeout(
            by(this, this._doAnswer, [
              sessionId,
              options,
              session.rtcSession,
              null,
              false,
              by(this, this._answerFailed, [
                {
                  sessionId,
                  target: null,
                  options,
                  client: 'main',
                },
              ]),
            ]),
            0,
          )

          // response for NOTIFY
          if (data.request) {
            data.request.brReply200 = true
          }
        }
      }
    },
    _rtcSession_notifiedSessionInfo(sessionId, e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      if (data && data.request) {
        this._sessionTable[sessionId].incomingMessage = data.request
        this._tryVideoCall(sessionId)
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
    },
    _rtcSession_newInfo(sessionId, e) {
      var data

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      if (data && data.request) {
        if (
          this._putRemoteUserOptions(
            sessionId,
            data.request.getHeader('X-UA-EX'),
          )
        ) {
          this._emitEvent(
            'remoteUserOptionsChanged',
            this.getSession(sessionId),
          )
        }
      }
    },
    _rtcSession_ended(sessionId, e) {
      var data
      var rid = ''
      var session
      var videoClientSessionId

      data = e.data || e // jssip ~0.5: e.data, jssip 0.6~: e

      rid = this._getRid(sessionId)
      if (rid) {
        if (this._ridVideoClientSessionsTable[rid]) {
          for (videoClientSessionId in this._ridVideoClientSessionsTable[rid]) {
            setTimeout(
              by(this, this._terminateRtcSession, [
                this._ridVideoClientSessionsTable[rid][videoClientSessionId]
                  .rtcSession,
              ]),
              0,
            )
            this._videoClientRtcSession_ended(videoClientSessionId, sessionId)
          }
        }
        if (this._ridMembersTable[rid]) {
          delete this._ridMembersTable[rid]
        }
      }

      this._sessionTable[sessionId].sessionStatus = 'terminated'
      if (data && data.message) {
        this._sessionTable[sessionId].incomingMessage = data.message
      }
      session = this.getSession(sessionId)

      clearInterval(this._sessionTable[sessionId].sendInfoXUaExInterval)
      delete this._sessionTable[sessionId]
      this._lastSessionEndTime = +new Date()
      if (
        this._sessionIceCandidateInfoTable[sessionId] &&
        this._sessionIceCandidateInfoTable[sessionId].gatheringTimer
      ) {
        clearTimeout(
          this._sessionIceCandidateInfoTable[sessionId].gatheringTimer,
        )
      }
      delete this._sessionIceCandidateInfoTable[sessionId]
      delete this._sessionRemoteStreamsTable[sessionId]
      this._disposeLocalMedia(sessionId)
      this._emitEvent('sessionStatusChanged', session)
    },
    _rtcSession_connecting(sessionId, e) {
      // start ice candidate gathering timeout timer
      this._sessionIceCandidateInfoTable[sessionId] = {}
      if (this.iceCandidateGatheringTimeout >= 0) {
        this._sessionIceCandidateInfoTable[sessionId].gatheringTimer =
          setTimeout(
            by(this, this._iceCandidateGatheringTimedOut, [
              this._sessionIceCandidateInfoTable[sessionId],
            ]),
            this.iceCandidateGatheringTimeout,
          )
      }
    },
    _rtcSession_icecandidate(sessionId, e) {
      var candidate
      var data

      data = e
      candidate = string(data && data.candidate && data.candidate.candidate)
      this._logger.log(
        'debug',
        'onicecandidate sessionId: ' + sessionId + ', candidate: ' + candidate,
      )
      if (!this._sessionIceCandidateInfoTable[sessionId]) {
        this._sessionIceCandidateInfoTable[sessionId] = {}
      }
      if (candidate) {
        if (!this._sessionIceCandidateInfoTable[sessionId].icecandidates) {
          this._sessionIceCandidateInfoTable[sessionId].icecandidates = []
        }
        this._sessionIceCandidateInfoTable[sessionId].icecandidates.push(
          candidate,
        )
      }
      if (data && data.ready) {
        this._sessionIceCandidateInfoTable[sessionId].onGatheringTimedOut =
          data.ready
      }
    },
    _rtcSession_sdp(sessionId, e) {
      var candidate
      var data
      var i
      var indexOfA
      var indexOfM
      var modified

      data = e
      this._logger.log(
        'debug',
        'onsdp sessionId: ' +
          sessionId +
          ', originator: ' +
          (data &&
            data.originator + ', type: ' + data.type + ', sdp: ' + data.sdp),
      )
      if (data && data.originator === 'local' && typeof data.sdp === 'string') {
        modified = false
        for (
          i =
            (
              (this._sessionIceCandidateInfoTable[sessionId] &&
                this._sessionIceCandidateInfoTable[sessionId].icecandidates) ||
              []
            ).length - 1;
          i >= 0;
          i--
        ) {
          if (
            (candidate = string(
              this._sessionIceCandidateInfoTable[sessionId].icecandidates[i],
            )) &&
            -1 ===
              data.sdp.indexOf(
                'a=' + candidate.split(' ')[0] + ' ' + candidate.split(' ')[1],
              ) &&
            -1 !== (indexOfM = data.sdp.indexOf('m=')) &&
            -1 !== (indexOfA = data.sdp.indexOf('a=', indexOfM))
          ) {
            data.sdp =
              data.sdp.substring(0, indexOfA) +
              'a=' +
              candidate +
              '\r\n' +
              data.sdp.substring(indexOfA)
            modified = true
          }
        }
        if (modified) {
          this._logger.log('info', 'new sdp: ' + data.sdp)
        }
        if (
          this._sessionIceCandidateInfoTable[sessionId] &&
          this._sessionIceCandidateInfoTable[sessionId].gatheringTimer
        ) {
          clearTimeout(
            this._sessionIceCandidateInfoTable[sessionId].gatheringTimer,
          )
        }
      }
    },
    _rtcSession_ontrack(sessionId, e) {
      var index
      var stream

      stream = e.streams && e.streams[0]
      if (stream) {
        if (this._sessionRemoteStreamsTable[sessionId]) {
          index = this._sessionRemoteStreamsTable[sessionId].indexOf(stream)
          if (index === -1) {
            this._sessionRemoteStreamsTable[sessionId].push(stream)
            this._emitEvent('sessionStatusChanged', this.getSession(sessionId))
          } else {
            this._logger.log(
              'debug',
              '_rtcSession_ontrack occurred but stream already exists',
            )
          }
        } else {
          this._logger.log(
            'warn',
            '_rtcSession_ontrack occurred but _sessionRemoteStreamsTable[' +
              sessionId +
              '] is not defined',
          )
        }
      } else {
        this._logger.log(
          'warn',
          '_rtcSession_ontrack occurred with invalid e.streams: ' + e.streams,
        )
      }
    },
    _rtcSession_onicegatheringstatechange(sessionId, e) {
      this._emitEvent('icegatheringstatechange', {
        iceGatheringState: e && e.target && e.target.iceGatheringState,
        sessionId: string(sessionId),
        videoClientSessionId: null,
        connection: e && e.target,
      })
    },
    _rtcSession_oniceconnectionstatechange(sessionId, e) {
      this._emitEvent('iceconnectionstatechange', {
        iceConnectionState: e && e.target && e.target.iceConnectionState,
        sessionId: string(sessionId),
        videoClientSessionId: null,
        connection: e && e.target,
      })
    },
    _rtcSession_peerconnection(sessionId, e) {
      if (e.peerconnection) {
        e.peerconnection.ontrack = by(this, this._rtcSession_ontrack, [
          sessionId,
        ])
        e.peerconnection.onicegatheringstatechange = by(
          this,
          this._rtcSession_onicegatheringstatechange,
          [sessionId],
        )
        e.peerconnection.oniceconnectionstatechange = by(
          this,
          this._rtcSession_oniceconnectionstatechange,
          [sessionId],
        )
      }
    },
    _rtcSession_responseAfterMakeCallWithVideo(self, videoOptions, orgFunc, e) {
      // this: RTCSession
      var rtcSession = this
      var session
      var sessionId

      // set videoOptions to session
      for (sessionId in self._sessionTable) {
        session = self._sessionTable[sessionId]
        if (session.rtcSession === rtcSession) {
          if (!session.videoOptions) {
            session.videoOptions = videoOptions
            // make video call when members (phone_ids) have been notified
            self._tryVideoCall(sessionId)
          }
        }
      }

      if (orgFunc) {
        orgFunc.call(this, e)
      }
    },
    _videoClientRtcSession_accepted(videoClientSessionId, sessionId) {
      var rid

      rid = this._getRid(sessionId)
      if (
        this._sessionTable[sessionId] &&
        this._sessionTable[sessionId].videoClientMuted &&
        rid &&
        this._ridVideoClientSessionsTable[rid] &&
        this._ridVideoClientSessionsTable[rid][videoClientSessionId] &&
        this._ridVideoClientSessionsTable[rid][videoClientSessionId]
          .rtcSession &&
        this._ridVideoClientSessionsTable[rid][
          videoClientSessionId
        ].rtcSession.isEstablished()
      ) {
        this._ridVideoClientSessionsTable[rid][
          videoClientSessionId
        ].rtcSession.mute({ audio: true, video: true })
      }
    },
    _videoClientRtcSession_ended(videoClientSessionId, sessionId) {
      var r

      for (r in this._ridVideoClientSessionsTable) {
        if (this._ridVideoClientSessionsTable[r][videoClientSessionId]) {
          delete this._ridVideoClientSessionsTable[r][videoClientSessionId]
          if (Object.keys(this._ridVideoClientSessionsTable[r]).length === 0) {
            delete this._ridVideoClientSessionsTable[r]
          }
          break
        }
      }
      if (
        this._sessionIceCandidateInfoTable[videoClientSessionId] &&
        this._sessionIceCandidateInfoTable[videoClientSessionId].gatheringTimer
      ) {
        clearTimeout(
          this._sessionIceCandidateInfoTable[videoClientSessionId]
            .gatheringTimer,
        )
      }
      delete this._sessionIceCandidateInfoTable[videoClientSessionId]
      delete this._sessionRemoteStreamsTable[videoClientSessionId]
      this._disposeLocalMedia(videoClientSessionId)

      if (this._sessionTable[sessionId]) {
        this._emitEvent('videoClientSessionEnded', {
          sessionId: string(sessionId),
          videoClientSessionId: string(videoClientSessionId),
        })
      }
    },
    _videoClientRtcSession_ontrack(videoClientSessionId, sessionId, e) {
      var index
      var stream

      stream = e.streams && e.streams[0]
      if (stream) {
        if (this._sessionRemoteStreamsTable[videoClientSessionId]) {
          if (this._sessionTable[sessionId]) {
            index =
              this._sessionRemoteStreamsTable[videoClientSessionId].indexOf(
                stream,
              )
            if (index === -1) {
              this._sessionRemoteStreamsTable[videoClientSessionId].push(stream)

              this._emitEvent('videoClientSessionCreated', {
                sessionId: string(sessionId),
                videoClientSessionId: string(videoClientSessionId),
              })
            } else {
              this._logger.log(
                'debug',
                '_videoClientRtcSession_ontrack occurred but stream already exists',
              )
            }
          } else {
            this._logger.log(
              'warn',
              '_videoClientRtcSession_ontrack occurred but _sessionTable[' +
                sessionId +
                '] is not defined',
            )
          }
        } else {
          this._logger.log(
            'warn',
            '_videoClientRtcSession_ontrack occurred but _sessionRemoteStreamsTable[' +
              videoClientSessionId +
              '] is not defined',
          )
        }
      } else {
        this._logger.log(
          'warn',
          '_videoClientRtcSession_ontrack occurred with invalid e.streams: ' +
            e.streams,
        )
      }
    },
    _videoClientRtcSession_onicegatheringstatechange(
      videoClientSessionId,
      sessionId,
      e,
    ) {
      this._emitEvent('icegatheringstatechange', {
        iceGatheringState: e && e.target && e.target.iceGatheringState,
        sessionId: string(sessionId),
        videoClientSessionId: string(videoClientSessionId),
        connection: e && e.target,
      })
    },
    _videoClientRtcSession_oniceconnectionstatechange(
      videoClientSessionId,
      sessionId,
      e,
    ) {
      this._emitEvent('iceconnectionstatechange', {
        iceConnectionState: e && e.target && e.target.iceConnectionState,
        sessionId: string(sessionId),
        videoClientSessionId: string(videoClientSessionId),
        connection: e && e.target,
      })
    },
    _videoClientRtcSession_peerconnection(videoClientSessionId, sessionId, e) {
      if (e.peerconnection) {
        e.peerconnection.ontrack = by(
          this,
          this._videoClientRtcSession_ontrack,
          [videoClientSessionId, sessionId],
        )
        e.peerconnection.onicegatheringstatechange = by(
          this,
          this._videoClientRtcSession_onicegatheringstatechange,
          [videoClientSessionId, sessionId],
        )
        e.peerconnection.oniceconnectionstatechange = by(
          this,
          this._videoClientRtcSession_oniceconnectionstatechange,
          [videoClientSessionId, sessionId],
        )
      }
    },

    END_OF_PROTOTYPE: null,
  }

  /**
   * class Brekeke.WebrtcClient.Logger
   */
  Logger = function (level, func, withStackTrace) {
    var self = this

    /**
     * fields
     */
    this._levelValue =
      level in this.LEVEL_VALUES
        ? this.LEVEL_VALUES[level]
        : this.LEVEL_VALUES['log']
    this._logFunction = func
    this._withStackTrace =
      withStackTrace === true
        ? {
            fatal: true,
            error: true,
            warn: true,
            info: true,
            debug: true,
            trace: true,
          }
        : !withStackTrace
          ? {
              fatal: true,
              error: true,
              warn: true,
              info: false,
              debug: false,
              trace: true,
            }
          : withStackTrace
    this._stackTraceHeaderLength = -2

    // trial logging to initialize stackTraceHeaderLength
    ;(function TRIAL_LOGGING() {
      self.log('trial', 'logger initialized (' + self._levelValue + ')')
    })()
  }
  /**
   * Logger prototype
   */
  Logger.prototype = {
    /**
     * Constants
     */
    LEVEL_VALUES: {
      none: 0,
      trial: 1,
      fatal: 10,
      error: 20,
      warn: 30,
      log: 40,
      info: 40,
      debug: 50,
      trace: 60,
      all: 60,
    },

    /**
     * function setLoggerLevel
     */
    setLoggerLevel(level) {
      this._levelValue =
        level in this.LEVEL_VALUES
          ? this.LEVEL_VALUES[level]
          : this.LEVEL_VALUES['log']
    },

    /**
     * function setLogFunction
     */
    setLogFunction(func) {
      this._logFunction = func
    },

    /**
     * function log
     */
    log(level, content) {
      var stackTrace = ''

      try {
        if (this.LEVEL_VALUES[level] <= this._levelValue) {
          if (this._withStackTrace[level] || level === 'trial') {
            // get stack trace
            try {
              throw new Error()
            } catch (e) {
              stackTrace = String(e.stack)
            }
            if (this._stackTraceHeaderLength === -2) {
              // uninitialized
              // trial logging to initialize stackTraceHeaderLength
              this._stackTraceHeaderLength = stackTrace.indexOf('TRIAL_LOGGING')
            }
            if (this._stackTraceHeaderLength >= 0) {
              // OK
              // print stack trace from caller (cut header)
              stackTrace =
                ' @ ' + stackTrace.substr(this._stackTraceHeaderLength)
            } else {
              // failed to initialize stackTraceHeaderLength
              // print full stack trace
              stackTrace = ' : ' + stackTrace
            }
          }
          if (this._logFunction) {
            if (!this._logFunction(level, content, stackTrace)) {
              this._logFunctionDefault(level, content, stackTrace)
            }
          } else {
            this._logFunctionDefault(level, content, stackTrace)
          }
        }
      } catch (e) {}
    },

    /**
     * private functions
     */
    _logFunctionDefault(level, content, stackTrace) {
      var func

      if (console) {
        if (level === 'fatal') {
          func = console.error || console.log
        } else if (level === 'error') {
          func = console.error || console.log
        } else if (level === 'warn') {
          func = console.warn || console.log
        } else if (level === 'info') {
          func = console.info || console.log
        } else if (level === 'debug') {
          func = console.log || console.debug
        } else if (level === 'trace') {
          func = console.debug || console.log
        } else {
          func = console.log
        }
        if (func) {
          func.call(
            console,
            new Date() + '[' + level + '] ' + content + stackTrace,
          )
          if (typeof content === 'object') {
            console.dir(content)
          }
        }
      }
    },

    END_OF_PROTOTYPE: null,
  }

  /**
   * jssipHack function
   */
  jssipHack = (function () {
    var orig = null
    return function jssipHack() {
      if (orig || typeof JsSIP === 'undefined') {
        return
      }
      orig = {}
      if (JsSIP.Utils && JsSIP.Utils.escapeUser) {
        orig.Utils_escapeUser = JsSIP.Utils.escapeUser
        JsSIP.Utils.escapeUser = function (user) {
          return string(orig.Utils_escapeUser(user)).replace(/%3D/gi, '=')
        }
      }
      if (JsSIP.UA && JsSIP.UA.prototype && JsSIP.UA.prototype.receiveRequest) {
        orig.UA_receiveRequest = JsSIP.UA.prototype.receiveRequest
        JsSIP.UA.prototype.receiveRequest = function (request) {
          jssipIncomingRequestHack(request)
          orig.UA_receiveRequest.apply(this, arguments)
          if (
            request &&
            !request.to_tag &&
            request.method === 'NOTIFY' &&
            this.listeners('newNotify').length
          ) {
            this.emit('newNotify', { request })
          }
        }
      }
    }
  })()

  /**
   * jssipRtcSessionHack function
   */
  jssipRtcSessionHack = (function () {
    var orig = null
    return function jssipRtcSessionHack(rtcSession, phone) {
      var proto

      if (
        orig ||
        typeof rtcSession === 'undefined' ||
        typeof rtcSession.receiveRequest !== 'function' ||
        typeof rtcSession._receiveNotify !== 'function'
      ) {
        return
      }
      orig = {}
      proto = Object.getPrototypeOf(rtcSession)
      if (proto && proto.receiveRequest) {
        orig.receiveRequest = proto.receiveRequest
        proto.receiveRequest = function (request) {
          if (
            request &&
            request.method === 'INFO' &&
            request.headers &&
            request.headers['X-Ua-Ex'] &&
            !request.headers['Content-Type']
          ) {
            request.headers['Content-Type'] = [{ raw: 'application/x-ua-ex' }]
          }
          if (
            request &&
            request.method === 'NOTIFY' &&
            request.event &&
            request.event.event === 'talk' &&
            this.listeners('notifiedTalk').length
          ) {
            this.emit('notifiedTalk', {
              originator: 'remote',
              request,
            })
          }
          orig.receiveRequest.apply(this, arguments)
          if (
            phone &&
            phone.HANDLE_BYE_IN_STATUS_WAITING_FOR_ACK &&
            request &&
            request.method === 'BYE' &&
            this._status === 6 /* C.STATUS_WAITING_FOR_ACK */
          ) {
            this._ended('remote', request, 'Terminated')
          }
        }
      }
      if (proto && proto._receiveNotify) {
        orig._receiveNotify = proto._receiveNotify
        proto._receiveNotify = function (request) {
          if (
            request &&
            request.event &&
            request.event.event === 'session-info' &&
            this.listeners('notifiedSessionInfo').length
          ) {
            this.emit('notifiedSessionInfo', {
              originator: 'remote',
              request,
            })
            request.reply(200)
            return
          }
          orig._receiveNotify.apply(this, arguments)
        }
      }
    }
  })()

  /**
   * jssipIncomingRequestHack function
   */
  jssipIncomingRequestHack = (function () {
    var orig = null
    return function jssipIncomingRequestHack(incomingRequest) {
      var proto

      if (
        orig ||
        typeof incomingRequest === 'undefined' ||
        typeof incomingRequest.reply !== 'function'
      ) {
        return
      }
      orig = {}
      proto = Object.getPrototypeOf(incomingRequest)
      if (proto && proto.reply) {
        orig.reply = proto.reply
        proto.reply = function (
          code,
          reason,
          extraHeaders,
          body,
          onSuccess,
          onFailure,
        ) {
          if (
            this &&
            !this.to_tag &&
            this.method === 'NOTIFY' &&
            this.event &&
            this.event.event === 'x-video-client' &&
            code === 405
          ) {
            orig.reply.apply(
              this,
              [200].concat(Array.prototype.slice.call(arguments, 1)),
            )
          } else if (
            this &&
            this.method === 'NOTIFY' &&
            this.event &&
            this.event.event === 'talk' &&
            this.brReply200 &&
            code === 403
          ) {
            orig.reply.apply(
              this,
              [200, ''].concat(Array.prototype.slice.call(arguments, 2)),
            )
          } else if (
            this &&
            this.method === 'INVITE' &&
            this.brExtraHeaders180 &&
            code === 180
          ) {
            orig.reply.apply(
              this,
              [
                code,
                reason,
                [].concat(extraHeaders || []).concat(this.brExtraHeaders180),
              ].concat(Array.prototype.slice.call(arguments, 3)),
            )
          } else {
            orig.reply.apply(this, arguments)
          }
        }
      }
    }
  })()

  /**
   * utility functions
   */
  by = function (thisArg, func, argsArray) {
    // return function
    return function () {
      // if argsArray is not given, returned function calls func with arguments of itself
      return func.apply(
        thisArg || this,
        (argsArray || []).concat(Array.prototype.slice.call(arguments)),
      )
    }
  }
  clone = function (object) {
    var key
    var returnObject

    if (object && typeof object === 'object') {
      // memberwise clone (shallow copy)
      returnObject = {}
      for (key in object) {
        returnObject[key] = object[key]
      }
      return returnObject
    } else {
      return object
    }
  }
  stringify = function (object) {
    var key
    var returnString

    if (object && typeof object === 'object') {
      returnString = ''
      for (key in object) {
        returnString +=
          string(key) +
          ': ' +
          (object[key] && typeof object[key] === 'object'
            ? '{ ... }'
            : object[key]) +
          ', '
      }
      if (returnString.length > 2) {
        returnString = returnString.substr(0, returnString.length - 2)
      }
      return returnString
    } else {
      return string(object)
    }
  }
  stringifyError = function (object) {
    var key
    var returnString

    if (object && typeof object === 'object') {
      returnString = ''
      if (typeof object.toString === 'function') {
        returnString = object.toString()
      }
      if (returnString) {
        return returnString
      }
      returnString = ''
      for (key in object) {
        returnString += string(key) + ': ' + string(object[key]) + ', '
      }
      if (returnString.length > 2) {
        returnString = returnString.substr(0, returnString.length - 2)
      }
      return returnString
    } else {
      return string(object)
    }
  }
  int = function (value) {
    return parseInt(value, 10) || 0
  }
  string = function (value) {
    return String(value || value === 0 || value === false ? value : '')
  }

  // publicize Brekeke.WebrtcClient.Phone
  WebrtcClient.Phone = Phone
  // publicize Brekeke.WebrtcClient.Logger
  WebrtcClient.Logger = Logger
})(Brekeke.WebrtcClient)
