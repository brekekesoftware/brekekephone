/**
 * webrtcclient.js
 * 2.0.1.189
 *
 * require jssip/jssip-3.2.15.js
 */

if (!window.Brekeke) {
  window.Brekeke = {};
}

/**
 * instance Brekeke.WebrtcClient
 */
if (!window.Brekeke.WebrtcClient) {
  window.Brekeke.WebrtcClient = {};
}

(function(WebrtcClient) {
  var Phone,
    Logger,
    jssipHack,
    jssipRtcSessionHack,
    jssipIncomingRequestHack,
    by,
    clone,
    stringifyError,
    int,
    string;

  /**
   * class Brekeke.WebrtcClient.Phone
   */
  Phone = function(options) {
    var d;

    if (typeof JsSIP === 'undefined' || !JsSIP.Utils || !JsSIP.UA) {
      throw new Error('jssip-3.2.15.js is not loaded');
    }

    /**
     * private fields
     */
    this._options = clone(options) || {};
    this._logLevel = this._options.logLevel || 'log';
    this._jssipLogLevel = this._options.jssipLogLevel || this._logLevel;
    this._logger =
      this._options.logger ||
      new Brekeke.WebrtcClient.Logger(this._logLevel, null, true);
    this._audioContext =
      this._options.audioContext ||
      (window.AudioContext ? new window.AudioContext() : {});
    this._mediaStreamConverter = this._options.mediaStreamConverter || null;

    this._lastCreatedEventId = 0;
    this._eventIdFuncTable = {};
    this._eventNameIdsTable = {};

    this._ua = null;
    this._vua = null; // video client

    this._uaStarting = false;
    this._vuaStarting = false;
    this._phoneStatus = 'stopped';
    this._stopReasonInfo = null;

    this._gettingUserMedia = false;
    this._getUserMediaTimeout = 30;

    this._defaultGatheringTimeout = 2000;

    this._user = '';
    this._videoClientUser = '';

    this._lastCreatedSessionId = 0;
    this._sessionTable = {};
    this._sessionRemoteStreamsTable = {};
    this._sessionLocalMediaTable = {};
    this._outgoingRtcInfo = {};
    this._lastCreatedVideoClientSessionId = 0;
    this._ridVideoClientSessionsTable = {};
    this._ridMembersTable = {};
    this._tryingVideoCallTargets = {};

    this._masterVolume =
      typeof this._options.masterVolume === 'number'
        ? this._options.masterVolume
        : 1000;

    this.UA_WO_GAIN = 'Firefox';
    this.CHECK_CTX_STATE = false;

    /**
     * field autoAnswer
     */
    this.autoAnswer = this._options.autoAnswer || false;

    /**
     * field ctiAutoAnswer
     */
    this.ctiAutoAnswer = this._options.ctiAutoAnswer || false;

    /**
     * field autoFocusWindow
     */
    this.autoFocusWindow = this._options.autoFocusWindow || false;

    /**
     * field doNotDisturb
     */
    this.doNotDisturb = this._options.doNotDisturb || false;

    /**
     * field multiSession
     */
    this.multiSession = this._options.multiSession || false;

    /**
     * field dtmfSendMode
     */
    this.dtmfSendMode = int(this._options.dtmfSendMode);

    /**
     * field analyserMode
     */
    this.analyserMode = int(this._options.analyserMode);

    /**
     * field defaultOptions
     */
    d = this._options.defaultOptions;
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
        call: (d && d.videoClient && d.videoClient.call) || {
          mediaConstraints: { audio: false, video: true },
        },
        answer: (d && d.videoClient && d.videoClient.answer) || {
          mediaConstraints: { audio: false, video: true },
        },
      },
      exInfo: '',
    };

    // shim
    if (
      window.RTCPeerConnection &&
      !window.RTCPeerConnection.prototype.addStream
    ) {
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        stream.getTracks().forEach(function(track) {
          window.RTCPeerConnection.prototype.addTrack.call(pc, track, stream);
        });
      };
    }

    // hack jssip
    jssipHack();

    // enable jssip log
    if (this._jssipLogLevel !== 'none' && JsSIP.debug && JsSIP.debug.enable) {
      // jssip 0.6~
      JsSIP.debug.enable('*');
    }

    // for chrome 66~
    this._registerAudioContext();
  };
  /**
   * Phone prototype
   */
  Phone.prototype = {
    /**
     * function addEventListener
     */
    addEventListener: function(eventName, func) {
      var eventId = 0;

      eventId = ++this._lastCreatedEventId;
      this._eventIdFuncTable[eventId] = func;
      if (!this._eventNameIdsTable[eventName]) {
        this._eventNameIdsTable[eventName] = [];
      }
      this._eventNameIdsTable[eventName].push(eventId);

      return string(eventId);
    },

    /**
     * function removeEventListener
     */
    removeEventListener: function(eventName, eventId) {
      var i = 0;

      eventId = int(eventId);

      if (eventId) {
        // remove one
        if (this._eventNameIdsTable[eventName]) {
          for (i = this._eventNameIdsTable[eventName].length; i--; ) {
            if (this._eventNameIdsTable[eventName][i] === eventId) {
              this._eventNameIdsTable[eventName].splice(i, 1);
            }
          }
        }
        delete this._eventIdFuncTable[eventId];
      } else {
        // remove all events in eventName
        if (this._eventNameIdsTable[eventName]) {
          for (i = this._eventNameIdsTable[eventName].length; i--; ) {
            delete this._eventIdFuncTable[
              this._eventNameIdsTable[eventName][i]
            ];
          }
          this._eventNameIdsTable[eventName] = [];
        }
      }
    },

    /**
     * function startWebRTC
     */
    startWebRTC: function(configuration) {
      var auth = '',
        url = '',
        urlUrl = null,
        host = '',
        password = '',
        port = 0,
        tls = false,
        user = '',
        userAgent = '',
        useVideoClient = false,
        videoClientUser = '';

      // check parameters
      if (!configuration) {
        this._logger.log('warn', 'Empty configuration');
        return;
      }
      url = string(configuration.url);
      if (url) {
        urlUrl = JsSIP.Grammar.parse(url, 'absoluteURI');
        host = string(urlUrl.host);
        port = int(urlUrl.port);
        tls = Boolean(string(urlUrl.scheme).toLowerCase() === 'wss');
      } else {
        host = string(configuration.host);
        if (!host) {
          this._logger.log('warn', 'Empty configuration.host');
          return;
        }
        port = int(configuration.port);
        if (port <= 0) {
          this._logger.log('warn', 'Invalid configuration.port');
          return;
        }
        tls = Boolean(configuration.tls);
      }
      user = string(configuration.user);
      if (!user) {
        this._logger.log('warn', 'Empty configuration.user');
        return;
      }
      auth = string(configuration.auth);
      password = string(configuration.password);
      useVideoClient = Boolean(configuration.useVideoClient);
      videoClientUser =
        string(configuration.videoClientUser) || user + '~video';
      userAgent = string(configuration.userAgent);

      // check environment
      if (this.getEnvironment().webRTC) {
        // WebRTC enabled
      } else {
        this._logger.log('warn', 'WebRTC not supported');
        return;
      }

      // check started
      if (this._ua) {
        this._logger.log('info', 'WebRTC already started');
        return;
      }

      // instantiate JsSIP.UA
      this._ua = new JsSIP.UA({
        log: { level: this._jssipLogLevel },
        uri: user + '@' + host,
        password: password,
        sockets: new JsSIP.WebSocketInterface(
          url ? url : (tls ? 'wss://' : 'ws://') + host + ':' + port,
        ),
        display_name: '',
        authorization_user: '',
        register:
          typeof configuration.register === 'boolean'
            ? configuration.register
            : true,
        register_expires:
          typeof configuration.register_expires === 'number'
            ? configuration.register_expires
            : 1296000,
        registrar_server: '',
        no_answer_timeout: 60,
        use_preloaded_route: false,
        connection_recovery_min_interval: 2,
        connection_recovery_max_interval: 30,
        user_agent: userAgent,
        contact_uri: new JsSIP.URI(
          'sip',
          JsSIP.Utils.createRandomToken(8),
          ''.concat(JsSIP.Utils.createRandomToken(12), '.invalid'),
          null,
          { transport: tls ? 'wss' : 'ws' },
        ).toString(),
      });
      if (useVideoClient) {
        this._vua = new JsSIP.UA({
          log: { level: this._jssipLogLevel },
          uri: videoClientUser + '@' + host,
          password: password,
          sockets: new JsSIP.WebSocketInterface(
            url ? url : (tls ? 'wss://' : 'ws://') + host + ':' + port,
          ),
          display_name: '',
          authorization_user: '',
          register:
            typeof configuration.register === 'boolean'
              ? configuration.register
              : true,
          register_expires:
            typeof configuration.register_expires === 'number'
              ? configuration.register_expires
              : 1296000,
          registrar_server: '',
          no_answer_timeout: 60,
          use_preloaded_route: false,
          connection_recovery_min_interval: 2,
          connection_recovery_max_interval: 30,
          user_agent: userAgent,
          contact_uri: new JsSIP.URI(
            'sip',
            JsSIP.Utils.createRandomToken(8),
            ''.concat(JsSIP.Utils.createRandomToken(12), '.invalid'),
            null,
            { transport: tls ? 'wss' : 'ws' },
          ).toString(),
        });
      }
      // set auth to registrator extra headers
      if (auth) {
        if (typeof this._ua.registrator === 'function') {
          this._ua.registrator().setExtraHeaders(['Authorization: ' + auth]);
          if (this._vua) {
            this._vua.registrator().setExtraHeaders(['Authorization: ' + auth]);
          }
        } else {
          this._ua.registrator.setExtraHeaders(['Authorization: ' + auth]);
          if (this._vua) {
            this._vua.registrator.setExtraHeaders(['Authorization: ' + auth]);
          }
        }
      }

      // attach JsSIP.UA event listeners
      if (configuration.register === false) {
        this._ua.on('connected', by(this, this._ua_registered));
      } else {
        this._ua.on('registered', by(this, this._ua_registered));
      }
      this._ua.on('unregistered', by(this, this._ua_unregistered));
      this._ua.on('registrationFailed', by(this, this._ua_registrationFailed));
      this._ua.on('newRTCSession', by(this, this._ua_newRTCSession));
      if (this._vua) {
        if (configuration.register === false) {
          this._vua.on('connected', by(this, this._vua_registered));
        } else {
          this._vua.on('registered', by(this, this._vua_registered));
        }
        this._vua.on('unregistered', by(this, this._vua_unregistered));
        this._vua.on(
          'registrationFailed',
          by(this, this._vua_registrationFailed),
        );
        this._vua.on('newRTCSession', by(this, this._vua_newRTCSession));
        this._vua.on('newNotify', by(this, this._vua_newNotify));
      }

      this._changePhoneStatus('starting');
      this._uaStarting = true;
      if (this._vua) {
        this._vuaStarting = true;
      }

      this._user = user;
      this._videoClientUser = videoClientUser;

      // start JsSIP.UA
      try {
        if (this._vua) {
          this._vua.start(); // start this._ua after _vua_registered
        } else {
          this._ua.start();
        }
      } catch (e) {
        this._logger.log(
          'warn',
          'UA.start error message: ' + e.message + '\nstack: ' + e.stack + '\n',
        );
        this._stopReasonInfo = {
          from: 'jssip',
          reason: e.message,
          response: null,
        };
        this.stopWebRTC(true);
      }
    },

    /**
     * function stopWebRTC
     */
    stopWebRTC: function(force) {
      var session, sessionId;

      // check stopped
      if (!this._ua) {
        this._logger.log('info', 'WebRTC already stopped');
        return;
      }

      this._changePhoneStatus('stopping');

      for (sessionId in this._sessionTable) {
        session = this._sessionTable[sessionId];
        if (session.sessionStatus !== 'terminated') {
          if (force) {
            this._terminateRtcSession(session.rtcSession);
          }
          setTimeout(by(this, this.stopWebRTC, [force]), 100);
          return;
        }
      }

      if (this._vua) {
        try {
          this._vua.stop();
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.stop error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          );
        }
        this._vua = null;
      }
      if (this._ua.isRegistered()) {
        try {
          this._ua.stop();
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.stop error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          );
        }
        // to _ua_unregistered
      } else {
        try {
          this._ua.stop();
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.stop error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          );
        }
        this._changePhoneStatus('stopped');
        this._ua = null;
        this._user = '';
        this._videoClientUser = '';
      }
    },

    /**
     * function checkUserMedia
     */
    checkUserMedia: function(callback, options) {
      if (!this._ua || this._phoneStatus !== 'started') {
        if (callback) {
          callback({
            enabled: false,
            message: 'WebRTC not started',
          });
        }
        return;
      }

      options =
        clone(
          options ||
            (this.defaultOptions &&
              this.defaultOptions.main &&
              this.defaultOptions.main.call),
        ) || {};
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: true, video: false };
      }

      // getUserMedia
      this._getUserMedia(
        options.mediaConstraints,
        function(stream) {
          JsSIP.Utils.closeMediaStream(stream);
          if (callback) {
            callback({
              enabled: true,
              message: '',
            });
          }
        },
        function(error) {
          if (callback) {
            callback({
              enabled: false,
              message: stringifyError(error),
            });
          }
        },
        0,
      );
    },

    /**
     * function makeCall
     */
    makeCall: function(target, options, withVideo, videoOptions, exInfo) {
      var rtcInfoJsonStr;

      if (!this._ua || this._phoneStatus !== 'started') {
        this._logger.log('warn', 'WebRTC not started');
        return;
      }

      target = string(target);
      if (!target) {
        this._logger.log('warn', 'Empty target');
        return;
      }

      options =
        clone(
          options ||
            (this.defaultOptions &&
              this.defaultOptions.main &&
              this.defaultOptions.main.call),
        ) || {};
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: true, video: false };
      }
      if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
        options.pcConfig = clone(options.pcConfig) || {};
        options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout;
      }
      if (!options.extraHeaders) {
        options.extraHeaders = [];
      }

      if (withVideo !== true && withVideo !== false) {
        withVideo = Boolean(
          this.defaultOptions && this.defaultOptions.withVideo,
        );
      }
      if (withVideo) {
        if (!this._vua) {
          this._logger.log('warn', 'Video client unavailable');
          return;
        }

        videoOptions =
          clone(
            videoOptions ||
              (this.defaultOptions && this.defaultOptions.videoOptions),
          ) || {};

        options.eventHandlers = clone(options.eventHandlers) || {};
        // make call of video session after main session response
        options.eventHandlers['progress'] = by(
          null,
          this._rtcSession_responseAfterMakeCallWithVideo,
          [this, videoOptions, options.eventHandlers['progress']],
        );
        options.eventHandlers['accepted'] = by(
          null,
          this._rtcSession_responseAfterMakeCallWithVideo,
          [this, videoOptions, options.eventHandlers['accepted']],
        );
      }

      exInfo = string(
        typeof exInfo !== 'undefined'
          ? exInfo
          : this.defaultOptions && this.defaultOptions.exInfo,
      );
      rtcInfoJsonStr = JSON.stringify({
        user: '',
        withVideo: withVideo,
      });
      options.extraHeaders = options.extraHeaders.concat(
        'X-UA-EX: rtcinfo=' + encodeURIComponent(rtcInfoJsonStr) + ';' + exInfo,
      );
      this._outgoingRtcInfo = {
        withVideo: withVideo,
        exInfo: exInfo,
      };

      this._doCall(
        target,
        options,
        this._ua,
        null,
        by(this, this._rtcErrorOccurred, [
          { sessionId: null, target: target, options: options, client: 'main' },
        ]),
      );
    },

    /**
     * function setWithVideo
     */
    setWithVideo: function(sessionId, withVideo, videoOptions, exInfo) {
      var i,
        members,
        options,
        rid,
        rm,
        session,
        sourceSessionId = null,
        targets;

      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];

      if (!session) {
        this._logger.log(
          'warn',
          'Not found session of sessionId: ' + sessionId,
        );
        return;
      }

      if (
        withVideo === true &&
        (!this._vua || this._phoneStatus !== 'started')
      ) {
        this._logger.log('warn', 'Video client unavailable');
        return;
      }

      session.exInfo = string(
        typeof exInfo !== 'undefined' ? exInfo : session.exInfo,
      );
      if (session.sessionStatus === 'connected') {
        this._sendInfoXUaEx(sessionId, false, withVideo, 0);
      } else if (session.rtcSession && session.rtcSession.on) {
        session.rtcSession.on(
          'accepted',
          by(this, this._sendInfoXUaEx, [sessionId, false, null, 500]),
        );
      }

      if (withVideo === true && !session.withVideo) {
        session.withVideo = true;

        // set videoOptions
        session.videoOptions =
          clone(
            videoOptions ||
              session.videoOptions ||
              (this.defaultOptions && this.defaultOptions.videoOptions),
          ) || {};

        // try video call (earlier id -> later id)
        this._tryVideoCall(sessionId);

        // send request video call (later id -> earlier id)
        rid = this._getRid(sessionId);
        rm = rid && this._ridMembersTable[rid];
        members = rm && rm.members;
        if (members) {
          targets = [];
          for (i = 0; i < members.length; i++) {
            if (this._videoClientUser > members[i].phone_id) {
              // send request only to earlier id
              if (
                members[i].talker_hold !== 'h' &&
                rm.me.talker_hold !== 'h' &&
                members[i].talker_attr === rm.me.talker_attr
              ) {
                targets.push(members[i].phone_id);
              }
            }
          }
          options = clone(session.videoOptions.call) || {};
          if (!options.mediaConstraints) {
            options.mediaConstraints = { audio: false, video: true };
          }
          if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
            options.pcConfig = clone(options.pcConfig) || {};
            options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout;
          }
          if (!options.extraHeaders) {
            options.extraHeaders = [];
          }
          if (
            !options.extraHeaders.some(function(o) {
              return (
                string(o)
                  .split(':')[0]
                  .trim() === 'X-PBX'
              );
            })
          ) {
            options.extraHeaders = options.extraHeaders.concat('X-PBX: false');
          }
          options.extraHeaders = options.extraHeaders.concat(
            'X-REQUEST-VIDEO-CALL: true',
          ); // request video call
          if (session.videoOptions && session.videoOptions.shareStream) {
            if (this._ridVideoClientSessionsTable[rid]) {
              sourceSessionId =
                Object.keys(this._ridVideoClientSessionsTable[rid])[0] || null;
            }
            if (!sourceSessionId && targets.length >= 2) {
              session.mustRetryVideoCall = true;
              targets = [targets[0]];
            }
          }
          for (i = 0; i < targets.length; i++) {
            // send
            this._doCall(
              targets[i],
              options,
              this._vua,
              sourceSessionId,
              by(this, this._rtcErrorOccurred, [
                {
                  sessionId: sessionId,
                  target: null,
                  options: options,
                  client: 'video',
                },
              ]),
            );
          }
        }
      } else if (withVideo === true && session.withVideo) {
        session.videoOptions =
          clone(
            videoOptions ||
              session.videoOptions ||
              (this.defaultOptions && this.defaultOptions.videoOptions),
          ) || {};
      } else if (withVideo === false && session.withVideo) {
        session.withVideo = false;
        session.videoOptions = null;

        // disconnect all
        this._checkAndTerminateVideo();
      } else {
        this._logger.log('info', 'Skipped changing withVideo');
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId));
    },

    /**
     * function makeAdditionalVideoCall
     */
    makeAdditionalVideoCall: function(sessionId, videoOptions, targets) {
      var existing,
        i,
        j,
        members,
        memberTargets,
        options,
        rid,
        rm,
        session,
        sourceSessionId = null;

      if (!this._ua || this._phoneStatus !== 'started') {
        this._logger.log('warn', 'WebRTC not started');
        return;
      }

      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];

      if (!session) {
        this._logger.log(
          'warn',
          'Not found session of sessionId: ' + sessionId,
        );
        return;
      }

      if (!session.withVideo) {
        this._logger.log('warn', 'Not with video');
        return;
      }

      if (!this._vua) {
        this._logger.log('warn', 'Video client unavailable');
        return;
      }

      videoOptions =
        clone(
          videoOptions ||
            session.videoOptions ||
            (this.defaultOptions && this.defaultOptions.videoOptions),
        ) || {};

      // rid
      rid = this._getRid(sessionId);
      if (!rid) {
        this._logger.log('debug', 'Session info (rid) not received yet');
        return;
      }

      // members
      rm = this._ridMembersTable[rid];
      if (!rm) {
        this._logger.log('debug', 'Members not notified yet');
        return;
      }
      members = rm.members;

      // targets
      memberTargets = [];
      for (i = 0; i < members.length; i++) {
        if (members[i].phone_id !== this._videoClientUser) {
          if (Array.isArray(targets) && targets.indexOf(members[i].user) >= 0) {
            memberTargets.push(members[i].phone_id);
          }
        }
      }

      // options
      options = clone(videoOptions.call) || {};
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: false, video: true };
      }
      if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
        options.pcConfig = clone(options.pcConfig) || {};
        options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout;
      }
      if (!options.extraHeaders) {
        options.extraHeaders = [];
      }
      if (
        !options.extraHeaders.some(function(o) {
          return (
            string(o)
              .split(':')[0]
              .trim() === 'X-PBX'
          );
        })
      ) {
        options.extraHeaders = options.extraHeaders.concat('X-PBX: false');
      }

      if (session.videoOptions && session.videoOptions.shareStream) {
        if (this._ridVideoClientSessionsTable[rid]) {
          sourceSessionId =
            Object.keys(this._ridVideoClientSessionsTable[rid])[0] || null;
        }
        if (!sourceSessionId && memberTargets.length >= 2) {
          session.mustRetryVideoCall = true;
          memberTargets = [memberTargets[0]];
        }
      }

      // make call
      for (i = 0; i < memberTargets.length; i++) {
        this._doCall(
          memberTargets[i],
          options,
          this._vua,
          sourceSessionId,
          by(this, this._rtcErrorOccurred, [
            {
              sessionId: sessionId,
              target: null,
              options: options,
              client: 'video',
            },
          ]),
        );
      }
    },

    /**
     * function answer
     */
    answer: function(sessionId, options, withVideo, videoOptions, exInfo) {
      var rtcInfoJsonStr, session;

      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];

      if (!session) {
        this._logger.log(
          'warn',
          'Not found session of sessionId: ' + sessionId,
        );
        return;
      }

      if (
        session.sessionStatus !== 'dialing' &&
        session.sessionStatus !== 'progress'
      ) {
        this._logger.log(
          'warn',
          'Invalid sessionStatus: ' + session.sessionStatus,
        );
        return;
      }

      if (session.answeringStarted) {
        this._logger.log('warn', 'Already answering');
        return;
      }

      if (withVideo === true) {
        if (!this._vua) {
          this._logger.log('warn', 'Video client unavailable');
          return;
        }
        session.withVideo = true;
      } else if (withVideo === false) {
        session.withVideo = false;
      }
      if (session.withVideo) {
        // set videoOptions
        if (videoOptions) {
          session.videoOptions = clone(videoOptions);
        } else if (!session.videoOptions) {
          session.videoOptions =
            clone(this.defaultOptions && this.defaultOptions.videoOptions) ||
            {};
        }

        this._tryVideoCall(sessionId);
      }

      options =
        clone(
          options ||
            (this.defaultOptions &&
              this.defaultOptions.main &&
              this.defaultOptions.main.answer),
        ) || {};
      if (!options.mediaConstraints) {
        options.mediaConstraints = { audio: true, video: false };
      }
      if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
        options.pcConfig = clone(options.pcConfig) || {};
        options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout;
      }
      if (!options.extraHeaders) {
        options.extraHeaders = [];
      }

      session.exInfo = string(
        typeof exInfo !== 'undefined' ? exInfo : session.exInfo,
      );
      rtcInfoJsonStr = JSON.stringify({
        user: string(
          string(
            session.incomingMessage &&
              session.incomingMessage.getHeader &&
              session.incomingMessage.getHeader('X-PBX-Session-Info'),
          ).split(';')[3],
        ),
        withVideo: session.withVideo,
      });
      options.extraHeaders = options.extraHeaders.concat(
        'X-UA-EX: rtcinfo=' +
          encodeURIComponent(rtcInfoJsonStr) +
          ';' +
          session.exInfo,
      );

      session.answeringStarted = true;
      if (session.sessionStatus === 'progress') {
        this._emitEvent('sessionStatusChanged', this.getSession(sessionId));
      }
      this._doAnswer(
        sessionId,
        options,
        session.rtcSession,
        null,
        by(this, this._answerFailed, [
          {
            sessionId: sessionId,
            target: null,
            options: options,
            client: 'main',
          },
        ]),
      );
    },

    /**
     * function reconnectMicrophone
     */
    reconnectMicrophone: function(sessionId, options) {
      var mediaObject, session;

      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];
      if (!session) {
        this._logger.log(
          'warn',
          'Not found session of sessionId: ' + sessionId,
        );
        return;
      }
      mediaObject = this._sessionLocalMediaTable[sessionId];
      if (mediaObject && mediaObject.sourceNode && mediaObject.gainNode) {
        options =
          clone(
            options ||
              (this.defaultOptions &&
                this.defaultOptions.main &&
                (session.rtcSession.direction === 'outgoing'
                  ? this.defaultOptions.main.call
                  : this.defaultOptions.main.answer)),
          ) || {};
        if (!options.mediaConstraints) {
          options.mediaConstraints = { audio: true, video: false };
        }

        // getUserMedia
        this._getUserMedia(
          options.mediaConstraints,
          function(stream) {
            if (mediaObject === this._sessionLocalMediaTable[sessionId]) {
              if (mediaObject.localMediaStream) {
                JsSIP.Utils.closeMediaStream(mediaObject.localMediaStream);
              }
              try {
                mediaObject.sourceNode.disconnect();
              } catch (e) {}
              mediaObject.sourceNode = this._audioContext.createMediaStreamSource(
                stream,
              );
              mediaObject.sourceNode.connect(mediaObject.gainNode);
              mediaObject.localMediaStream = stream;
            } else {
              this._logger.log(
                'warn',
                '_sessionLocalMediaTable[' + sessionId + '] removed',
              );
              JsSIP.Utils.closeMediaStream(stream);
            }
          },
          function(error) {
            this._logger.log(
              'error',
              'getUserMedia() failed: ' + stringifyError(error),
            );
            this._rtcErrorOccurred(
              {
                sessionId: sessionId,
                target: null,
                options: options,
                client: 'main',
              },
              { from: 'browser', error: error },
            );
          },
          0,
        );
      }
    },

    /**
     * function setMuted
     */
    setMuted: function(muted, sessionId) {
      var mutedOrg, rid, videoClientSession, videoClientSessionId;

      muted = muted || {};
      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];

      mutedOrg = {
        main: false,
        videoClient: false,
      };

      if (!session) {
        this._logger.log(
          'warn',
          'Not found session of sessionId: ' + sessionId,
        );
        return mutedOrg;
      }

      mutedOrg = {
        main: Boolean(session.mainMuted),
        videoClient: Boolean(session.videoClientMuted),
      };

      if (muted.main === true || muted.main === false) {
        session.mainMuted = muted.main;
        if (session.rtcSession && session.rtcSession.isEstablished()) {
          if (muted.main) {
            session.rtcSession.mute({ audio: true, video: true });
          } else {
            session.rtcSession.unmute({ audio: true, video: true });
          }
        }
      }

      if (muted.videoClient === true || muted.videoClient === false) {
        session.videoClientMuted = muted.videoClient;
        rid = this._getRid(sessionId);
        if (rid && this._ridVideoClientSessionsTable[rid]) {
          for (videoClientSessionId in this._ridVideoClientSessionsTable[rid]) {
            videoClientSession = this._ridVideoClientSessionsTable[rid][
              videoClientSessionId
            ];
            if (
              videoClientSession &&
              videoClientSession.rtcSession &&
              videoClientSession.rtcSession.isEstablished()
            ) {
              if (muted.videoClient) {
                videoClientSession.rtcSession.mute({
                  audio: true,
                  video: true,
                });
              } else {
                videoClientSession.rtcSession.unmute({
                  audio: true,
                  video: true,
                });
              }
            }
          }
        }
      }

      return mutedOrg;
    },

    /**
     * function setSessionVolume
     */
    setSessionVolume: function(volumePercent, sessionId) {
      var mediaObject, session;

      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];
      mediaObject = this._sessionLocalMediaTable[sessionId];
      if (mediaObject && mediaObject.gainNode) {
        mediaObject.volumePercent = int(volumePercent);
        mediaObject.gainNode.gain.value =
          (this._masterVolume * mediaObject.volumePercent) / 100000;
      } else if (session) {
        session.initialVolumePercent = int(volumePercent);
      } else {
        this._logger.log(
          'warn',
          'Not found session of sessionId: ' + sessionId,
        );
        return;
      }
    },

    /**
     * function sendDTMF
     */
    sendDTMF: function(tones, sessionId, options) {
      var environment,
        mediaObject,
        self = this,
        sendInbandDTMF,
        session;

      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];
      mediaObject = this._sessionLocalMediaTable[sessionId];

      if (!session) {
        this._logger.log(
          'warn',
          'Not found session of sessionId: ' + sessionId,
        );
        return;
      }

      environment = this.getEnvironment();
      if (int(this.dtmfSendMode) === 1) {
        sendInbandDTMF = function() {
          var duration, interToneGap, tasks;
          duration = int(options && options.duration) || 100;
          interToneGap = int(options && options.interToneGap) || 500;
          tasks = [];
          string(tones)
            .split('')
            .forEach(function(tone) {
              var oscillator;
              if (mediaObject.dtmfOscillatorTable[tone]) {
                oscillator = mediaObject.dtmfOscillatorTable[tone];
                tasks.push(function() {
                  mediaObject.gainNode.gain.value = 0;
                  oscillator.lowerGain.gain.value = 1;
                  oscillator.upperGain.gain.value = 1;
                  if (tasks.length > 0) {
                    setTimeout(tasks.shift(), duration);
                  }
                });
                tasks.push(function() {
                  mediaObject.gainNode.gain.value = 1;
                  oscillator.lowerGain.gain.value = 0;
                  oscillator.upperGain.gain.value = 0;
                  if (tasks.length > 0) {
                    setTimeout(tasks.shift(), interToneGap);
                  }
                });
              }
            });
          if (tasks.length > 0) {
            self._logger.log('debug', 'Play inband DTMF: ' + tones);
            tasks.shift()();
          }
        };
        if (
          mediaObject &&
          mediaObject.gainNode &&
          mediaObject.dtmfOscillatorTable
        ) {
          // send inband DTMF
          sendInbandDTMF();
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
            );
            this._connectLocalMediaToAudioNode(sessionId);
            session.rtcSession.connection.addStream(
              mediaObject.localMediaStreamForCall,
            );
            session.rtcSession.connection.onnegotiationneeded = function() {
              session.rtcSession.connection.onnegotiationneeded = function() {};
              session.rtcSession.connection.createOffer(
                function(desc) {
                  self._logger.log(
                    'debug',
                    'session.rtcSession.connection.createOffer OK',
                  );
                  session.rtcSession.connection.setLocalDescription(
                    desc,
                    function() {
                      self._logger.log(
                        'debug',
                        'session.rtcSession.connection.setLocalDescription OK',
                      );
                      // send inband DTMF
                      sendInbandDTMF();
                    },
                    function(error) {
                      self._logger.log(
                        'warn',
                        'session.rtcSession.connection.setLocalDescription NG',
                      );
                      mediaObject.dtmfOscillatorTable = {}; // never retry
                      // send SIP INFO DTMF
                      session.rtcSession.sendDTMF(tones, options);
                    },
                  );
                },
                function(error) {
                  self._logger.log(
                    'warn',
                    'session.rtcSession.connection.createOffer NG',
                  );
                  mediaObject.dtmfOscillatorTable = {}; // never retry
                  // send SIP INFO DTMF
                  session.rtcSession.sendDTMF(tones, options);
                },
              );
            };
          } catch (e) {
            this._logger.log(
              'warn',
              'Cannot to prepare OscillatorNodes to send inband DTMF: ' +
                stringifyError(e),
            );
            mediaObject.dtmfOscillatorTable = {}; // never retry
            // send SIP INFO DTMF
            session.rtcSession.sendDTMF(tones, options);
          }
        } else {
          this._logger.log('info', 'Cannot to play inband DTMF');
          // send SIP INFO DTMF
          session.rtcSession.sendDTMF(tones, options);
        }
      } else {
        // send SIP INFO DTMF
        session.rtcSession.sendDTMF(tones, options);
      }
    },

    /**
     * function getPhoneStatus
     */
    getPhoneStatus: function() {
      return string(this._phoneStatus);
    },

    /**
     * function getSession
     */
    getSession: function(sessionId) {
      var analyser,
        localStreamObject,
        localVideoStreamObject,
        localVideoStreamTimestamp,
        remoteStreamObject,
        remoteUserOptions,
        remoteUserOptionsTable,
        remoteVideoStreamObject,
        remoteWithVideo,
        rid,
        session,
        videoClientSession,
        videoClientSessionId,
        videoClientSessionTable,
        user;

      sessionId = string(sessionId) || this._getLatestSessionId();
      session = this._sessionTable[sessionId];

      if (!session) {
        return null;
      }

      remoteStreamObject = null;
      localStreamObject = null;
      localVideoStreamObject = null;
      localVideoStreamTimestamp = +new Date() + 1;
      videoClientSessionTable = {};
      analyser = null;
      if (session.sessionStatus !== 'terminated') {
        try {
          remoteStreamObject =
            (this._sessionRemoteStreamsTable[sessionId] || [])[0] || null;
        } catch (e) {
          remoteStreamObject = null;
        }

        if (this._sessionLocalMediaTable[sessionId]) {
          localStreamObject = this._sessionLocalMediaTable[sessionId]
            .localMediaStreamForCall;
        }

        // video client sessions information
        rid = this._getRid(sessionId);
        if (rid) {
          if (this._ridVideoClientSessionsTable[rid]) {
            for (videoClientSessionId in this._ridVideoClientSessionsTable[
              rid
            ]) {
              videoClientSession = this._ridVideoClientSessionsTable[rid][
                videoClientSessionId
              ];
              if (
                videoClientSession &&
                videoClientSession.rtcSession &&
                videoClientSession.rtcSession.isEstablished()
              ) {
                try {
                  remoteVideoStreamObject =
                    (this._sessionRemoteStreamsTable[videoClientSessionId] ||
                      [])[0] || null;
                } catch (e) {
                  remoteVideoStreamObject = null;
                }
                videoClientSessionTable[videoClientSessionId] = {
                  user: string(
                    videoClientSession.member && videoClientSession.member.user,
                  ),
                  remoteStreamObject: remoteVideoStreamObject,
                  rtcSession: videoClientSession.rtcSession,
                };
                if (this._sessionLocalMediaTable[videoClientSessionId]) {
                  if (
                    this._sessionLocalMediaTable[videoClientSessionId]
                      .timestamp < localVideoStreamTimestamp
                  ) {
                    localVideoStreamObject = this._sessionLocalMediaTable[
                      videoClientSessionId
                    ].localMediaStreamForCall;
                    localVideoStreamTimestamp = this._sessionLocalMediaTable[
                      videoClientSessionId
                    ].timestamp;
                  }
                }
              }
            }
          }
        }

        // analyser
        if (this._sessionLocalMediaTable[sessionId]) {
          analyser = this._sessionLocalMediaTable[sessionId].analyser;
        }
      }

      remoteUserOptionsTable = {};
      remoteWithVideo = false;
      for (user in session.remoteUserOptionsTable) {
        remoteUserOptions = session.remoteUserOptionsTable[user];
        remoteUserOptionsTable[user] = {
          withVideo: Boolean(remoteUserOptions.withVideo),
          exInfo: string(remoteUserOptions.exInfo),
        };
        if (remoteUserOptions.withVideo) {
          remoteWithVideo = true;
        }
      }

      return {
        sessionId: session.sessionId,
        sessionStatus: session.sessionStatus,
        answering:
          session.answeringStarted && session.sessionStatus === 'progress',
        audio: session.audio,
        video: session.video,
        remoteStreamObject: remoteStreamObject,
        localStreamObject: localStreamObject,
        remoteWithVideo: remoteWithVideo,
        withVideo: session.withVideo,
        shareStream: Boolean(
          session.videoOptions && session.videoOptions.shareStream,
        ),
        exInfo: string(session.exInfo),
        muted: {
          main: Boolean(session.mainMuted),
          videoClient: Boolean(session.videoClientMuted),
        },
        localVideoStreamObject: localVideoStreamObject,
        videoClientSessionTable: videoClientSessionTable,
        rtcSession: session.rtcSession,
        incomingMessage: session.incomingMessage,
        remoteUserOptionsTable: remoteUserOptionsTable,
        analyser: analyser,
      };
    },

    /**
     * function getSessionTable
     */
    getSessionTable: function() {
      var sessionId,
        sessionTable = {};

      // return copy of _sessionTable
      for (sessionId in this._sessionTable) {
        sessionTable[sessionId] = this.getSession(sessionId);
      }
      return sessionTable;
    },

    /**
     * function getEnvironment
     */
    getEnvironment: function() {
      var environment = {
        webRTC: false,
        gain: false,
        oscillator: false,
      };
      if (
        (window.RTCPeerConnection ||
          window.mozRTCPeerConnection ||
          window.webkitRTCPeerConnection) &&
        typeof navigator === 'object' &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      ) {
        environment.webRTC = true;
      }
      if (
        this.UA_WO_GAIN &&
        typeof navigator === 'object' &&
        navigator.userAgent &&
        navigator.userAgent.indexOf(this.UA_WO_GAIN) >= 0
      ) {
        // "Cannot create an offer with no local tracks, no offerToReceiveAudio/Video, and no DataChannel."
      } else if (
        this._audioContext &&
        this._audioContext.createGain &&
        this._audioContext.createMediaStreamSource &&
        this._audioContext.createMediaStreamDestination
      ) {
        environment.gain = true;
        if (this._audioContext.createOscillator) {
          environment.oscillator = true;
        }
      }
      return environment;
    },

    /**
     * getter masterVolume
     */
    get masterVolume() {
      return this._masterVolume;
    },

    /**
     * setter masterVolume
     */
    set masterVolume(value) {
      var key, mediaObject;

      this._masterVolume = int(value);
      for (key in this._sessionLocalMediaTable) {
        mediaObject = this._sessionLocalMediaTable[key];
        if (mediaObject.gainNode) {
          mediaObject.gainNode.gain.value =
            (this._masterVolume * mediaObject.volumePercent) / 100000;
        }
      }
    },

    /**
     * private functions
     */
    _emitEvent: function(eventName, eventArgs) {
      var func,
        i = 0,
        len = 0;

      this._logger.log('debug', 'Emitting event: ' + eventName);

      if (this._eventNameIdsTable[eventName]) {
        for (
          i = 0, len = this._eventNameIdsTable[eventName].length;
          i < len;
          i++
        ) {
          func = this._eventIdFuncTable[this._eventNameIdsTable[eventName][i]];
          if (func) {
            try {
              func(eventArgs);
            } catch (e) {
              this._logger.log('error', 'func() failed: ' + stringifyError(e));
            }
          }
        }
      }
    },
    _registerAudioContext: function() {
      var elems,
        funcToResume,
        self = this;

      this._logger.log(
        'debug',
        'AudioContext.state: ' + this._audioContext.state,
      );
      if (this._audioContext.state === 'suspended') {
        try {
          funcToResume = function() {
            try {
              self._logger.log('debug', 'AudioContext.resume()');
              self._audioContext.resume().then(function() {
                self._logger.log('debug', 'AudioContext resumed successfully');
                elems.forEach(function(elem) {
                  elem.removeEventListener('click', funcToResume);
                });
                elems.length = 0;
              });
            } catch (e) {
              try {
                self._logger.log('info', stringifyError(e));
              } catch (e) {}
            }
          };
          elems = [];
          try {
            elems.push(window.document.body);
            elems.push(window.opener.document.body);
          } catch (e) {}
          elems.forEach(function(elem) {
            elem.addEventListener('click', funcToResume);
          });
        } catch (e) {
          this._logger.log('info', stringifyError(e));
        }
      }
    },
    _changePhoneStatus: function(status) {
      if (status !== 'stopping' && status !== 'stopped') {
        this._stopReasonInfo = null;
      }
      if (this._phoneStatus !== status) {
        this._phoneStatus = status;
        if (status !== 'starting') {
          this._uaStarting = false;
          this._vuaStarting = false;
        }
        this._emitEvent('phoneStatusChanged', {
          phoneStatus: string(this._phoneStatus),
          from: string(this._stopReasonInfo && this._stopReasonInfo.from),
          reason: string(this._stopReasonInfo && this._stopReasonInfo.reason),
          response:
            (this._stopReasonInfo && this._stopReasonInfo.response) || null,
        });
      }
    },
    _getUserMedia: function(
      constraints,
      successCallback,
      errorCallback,
      count,
    ) {
      this._logger.log('debug', '_getUserMedia #' + count);
      if (this._gettingUserMedia) {
        if (!count || count < this._getUserMediaTimeout) {
          setTimeout(
            by(this, this._getUserMedia, [
              constraints,
              successCallback,
              errorCallback,
              (count || 0) + 1,
            ]),
            1000,
          );
        } else {
          this._gettingUserMedia = false;
          if (errorCallback) {
            errorCallback.apply(this, ['_getUserMedia timeout']);
          }
        }
        return;
      }
      this._gettingUserMedia = true;
      if (this.autoFocusWindow) {
        try {
          if (window.opener && window.opener.eval && window.name) {
            window.opener.eval(
              "setTimeout(function() { window.open('', '" +
                window.name +
                "').focus(); }, 0)",
            );
          }
        } catch (e) {
          this._logger.log(
            'warn',
            'autoFocusWindow error message: ' + e.message,
          );
        }
      }
      navigator.mediaDevices.getUserMedia(constraints).then(
        by(this, function(stream) {
          this._gettingUserMedia = false;
          if (successCallback) {
            successCallback.apply(this, [stream]);
          }
        }),
        by(this, function(error) {
          this._gettingUserMedia = false;
          if (errorCallback) {
            errorCallback.apply(this, [error]);
          }
        }),
      );
    },
    _doCall: function(target, options, ua, sourceSessionId, errorCallback) {
      options = clone(options);

      if (sourceSessionId) {
        this._doUaCall(
          target,
          options,
          ua,
          false,
          sourceSessionId,
          errorCallback,
          null,
        );
      } else if (options.mediaStream) {
        this._doUaCall(target, options, ua, false, null, errorCallback, null);
      } else {
        // getUserMedia
        this._getUserMedia(
          options.mediaConstraints,
          this._doUaCall.bind(
            this,
            target,
            options,
            ua,
            true,
            null,
            errorCallback,
          ),
          function(error) {
            this._logger.log(
              'error',
              'getUserMedia() failed: ' + stringifyError(error),
            );
            if (errorCallback) {
              errorCallback.apply(this, [{ from: 'browser', error: error }]);
            }
          },
          0,
        );
      }
    },
    _doUaCall: function(
      target,
      options,
      ua,
      isNew,
      sourceSessionId,
      errorCallback,
      stream,
    ) {
      options = clone(options);

      this._disposeLocalMedia('outgoing');
      this._createLocalMedia(
        'outgoing',
        stream,
        options.mediaConstraints,
        isNew,
        sourceSessionId,
      );
      if (!options.mediaStream) {
        try {
          this._connectLocalMediaToAudioNode('outgoing');
          options.mediaStream = this._sessionLocalMediaTable[
            'outgoing'
          ].localMediaStreamForCall;
        } catch (e) {
          this._logger.log(
            'error',
            '_connectLocalMediaToAudioNode() failed: ' + stringifyError(e),
          );
          this._disposeLocalMedia('outgoing');
          if (errorCallback) {
            errorCallback.apply(this, [{ from: 'jssip', error: e }]);
          }
          return;
        }
      }
      // call
      try {
        ua.call(target, options);
      } catch (e) {
        this._logger.log(
          'error',
          'JsSIP.UA.call() failed: ' + stringifyError(e),
        );
        this._disposeLocalMedia('outgoing');
        if (errorCallback) {
          errorCallback.apply(this, [{ from: 'jssip', error: e }]);
        }
      }
    },
    _rtcErrorOccurred: function(eventArgs, e) {
      eventArgs.from = e.from;
      eventArgs.error = e.error;
      this._emitEvent('rtcErrorOccurred', eventArgs);
    },
    _doAnswer: function(
      sessionId,
      options,
      rtcSession,
      sourceSessionId,
      errorCallback,
    ) {
      if (rtcSession.direction !== 'incoming') {
        this._logger.log(
          'warn',
          'Invalid rtcSession.direction: ' + rtcSession.direction,
        );
        if (errorCallback) {
          errorCallback.apply(this, [{}]);
        }
        return;
      }
      if (rtcSession.status !== 4) {
        this._logger.log(
          'warn',
          'Invalid rtcSession.status: ' + rtcSession.status,
        );
        if (errorCallback) {
          errorCallback.apply(this, [{}]);
        }
        return;
      }

      options = clone(options);

      if (sourceSessionId) {
        this._doRtcSessionAnswer(
          sessionId,
          options,
          rtcSession,
          false,
          sourceSessionId,
          errorCallback,
          null,
        );
      } else if (options.mediaStream) {
        this._doRtcSessionAnswer(
          sessionId,
          options,
          rtcSession,
          false,
          null,
          errorCallback,
          null,
        );
      } else {
        // getUserMedia
        this._getUserMedia(
          options.mediaConstraints,
          this._doRtcSessionAnswer.bind(
            this,
            sessionId,
            options,
            rtcSession,
            true,
            null,
            errorCallback,
          ),
          function(error) {
            this._logger.log(
              'error',
              'getUserMedia() failed: ' + stringifyError(error),
            );
            if (errorCallback) {
              errorCallback.apply(this, [{ from: 'browser', error: error }]);
            }
          },
          0,
        );
      }
    },
    _doRtcSessionAnswer: function(
      sessionId,
      options,
      rtcSession,
      isNew,
      sourceSessionId,
      errorCallback,
      stream,
    ) {
      options = clone(options);

      this._disposeLocalMedia(sessionId);
      this._createLocalMedia(
        sessionId,
        stream,
        options.mediaConstraints,
        isNew,
        sourceSessionId,
      );
      if (!options.mediaStream) {
        try {
          this._connectLocalMediaToAudioNode(sessionId);
          options.mediaStream = this._sessionLocalMediaTable[
            sessionId
          ].localMediaStreamForCall;
        } catch (e) {
          this._logger.log(
            'error',
            '_connectLocalMediaToAudioNode() failed: ' + stringifyError(e),
          );
          this._disposeLocalMedia(sessionId);
          if (errorCallback) {
            errorCallback.apply(this, [{ from: 'jssip', error: e }]);
          }
          return;
        }
      }
      // answer
      try {
        rtcSession.answer(options);
      } catch (e) {
        this._logger.log(
          'error',
          'JsSIP.RTCSession.answer() failed: ' + stringifyError(e),
        );
        this._disposeLocalMedia(sessionId);
        if (errorCallback) {
          errorCallback.apply(this, [{ from: 'jssip', error: e }]);
        }
      }
    },
    _answerFailed: function(eventArgs, e) {
      var session, sessionId;

      if (e && e.from) {
        this._rtcErrorOccurred(eventArgs, e);
      }
      sessionId = eventArgs && eventArgs.sessionId;
      session = this._sessionTable[sessionId];
      if (session && session.answeringStarted) {
        session.answeringStarted = false;
        if (session.sessionStatus === 'progress') {
          this._emitEvent('sessionStatusChanged', this.getSession(sessionId));
        }
      }
    },
    _tryVideoCall: function(sessionId) {
      var clearTryingVideoCallTarget,
        i,
        j,
        members,
        mustUpdateRemoteUserOptions,
        options,
        rid,
        rm,
        session,
        sourceSessionId = null,
        targets;

      this._checkAndTerminateVideo();

      // make video call when all informations (session, rid, members) have been prepared

      // session
      session = this._sessionTable[sessionId];
      if (!session) {
        this._logger.log('info', 'Empty session');
        return;
      }

      // rid
      rid = this._getRid(sessionId);
      if (!rid) {
        this._logger.log('debug', 'Session info (rid) not received yet');
        return;
      }

      // members
      rm = this._ridMembersTable[rid];
      if (!rm) {
        this._logger.log('debug', 'Members not notified yet');
        return;
      }
      members = rm.members;

      // targets
      targets = [];
      mustUpdateRemoteUserOptions = false;
      for (i = 0; i < members.length; i++) {
        if (this._videoClientUser < members[i].phone_id) {
          // make call only from earlier id
          if (
            members[i].talker_hold !== 'h' &&
            rm.me.talker_hold !== 'h' &&
            members[i].talker_attr === rm.me.talker_attr
          ) {
            if (!this._tryingVideoCallTargets[members[i].phone_id]) {
              targets.push(members[i].phone_id);
              // check remoteUserOptions updated
              if (!session.remoteUserOptionsTable[members[i].user]) {
                mustUpdateRemoteUserOptions = true;
              }
            }
          }
        }
      }

      // update remoteUserOptions
      if (mustUpdateRemoteUserOptions) {
        if (session.sessionStatus === 'progress') {
          // in process of receiving 200 OK
          this._sendInfoXUaEx(sessionId, true, null, 500);
        } else {
          this._sendInfoXUaEx(sessionId, true, null, 0);
        }
      }

      if (!session.withVideo) {
        this._logger.log('debug', 'No need to try video call');
        return;
      }
      if (!this._vua || this._phoneStatus !== 'started') {
        this._logger.log('warn', 'Video client unavailable');
        return;
      }
      if (session.videoOptions && session.videoOptions.shareStream) {
        if (this._ridVideoClientSessionsTable[rid]) {
          sourceSessionId =
            Object.keys(this._ridVideoClientSessionsTable[rid])[0] || null;
        }
        if (!sourceSessionId && targets.length >= 2) {
          session.mustRetryVideoCall = true;
          targets = [targets[0]];
        }
      }
      for (i = 0; i < targets.length; i++) {
        this._tryingVideoCallTargets[targets[i]] = true;

        // options
        options =
          clone(session.videoOptions && session.videoOptions.call) || {};
        if (!options.mediaConstraints) {
          options.mediaConstraints = { audio: false, video: true };
        }
        if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
          options.pcConfig = clone(options.pcConfig) || {};
          options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout;
        }
        if (!options.extraHeaders) {
          options.extraHeaders = [];
        }
        if (
          !options.extraHeaders.some(function(o) {
            return (
              string(o)
                .split(':')[0]
                .trim() === 'X-PBX'
            );
          })
        ) {
          options.extraHeaders = options.extraHeaders.concat('X-PBX: false');
        }
        options.eventHandlers = clone(options.eventHandlers) || {};
        clearTryingVideoCallTarget = by(
          this,
          this._clearTryingVideoCallTarget,
          [targets[i]],
        );
        options.eventHandlers['failed'] = clearTryingVideoCallTarget;
        options.eventHandlers['ended'] = clearTryingVideoCallTarget;

        // make call
        this._doCall(
          targets[i],
          options,
          this._vua,
          sourceSessionId,
          by(this, this._tryVideoCallFailed, [
            targets[i],
            {
              sessionId: string(sessionId),
              target: null,
              options: options,
              client: 'video',
            },
          ]),
        );
      }
    },
    _tryVideoCallFailed: function(target, eventArgs, e) {
      this._clearTryingVideoCallTarget(target);
      this._rtcErrorOccurred(eventArgs, e);
    },
    _clearTryingVideoCallTarget: function(target) {
      delete this._tryingVideoCallTargets[target];
    },
    _checkAndTerminateVideo: function() {
      var i,
        member,
        memberOk,
        members,
        rid,
        rm,
        sessionId,
        sessionOk,
        videoClientSessionId;

      // check all video client sessions
      for (rid in this._ridVideoClientSessionsTable) {
        // check main session
        sessionOk = false;
        for (sessionId in this._sessionTable) {
          if (
            rid === this._getRid(sessionId) &&
            this._sessionTable[sessionId].withVideo
          ) {
            sessionOk = true;
          }
        }
        for (videoClientSessionId in this._ridVideoClientSessionsTable[rid]) {
          memberOk = false;
          if (sessionOk) {
            // check member
            member = this._ridVideoClientSessionsTable[rid][
              videoClientSessionId
            ].member;
            rm = this._ridMembersTable[rid];
            if (rm) {
              members = rm.members;
              for (i = 0; i < members.length; i++) {
                if (members[i].phone_id === member.phone_id) {
                  if (
                    members[i].talker_hold !== 'h' &&
                    rm.me.talker_hold !== 'h' &&
                    members[i].talker_attr === rm.me.talker_attr
                  ) {
                    memberOk = true;
                    break;
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
            );
          }
        }
      }
    },
    _terminateRtcSession: function(rtcSession) {
      try {
        rtcSession.terminate();
      } catch (e) {
        this._logger.log(
          'info',
          'RTCSession.terminate error message: ' +
            e.message +
            '\nstack: ' +
            e.stack +
            '\n',
        );
      }
    },
    _getLatestSessionId: function() {
      var sid, sessionId;

      sessionId = '';
      for (sid in this._sessionTable) {
        if (this._sessionTable[sid].sessionStatus !== 'terminated') {
          if (int(sid) > int(sessionId)) {
            sessionId = sid;
          }
        }
      }
      return sessionId;
    },
    _createLocalMedia: function(
      sessionId,
      stream,
      mediaConstraints,
      isNew,
      sourceSessionId,
    ) {
      if (sourceSessionId) {
        this._sessionLocalMediaTable[sessionId] = this._sessionLocalMediaTable[
          sourceSessionId
        ];
      } else {
        this._sessionLocalMediaTable[sessionId] = {
          localMediaStream: isNew ? stream : null,
          localMediaStreamForCall: stream,
          mediaConstraints: mediaConstraints,
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
          analyser: null,
          timestamp: +new Date(),
        };
      }
    },
    _connectLocalMediaToAudioNode: function(sessionId) {
      var analyser = null,
        connectorNode = null,
        environment,
        destinationNode = null,
        dtmfOscillatorTable = null,
        gainNode = null,
        mediaConstraints,
        mediaObject,
        oscillators = null,
        sourceNode = null,
        stream,
        volumePercent;

      mediaObject = this._sessionLocalMediaTable[sessionId];
      if (!mediaObject) {
        this._logger.log(
          'warn',
          'Not found local media of sessionId: ' + sessionId,
        );
        return;
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
        );
        return;
      }
      stream = mediaObject.localMediaStream;
      mediaConstraints = mediaObject.mediaConstraints;
      volumePercent = mediaObject.volumePercent;
      environment = this.getEnvironment();
      if (
        environment.gain &&
        stream &&
        mediaConstraints &&
        mediaConstraints.audio &&
        !mediaConstraints.video &&
        (!this.CHECK_CTX_STATE || this._audioContext.state === 'running')
      ) {
        if (int(this.analyserMode) === 1 && this._audioContext.createAnalyser) {
          // create analyser
          analyser = this._audioContext.createAnalyser();
        }

        // connect GainNode to control microphone volume
        gainNode = this._audioContext.createGain();
        sourceNode = this._audioContext.createMediaStreamSource(stream);
        destinationNode = this._audioContext.createMediaStreamDestination();
        sourceNode.connect(gainNode);
        connectorNode = gainNode;
        if (typeof this._mediaStreamConverter === 'function') {
          connectorNode = this._mediaStreamConverter(connectorNode, sessionId);
        }
        if (analyser) {
          connectorNode = connectorNode.connect(analyser);
        }
        connectorNode.connect(destinationNode);
        gainNode.gain.value = (this._masterVolume * volumePercent) / 100000;

        if (environment.oscillator && int(this.dtmfSendMode) === 1) {
          // prepare OscillatorNodes to send inband DTMF
          oscillators = {};
          dtmfOscillatorTable = {};

          [
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
            function(a) {
              var frequencies, tone;
              tone = a[0];
              frequencies = a[1];
              frequencies.forEach(
                function(frequency) {
                  var oscillatorNode, oscillatorGain;
                  if (oscillators[frequency]) {
                    return;
                  }
                  oscillatorNode = this._audioContext.createOscillator();
                  oscillatorGain = this._audioContext.createGain();
                  oscillatorNode.frequency.value = frequency;
                  oscillatorNode.connect(oscillatorGain);
                  oscillatorGain.connect(destinationNode);
                  oscillatorGain.gain.value = 0;
                  oscillatorNode.start(0);
                  oscillators[frequency] = {
                    oscillatorNode: oscillatorNode,
                    oscillatorGain: oscillatorGain,
                  };
                }.bind(this),
              );
              dtmfOscillatorTable[tone] = {
                lowerNode: oscillators[frequencies[0]].oscillatorNode,
                upperNode: oscillators[frequencies[1]].oscillatorNode,
                lowerGain: oscillators[frequencies[0]].oscillatorGain,
                upperGain: oscillators[frequencies[1]].oscillatorGain,
              };
            }.bind(this),
          );
        }

        mediaObject.localMediaStreamForCall = destinationNode.stream;
        mediaObject.gainNode = gainNode;
        mediaObject.sourceNode = sourceNode;
        mediaObject.destinationNode = destinationNode;
        mediaObject.oscillators = oscillators;
        mediaObject.dtmfOscillatorTable = dtmfOscillatorTable;
        mediaObject.analyser = analyser;
      }
    },
    _disposeLocalMedia: function(sessionId) {
      var existing = false,
        mediaObject,
        sid;

      mediaObject = this._sessionLocalMediaTable[sessionId];
      if (mediaObject) {
        for (sid in this._sessionLocalMediaTable) {
          if (
            sid !== string(sessionId) &&
            this._sessionLocalMediaTable[sid] === mediaObject
          ) {
            existing = true;
            break;
          }
        }
        if (!existing) {
          if (mediaObject.localMediaStream) {
            JsSIP.Utils.closeMediaStream(mediaObject.localMediaStream);
          }
          if (mediaObject.oscillators) {
            Object.keys(mediaObject.oscillators).forEach(function(i) {
              var oscillator = mediaObject.oscillators[i];
              try {
                oscillator.oscillatorGain.disconnect();
              } catch (e) {}
              try {
                oscillator.oscillatorNode.stop();
              } catch (e) {}
              try {
                oscillator.oscillatorNode.disconnect();
              } catch (e) {}
            });
          }
          if (mediaObject.gainNode) {
            try {
              mediaObject.gainNode.disconnect();
            } catch (e) {}
          }
          if (mediaObject.sourceNode) {
            try {
              mediaObject.sourceNode.disconnect();
            } catch (e) {}
          }
          if (mediaObject.destinationNode) {
            try {
              mediaObject.destinationNode.disconnect();
            } catch (e) {}
          }
          if (mediaObject.analyser) {
            try {
              mediaObject.analyser.disconnect();
            } catch (e) {}
          }
        }
        delete this._sessionLocalMediaTable[sessionId];
      }
    },
    _getRid: function(sessionId) {
      var rid = '',
        session;

      session = this._sessionTable[sessionId];
      if (
        session &&
        session.incomingMessage &&
        session.incomingMessage.getHeader
      ) {
        rid = string(session.incomingMessage.getHeader('X-PBX-Session-Info'));
        rid = rid.split(';');
        rid = string(rid[1]);
      }

      return rid;
    },
    _sendInfoXUaEx: function(sessionId, echo, withVideo, delay) {
      var session;

      if (delay) {
        setTimeout(
          by(this, this._sendInfoXUaEx, [sessionId, echo, withVideo, 0]),
          delay,
        );
        return;
      }
      session = this._sessionTable[sessionId];
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
                  echo: Boolean(echo),
                }),
              ) +
              ';' +
              session.exInfo,
          ],
        });
      } catch (e) {
        this._logger.log(
          'error',
          'session.rtcSession.sendInfo() failed: ' + stringifyError(e),
        );
      }
    },
    _putRemoteUserOptions: function(sessionId, xUaEx) {
      var exInfo = '',
        rtcInfo = null,
        session,
        user,
        withVideo,
        xUaExEntries,
        xUaExRtcInfo = '';

      session = this._sessionTable[sessionId];
      if (session && xUaEx) {
        xUaExEntries = string(xUaEx).split(';');
        xUaExEntries.forEach(function(s) {
          if (s.substr(0, 'rtcinfo='.length) === 'rtcinfo=') {
            xUaExRtcInfo = s;
          } else {
            if (exInfo !== '') {
              exInfo += ';';
            }
            exInfo += s;
          }
        });
        if (xUaExRtcInfo) {
          try {
            rtcInfo = JSON.parse(
              decodeURIComponent(xUaExRtcInfo.substr('rtcinfo='.length)),
            );
          } catch (e) {
            this._logger.log(
              'warn',
              'Cannot decode ' + xUaExRtcInfo + ' : ' + e.message,
            );
          }
        }
        if (rtcInfo && rtcInfo.echo) {
          this._sendInfoXUaEx(
            sessionId,
            false,
            null,
            Math.floor(Math.random() * 500) + 500,
          );
        }
        user = string(
          (rtcInfo && rtcInfo.user) ||
            (session.rtcSession && session.rtcSession.remote_identity.uri.user),
        );
        if (user) {
          withVideo = Boolean(rtcInfo && rtcInfo.withVideo);
          if (
            !session.remoteUserOptionsTable[user] ||
            session.remoteUserOptionsTable[user].withVideo !== withVideo ||
            session.remoteUserOptionsTable[user].exInfo !== exInfo
          ) {
            session.remoteUserOptionsTable[user] = {
              withVideo: withVideo,
              exInfo: exInfo,
            };
            return true;
          } else {
            // not changed
          }
        } else {
          this._logger.log('warn', 'Empty user: ' + xUaEx);
        }
      }
      return false;
    },

    /**
     * event listeners
     */
    _ua_registered: function(e) {
      this._uaStarting = false;
      if (this._vuaStarting) {
        try {
          this._vua.start();
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.start error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          );
          this._stopReasonInfo = {
            from: 'jssip',
            reason: e.message,
            response: null,
          };
          this.stopWebRTC(true);
        }
      } else {
        this._changePhoneStatus('started');
      }
    },
    _ua_unregistered: function(e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this._stopReasonInfo = {
          from: 'server',
          reason: string(data && data.cause),
          response: (data && data.response) || null,
        };
        setTimeout(by(this, this.stopWebRTC, [true]), 0);
        return;
      }
      this._changePhoneStatus('stopped');
      this._ua = null;
      this._user = '';
      this._videoClientUser = '';
    },
    _ua_registrationFailed: function(e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      this._logger.log(
        'warn',
        'UA.registrationFailed cause: ' + string(data && data.cause),
      );
      this._stopReasonInfo = {
        from: 'server',
        reason: string(data && data.cause),
        response: (data && data.response) || null,
      };
      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this.stopWebRTC(true);
      }
      this._changePhoneStatus('stopped');
      this._ua = null;
      this._user = '';
      this._videoClientUser = '';
    },
    _ua_newRTCSession: function(e) {
      var audio = false,
        data,
        options,
        sessionId,
        sessionStatus = '',
        video = false;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      jssipRtcSessionHack(data && data.session);

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
        );
        if (data.session.direction === 'outgoing') {
          // outgoing
          this._disposeLocalMedia('outgoing');
        }
        // terminate
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0);
        // do not create session
        return;
      }

      sessionId = string(++this._lastCreatedSessionId);
      sessionStatus = 'dialing';
      if (data.session.direction === 'outgoing') {
        if (this._sessionLocalMediaTable['outgoing']) {
          audio = this._sessionLocalMediaTable['outgoing'].mediaConstraints
            .audio;
          video = this._sessionLocalMediaTable['outgoing'].mediaConstraints
            .video;
          this._sessionLocalMediaTable[
            sessionId
          ] = this._sessionLocalMediaTable['outgoing'];
          delete this._sessionLocalMediaTable['outgoing'];
        }
      } else {
        if (data.request.body) {
          audio = data.request.body.indexOf('m=audio') >= 0;
          video = data.request.body.indexOf('m=video') >= 0;
        }
      }
      this._sessionTable[sessionId] = {
        sessionId: sessionId,
        sessionStatus: sessionStatus,
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
        mustRetryVideoCall: false,
      };
      this._sessionRemoteStreamsTable[sessionId] = [];
      if (data.session.direction === 'incoming') {
        this._putRemoteUserOptions(
          sessionId,
          data.request.getHeader('X-UA-EX'),
        );
      }

      // attach JsSIP.RTCSession event listeners
      data.session.on(
        'progress',
        by(this, this._rtcSession_progress, [sessionId]),
      );
      data.session.on(
        'accepted',
        by(this, this._rtcSession_accepted, [sessionId]),
      );
      data.session.on(
        'notifiedSessionInfo',
        by(this, this._rtcSession_notifiedSessionInfo, [sessionId]),
      );
      data.session.on(
        'newInfo',
        by(this, this._rtcSession_newInfo, [sessionId]),
      );
      data.session.on('failed', by(this, this._rtcSession_ended, [sessionId]));
      data.session.on('ended', by(this, this._rtcSession_ended, [sessionId]));
      if (data.session.connection) {
        // outgoing
        data.session.connection.ontrack = by(this, this._rtcSession_ontrack, [
          sessionId,
        ]);
        data.session.connection.onaddstream = data.session.connection.ontrack;
      } else {
        // incoming
        data.session.on(
          'peerconnection',
          by(this, this._rtcSession_peerconnection, [sessionId]),
        );
      }

      if (data.session.direction === 'incoming') {
        if (this.defaultOptions && this.defaultOptions.withVideo) {
          if (this._vua) {
            this._sessionTable[sessionId].withVideo = true;
            this._sessionTable[sessionId].videoOptions =
              clone(this.defaultOptions && this.defaultOptions.videoOptions) ||
              {};
          } else {
            this._logger.log('warn', 'Video client unavailable');
          }
        }
        if (this.defaultOptions && this.defaultOptions.exInfo) {
          this._sessionTable[sessionId].exInfo = string(
            this.defaultOptions && this.defaultOptions.exInfo,
          );
        }

        if (
          this.autoAnswer ||
          (this.ctiAutoAnswer &&
            string(data.request.getHeader('Call-Info')).indexOf(
              'answer-after=0',
            ) >= 0)
        ) {
          // auto answer

          if (this._sessionTable[sessionId].withVideo) {
            setTimeout(by(this, this._tryVideoCall, [sessionId]), 0);
          }

          options =
            clone(
              this.defaultOptions &&
                this.defaultOptions.main &&
                this.defaultOptions.main.answer,
            ) || {};
          if (!options.mediaConstraints) {
            options.mediaConstraints = { audio: true, video: false };
          }
          if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
            options.pcConfig = clone(options.pcConfig) || {};
            options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout;
          }

          // answer
          this._sessionTable[sessionId].answeringStarted = true;
          setTimeout(
            by(this, this._doAnswer, [
              sessionId,
              options,
              data.session,
              null,
              by(this, this._answerFailed, [
                {
                  sessionId: sessionId,
                  target: null,
                  options: options,
                  client: 'main',
                },
              ]),
            ]),
            0,
          );
        }
      }

      this._emitEvent('sessionCreated', this.getSession(sessionId));
    },
    _vua_registered: function(e) {
      this._vuaStarting = false;
      if (this._uaStarting) {
        try {
          this._ua.start();
        } catch (e) {
          this._logger.log(
            'warn',
            'UA.start error message: ' +
              e.message +
              '\nstack: ' +
              e.stack +
              '\n',
          );
          this._stopReasonInfo = {
            from: 'jssip',
            reason: e.message,
            response: null,
          };
          this.stopWebRTC(true);
        }
      } else {
        this._changePhoneStatus('started');
      }
    },
    _vua_unregistered: function(e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this._stopReasonInfo = {
          from: 'server',
          reason: string(data && data.cause),
          response: (data && data.response) || null,
        };
        setTimeout(by(this, this.stopWebRTC, [true]), 0);
        return;
      }
      this._vua = null;
    },
    _vua_registrationFailed: function(e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      this._logger.log('warn', 'UA.registrationFailed cause: ' + data.cause);
      if (this._phoneStatus !== 'stopping' && this._phoneStatus !== 'stopped') {
        this._stopReasonInfo = {
          from: 'server',
          reason: string(data && data.cause),
          response: (data && data.response) || null,
        };
        this.stopWebRTC(true);
      }
      this._vua = null;
    },
    _vua_newRTCSession: function(e, count) {
      var data,
        doAnswerFunc,
        i = 0,
        member,
        members,
        options,
        r,
        rid,
        self = this,
        sessionId,
        sid,
        sourceSessionId = null,
        videoClientSessionId;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      jssipRtcSessionHack(data && data.session);

      if (!data || !data.session || data.session.isEnded()) {
        // already ended
        this._logger.log('debug', 'Video client session already ended');
        return;
      }

      if (this._phoneStatus !== 'started') {
        this._logger.log(
          'info',
          'Terminate video client session: phoneStatus: ' + this._phoneStatus,
        );
        if (data.session.direction === 'outgoing') {
          // outgoing
          this._disposeLocalMedia('outgoing');
        }
        // terminate
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0);
        // do not create video client session
        return;
      }

      videoClientSessionId = 'v' + ++this._lastCreatedVideoClientSessionId;

      // specify member and main session
      sessionId = '';
      rid = '';
      member = null;
      for (sid in this._sessionTable) {
        if (this._sessionTable[sid].withVideo) {
          r = this._getRid(sid);
          members = (this._ridMembersTable[r] || {}).members || [];
          for (i = 0; i < members.length; i++) {
            if (members[i].phone_id === data.session.remote_identity.uri.user) {
              member = members[i];
              break;
            }
          }
          if (member) {
            sessionId = sid;
            rid = r;
            break;
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
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0);

        // try video call (earlier id -> later id)
        setTimeout(by(this, this._tryVideoCall, [sessionId]), 0);
      } else if (sessionId && rid && member) {
        // specify ok

        if (data.session.direction === 'outgoing') {
          // outgoing
          if (this._sessionLocalMediaTable['outgoing']) {
            this._sessionLocalMediaTable[
              videoClientSessionId
            ] = this._sessionLocalMediaTable['outgoing'];
            delete this._sessionLocalMediaTable['outgoing'];
          }
        }

        // create video client session
        if (!this._ridVideoClientSessionsTable[rid]) {
          this._ridVideoClientSessionsTable[rid] = {};
        } else {
          sourceSessionId =
            Object.keys(this._ridVideoClientSessionsTable[rid]).pop() || null;
        }
        this._ridVideoClientSessionsTable[rid][videoClientSessionId] = {
          member: member,
          rtcSession: data.session,
        };
        this._sessionRemoteStreamsTable[videoClientSessionId] = [];
        member.videoClientSessionId = videoClientSessionId;

        // attach JsSIP.RTCSession event listeners
        data.session.on(
          'accepted',
          by(this, this._videoClientRtcSession_accepted, [
            videoClientSessionId,
            sessionId,
          ]),
        );
        data.session.on(
          'failed',
          by(this, this._videoClientRtcSession_ended, [
            videoClientSessionId,
            sessionId,
          ]),
        );
        data.session.on(
          'ended',
          by(this, this._videoClientRtcSession_ended, [
            videoClientSessionId,
            sessionId,
          ]),
        );
        if (data.session.connection) {
          // outgoing
          data.session.connection.ontrack = by(
            this,
            this._videoClientRtcSession_ontrack,
            [videoClientSessionId, sessionId],
          );
          data.session.connection.onaddstream = data.session.connection.ontrack;
        } else {
          // incoming
          data.session.on(
            'peerconnection',
            by(this, this._videoClientRtcSession_peerconnection, [
              videoClientSessionId,
              sessionId,
            ]),
          );
        }

        if (data.session.direction === 'incoming') {
          // answer
          options =
            clone(
              this._sessionTable[sessionId].videoOptions &&
                this._sessionTable[sessionId].videoOptions.answer,
            ) || {};
          if (!options.mediaConstraints) {
            options.mediaConstraints = { audio: false, video: true };
          }
          if (!options.pcConfig || !options.pcConfig.gatheringTimeout) {
            options.pcConfig = clone(options.pcConfig) || {};
            options.pcConfig.gatheringTimeout = this._defaultGatheringTimeout;
          }
          if (
            !this._sessionTable[sessionId].videoOptions ||
            !this._sessionTable[sessionId].videoOptions.shareStream
          ) {
            sourceSessionId = null;
          }
          doAnswerFunc = function() {
            if (!self._sessionTable[sessionId]) {
              self._logger.log(
                'info',
                'Cannot to answer video session (main session terminated)',
              );
            } else if (!data || !data.session || data.session.status !== 4) {
              self._logger.log(
                'info',
                'Cannot to answer video session (video session status: ' +
                  (data && data.session && data.session.status) +
                  ')',
              );
            } else if (
              sourceSessionId &&
              !self._sessionLocalMediaTable[sourceSessionId]
            ) {
              // wait for creating previous local media
              setTimeout(doAnswerFunc, 1000);
            } else {
              self._doAnswer(
                videoClientSessionId,
                options,
                data.session,
                sourceSessionId,
                by(self, self._answerFailed, [
                  {
                    sessionId: sessionId,
                    target: null,
                    options: options,
                    client: 'video',
                  },
                ]),
              );
            }
          };
          setTimeout(doAnswerFunc, 0);
        }

        if (this._sessionTable[sessionId].mustRetryVideoCall) {
          this._sessionTable[sessionId].mustRetryVideoCall = false;
          this._tryVideoCall(sessionId);
        }
      } else {
        // cannot specify member or main session

        if (data.session.direction === 'outgoing') {
          // outgoing
          this._disposeLocalMedia('outgoing');
        } else {
          // incoming, but informations (session, rid, members) have not been prepared
          count = count || 0;
          if (!count) {
            // first try
            // wait and retry
            setTimeout(by(this, this._vua_newRTCSession, [e, count + 1]), 1000);
            return;
          } else {
            // retry
            // to terminate
          }
        }

        // terminate
        setTimeout(by(this, this._terminateRtcSession, [data.session]), 0);
        // do not create video client session
        return;
      }
    },
    _vua_newNotify: function(e) {
      var body2 = [],
        data,
        i = 0,
        me = {},
        members = [],
        member2 = [],
        rid = '',
        sessionId;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      if (!data) {
        this._logger.log('warn', 'newNotify data empty');
        return;
      }
      if (!data.request) {
        this._logger.log('warn', 'newNotify request empty');
        return;
      }
      if (data.request.getHeader('Event') !== 'x-video-client') {
        this._logger.log(
          'warn',
          'newNotify invalid header Event: ' + data.request.getHeader('Event'),
        );
        return;
      }
      if (!data.request.body) {
        this._logger.log('warn', 'newNotify body empty');
        return;
      }

      // <rid>#<user 1>|<phone_id 1>|<talker_id 1>|<talker_attr 1>|<talker_hold 1>#<user 2>|<phone_id 2>|<talker_id 2>|<talker_attr 2>|<talker_hold 2>
      body2 = data.request.body.split('#');
      rid = body2[0];
      if (!rid) {
        this._logger.log('warn', 'newNotify rid empty');
        return;
      }
      me = {};
      members = [];
      for (i = 1; i < body2.length; i++) {
        member2 = body2[i].split('|');
        members.push({
          user: member2[0] || '',
          phone_id: member2[1] || '',
          talker_id: member2[2] || '',
          talker_attr: member2[3] || '',
          talker_hold: member2[4] || '',
        });
        if (this._videoClientUser === member2[1]) {
          me = members[members.length - 1];
        }
      }

      this._ridMembersTable[rid] = {
        members: members,
        me: me,
      };

      for (sessionId in this._sessionTable) {
        if (this._getRid(sessionId) === rid) {
          this._tryVideoCall(sessionId);
          break;
        }
      }
    },
    _rtcSession_progress: function(sessionId, e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      this._sessionTable[sessionId].sessionStatus = 'progress';
      if (data && data.response) {
        this._sessionTable[sessionId].incomingMessage = data.response;
        if (
          this._putRemoteUserOptions(
            sessionId,
            data.response.getHeader('X-UA-EX'),
          )
        ) {
          this._emitEvent(
            'remoteUserOptionsChanged',
            this.getSession(sessionId),
          );
        }
        this._tryVideoCall(sessionId);
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId));
    },
    _rtcSession_accepted: function(sessionId, e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      this._sessionTable[sessionId].sessionStatus = 'connected';
      if (data && data.response) {
        this._sessionTable[sessionId].incomingMessage = data.response;
        if (
          this._putRemoteUserOptions(
            sessionId,
            data.response.getHeader('X-UA-EX'),
          )
        ) {
          this._emitEvent(
            'remoteUserOptionsChanged',
            this.getSession(sessionId),
          );
        }
        this._tryVideoCall(sessionId);
      }
      if (
        this._sessionTable[sessionId].mainMuted &&
        this._sessionTable[sessionId].rtcSession &&
        this._sessionTable[sessionId].rtcSession.isEstablished()
      ) {
        this._sessionTable[sessionId].rtcSession.mute({
          audio: true,
          video: true,
        });
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId));
    },
    _rtcSession_notifiedSessionInfo: function(sessionId, e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      if (data && data.request) {
        this._sessionTable[sessionId].incomingMessage = data.request;
        this._tryVideoCall(sessionId);
        if (
          Object.keys(this._sessionTable[sessionId].remoteUserOptionsTable)
            .length === 0
        ) {
          this._sendInfoXUaEx(sessionId, true, null, 0);
        }
      }
      this._emitEvent('sessionStatusChanged', this.getSession(sessionId));
    },
    _rtcSession_newInfo: function(sessionId, e) {
      var data;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

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
          );
        }
      }
    },
    _rtcSession_ended: function(sessionId, e) {
      var data,
        rid = '',
        session,
        videoClientSessionId;

      data = e.data || e; // jssip ~0.5: e.data, jssip 0.6~: e

      rid = this._getRid(sessionId);
      if (rid) {
        if (this._ridVideoClientSessionsTable[rid]) {
          for (videoClientSessionId in this._ridVideoClientSessionsTable[rid]) {
            setTimeout(
              by(this, this._terminateRtcSession, [
                this._ridVideoClientSessionsTable[rid][videoClientSessionId]
                  .rtcSession,
              ]),
              0,
            );
            this._videoClientRtcSession_ended(videoClientSessionId, sessionId);
          }
        }
        if (this._ridMembersTable[rid]) {
          delete this._ridMembersTable[rid];
        }
      }

      this._sessionTable[sessionId].sessionStatus = 'terminated';
      if (data && data.message) {
        this._sessionTable[sessionId].incomingMessage = data.message;
      }
      session = this.getSession(sessionId);

      delete this._sessionTable[sessionId];
      delete this._sessionRemoteStreamsTable[sessionId];
      this._disposeLocalMedia(sessionId);
      this._emitEvent('sessionStatusChanged', session);
    },
    _rtcSession_ontrack: function(sessionId, e) {
      var index, stream;

      stream = e.streams && e.streams[0];
      stream = stream || e.stream; // Support old onaddstream
      if (stream) {
        if (this._sessionRemoteStreamsTable[sessionId]) {
          index = this._sessionRemoteStreamsTable[sessionId].indexOf(stream);
          if (index === -1) {
            this._sessionRemoteStreamsTable[sessionId].push(stream);
            this._emitEvent('sessionStatusChanged', this.getSession(sessionId));
          } else {
            this._logger.log(
              'debug',
              '_rtcSession_ontrack occurred but stream already exists',
            );
          }
        } else {
          this._logger.log(
            'warn',
            '_rtcSession_ontrack occurred but _sessionRemoteStreamsTable[' +
              sessionId +
              '] is not defined',
          );
        }
      } else {
        this._logger.log(
          'warn',
          '_rtcSession_ontrack occurred with invalid e.streams: ' + e.streams,
        );
      }
    },
    _rtcSession_peerconnection: function(sessionId, e) {
      if (e.peerconnection) {
        e.peerconnection.ontrack = by(this, this._rtcSession_ontrack, [
          sessionId,
        ]);
        e.peerconnection.onaddstream = e.peerconnection.ontrack;
      }
    },
    _rtcSession_responseAfterMakeCallWithVideo: function(
      self,
      videoOptions,
      orgFunc,
      e,
    ) {
      // this: RTCSession
      var rtcSession = this,
        session,
        sessionId;

      // set videoOptions to session
      for (sessionId in self._sessionTable) {
        session = self._sessionTable[sessionId];
        if (session.rtcSession === rtcSession) {
          if (!session.videoOptions) {
            session.videoOptions = videoOptions;
            // make video call when members (phone_ids) have been notified
            self._tryVideoCall(sessionId);
          }
        }
      }

      if (orgFunc) {
        orgFunc.call(this, e);
      }
    },
    _videoClientRtcSession_accepted: function(videoClientSessionId, sessionId) {
      var rid;

      rid = this._getRid(sessionId);
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
        ].rtcSession.mute({ audio: true, video: true });
      }
    },
    _videoClientRtcSession_ended: function(videoClientSessionId, sessionId) {
      var r;

      for (r in this._ridVideoClientSessionsTable) {
        if (this._ridVideoClientSessionsTable[r][videoClientSessionId]) {
          delete this._ridVideoClientSessionsTable[r][videoClientSessionId];
          if (Object.keys(this._ridVideoClientSessionsTable[r]).length === 0) {
            delete this._ridVideoClientSessionsTable[r];
          }
          break;
        }
      }
      delete this._sessionRemoteStreamsTable[videoClientSessionId];
      this._disposeLocalMedia(videoClientSessionId);

      if (this._sessionTable[sessionId]) {
        this._emitEvent('videoClientSessionEnded', {
          sessionId: string(sessionId),
          videoClientSessionId: string(videoClientSessionId),
        });
      }
    },
    _videoClientRtcSession_ontrack: function(
      videoClientSessionId,
      sessionId,
      e,
    ) {
      var index, stream;

      stream = e.streams && e.streams[0];
      stream = stream || e.stream; // Support old onaddstream
      if (stream) {
        if (this._sessionRemoteStreamsTable[videoClientSessionId]) {
          if (this._sessionTable[sessionId]) {
            index = this._sessionRemoteStreamsTable[
              videoClientSessionId
            ].indexOf(stream);
            if (index === -1) {
              this._sessionRemoteStreamsTable[videoClientSessionId].push(
                stream,
              );

              this._emitEvent('videoClientSessionCreated', {
                sessionId: string(sessionId),
                videoClientSessionId: string(videoClientSessionId),
              });
            } else {
              this._logger.log(
                'debug',
                '_videoClientRtcSession_ontrack occurred but stream already exists',
              );
            }
          } else {
            this._logger.log(
              'warn',
              '_videoClientRtcSession_ontrack occurred but _sessionTable[' +
                sessionId +
                '] is not defined',
            );
          }
        } else {
          this._logger.log(
            'warn',
            '_videoClientRtcSession_ontrack occurred but _sessionRemoteStreamsTable[' +
              videoClientSessionId +
              '] is not defined',
          );
        }
      } else {
        this._logger.log(
          'warn',
          '_videoClientRtcSession_ontrack occurred with invalid e.streams: ' +
            e.streams,
        );
      }
    },
    _videoClientRtcSession_peerconnection: function(
      videoClientSessionId,
      sessionId,
      e,
    ) {
      if (e.peerconnection) {
        e.peerconnection.ontrack = by(
          this,
          this._videoClientRtcSession_ontrack,
          [videoClientSessionId, sessionId],
        );
        e.peerconnection.onaddstream = e.peerconnection.ontrack;
      }
    },

    END_OF_PROTOTYPE: null,
  };

  /**
   * class Brekeke.WebrtcClient.Logger
   */
  Logger = function(level, func, withStackTrace) {
    var self = this;

    /**
     * fields
     */
    this._levelValue =
      level in this.LEVEL_VALUES
        ? this.LEVEL_VALUES[level]
        : this.LEVEL_VALUES['log'];
    this._logFunction = func;
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
        : withStackTrace;
    this._stackTraceHeaderLength = -2;

    // trial logging to initialize stackTraceHeaderLength
    (function TRIAL_LOGGING() {
      self.log('trial', 'logger initialized (' + self._levelValue + ')');
    })();
  };
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
    setLoggerLevel: function(level) {
      this._levelValue =
        level in this.LEVEL_VALUES
          ? this.LEVEL_VALUES[level]
          : this.LEVEL_VALUES['log'];
    },

    /**
     * function setLogFunction
     */
    setLogFunction: function(func) {
      this._logFunction = func;
    },

    /**
     * function log
     */
    log: function(level, content) {
      var stackTrace = '';

      try {
        if (this.LEVEL_VALUES[level] <= this._levelValue) {
          if (this._withStackTrace[level] || level === 'trial') {
            // get stack trace
            try {
              throw new Error();
            } catch (e) {
              stackTrace = String(e.stack);
            }
            if (this._stackTraceHeaderLength === -2) {
              // uninitialized
              // trial logging to initialize stackTraceHeaderLength
              this._stackTraceHeaderLength = stackTrace.indexOf(
                'TRIAL_LOGGING',
              );
            }
            if (this._stackTraceHeaderLength >= 0) {
              // OK
              // print stack trace from caller (cut header)
              stackTrace =
                ' @ ' + stackTrace.substr(this._stackTraceHeaderLength);
            } else {
              // failed to initialize stackTraceHeaderLength
              // print full stack trace
              stackTrace = ' : ' + stackTrace;
            }
          }
          if (this._logFunction) {
            if (!this._logFunction(level, content, stackTrace)) {
              this._logFunctionDefault(level, content, stackTrace);
            }
          } else {
            this._logFunctionDefault(level, content, stackTrace);
          }
        }
      } catch (e) {}
    },

    /**
     * private functions
     */
    _logFunctionDefault: function(level, content, stackTrace) {
      var func;

      if (console) {
        if (level === 'fatal') {
          func = console.error || console.log;
        } else if (level === 'error') {
          func = console.error || console.log;
        } else if (level === 'warn') {
          func = console.warn || console.log;
        } else if (level === 'info') {
          func = console.info || console.log;
        } else if (level === 'debug') {
          func = console.debug || console.log;
        } else if (level === 'trace') {
          func = console.debug || console.log;
        } else {
          func = console.log;
        }
        if (func) {
          func.call(
            console,
            new Date() + '[' + level + '] ' + content + stackTrace,
          );
          if (typeof content === 'object') {
            console.dir(content);
          }
        }
      }
    },

    END_OF_PROTOTYPE: null,
  };

  /**
   * jssipHack function
   */
  jssipHack = (function() {
    var orig = null;
    return function jssipHack() {
      if (orig || typeof JsSIP === 'undefined') {
        return;
      }
      orig = {};
      if (JsSIP.Utils && JsSIP.Utils.escapeUser) {
        orig.Utils_escapeUser = JsSIP.Utils.escapeUser;
        JsSIP.Utils.escapeUser = function(user) {
          return string(orig.Utils_escapeUser(user)).replace(/%3D/gi, '=');
        };
      }
      if (JsSIP.UA && JsSIP.UA.prototype && JsSIP.UA.prototype.receiveRequest) {
        orig.UA_receiveRequest = JsSIP.UA.prototype.receiveRequest;
        JsSIP.UA.prototype.receiveRequest = function(request) {
          jssipIncomingRequestHack(request);
          orig.UA_receiveRequest.apply(this, arguments);
          if (
            request &&
            !request.to_tag &&
            request.method === 'NOTIFY' &&
            this.listeners('newNotify').length
          ) {
            this.emit('newNotify', { request: request });
          }
        };
      }
    };
  })();

  /**
   * jssipRtcSessionHack function
   */
  jssipRtcSessionHack = (function() {
    var orig = null;
    return function jssipRtcSessionHack(rtcSession) {
      var proto;

      if (
        orig ||
        typeof rtcSession === 'undefined' ||
        typeof rtcSession.receiveRequest !== 'function' ||
        typeof rtcSession._receiveNotify !== 'function'
      ) {
        return;
      }
      orig = {};
      proto = Object.getPrototypeOf(rtcSession);
      if (proto && proto.receiveRequest) {
        orig.receiveRequest = proto.receiveRequest;
        proto.receiveRequest = function(request) {
          if (
            request &&
            request.method === 'INFO' &&
            request.headers &&
            request.headers['X-Ua-Ex'] &&
            !request.headers['Content-Type']
          ) {
            request.headers['Content-Type'] = [{ raw: 'application/x-ua-ex' }];
          }
          orig.receiveRequest.apply(this, arguments);
        };
      }
      if (proto && proto._receiveNotify) {
        orig._receiveNotify = proto._receiveNotify;
        proto._receiveNotify = function(request) {
          if (
            request &&
            request.event &&
            request.event.event === 'session-info' &&
            this.listeners('notifiedSessionInfo').length
          ) {
            this.emit('notifiedSessionInfo', {
              originator: 'remote',
              request: request,
            });
            request.reply(200);
            return;
          }
          orig._receiveNotify.apply(this, arguments);
        };
      }
    };
  })();

  /**
   * jssipIncomingRequestHack function
   */
  jssipIncomingRequestHack = (function() {
    var orig = null;
    return function jssipIncomingRequestHack(incomingRequest) {
      var proto;

      if (
        orig ||
        typeof incomingRequest === 'undefined' ||
        typeof incomingRequest.reply !== 'function'
      ) {
        return;
      }
      orig = {};
      proto = Object.getPrototypeOf(incomingRequest);
      if (proto && proto.reply) {
        orig.reply = proto.reply;
        proto.reply = function(
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
            );
          } else {
            orig.reply.apply(this, arguments);
          }
        };
      }
    };
  })();

  /**
   * utility functions
   */
  by = function(thisArg, func, argsArray) {
    // return function
    return function() {
      // if argsArray is not given, returned function calls func with arguments of itself
      return func.apply(
        thisArg || this,
        (argsArray || []).concat(Array.prototype.slice.call(arguments)),
      );
    };
  };
  clone = function(object) {
    var key, returnObject;

    if (object && typeof object === 'object') {
      // memberwise clone (shallow copy)
      returnObject = {};
      for (key in object) {
        returnObject[key] = object[key];
      }
      return returnObject;
    } else {
      return object;
    }
  };
  stringifyError = function(object) {
    var key, returnString;

    if (object && typeof object === 'object') {
      returnString = '';
      if (typeof object.toString === 'function') {
        returnString = object.toString();
      }
      if (returnString) {
        return returnString;
      }
      returnString = '';
      for (key in object) {
        returnString += string(key) + ': ' + string(object[key]) + ', ';
      }
      if (returnString.length > 2) {
        returnString = returnString.substr(0, returnString.length - 2);
      }
      return returnString;
    } else {
      return string(object);
    }
  };
  int = function(value) {
    return parseInt(value, 10) || 0;
  };
  string = function(value) {
    return String(value || value === 0 || value === false ? value : '');
  };

  // publicize Brekeke.WebrtcClient.Phone
  WebrtcClient.Phone = Phone;
  // publicize Brekeke.WebrtcClient.Logger
  WebrtcClient.Logger = Logger;
})(Brekeke.WebrtcClient);
