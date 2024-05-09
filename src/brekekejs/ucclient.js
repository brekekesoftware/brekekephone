/* eslint-disable */

/* ucclient.js 1.2.9.6u2294
 * require jsonrpc.js
 * require jssip-0.4.2.js (optional)
 * require webrtc.js (optional)
 */

import './jsonrpc'

if (typeof Brekeke === 'undefined' || typeof Brekeke.net === 'undefined') {
  console.error('jsonrpc has not been loaded.')
}
var UCClient = {}
var ChatClient
var Errors = {
  /*
   * Error codes
   */
  RPC_CLOSED: 4001,
  RPC_ERROR: 4002,
  PING_TIMEOUT: 4003,
  NOT_SIGNED_IN: 4100,
  SIGNING_IN: 4101,
  SIGNED_IN: 4102,
  WEBRTC_NOT_LOADED: 4103,
  WEBRTC_NOT_SUPPORTED: 4104,
  SIGN_IN_TIMEOUT: 4105,
  UPLOADPROFILEIMAGE_EMPTY_FORM: 4106,
  UPLOADPROFILEIMAGE_TIMEOUT: 4107,
  UPLOADPROFILEIMAGE_FAILED: 4108,
  SENDTEXT_EMPTY_USER: 4109,
  READTEXT_EMPTY_ID: 4110,
  READTEXT_INVALID_ID: 4111,
  SENDBROADCASTTEXT_EMPTY_TARGET: 4112,
  SENDBROADCASTTEXT_EMPTY_USER: 4113,
  SENDTYPING_EMPTY_USER: 4114,
  CREATECONFERENCE_EMPTY_SUBJECT: 4115,
  INVITETOCONFERENCE_NOT_FOUND_CONF: 4116,
  INVITETOCONFERENCE_EMPTY_INVITE: 4117,
  SENDCONFERENCETEXT_NOT_FOUND_CONF: 4118,
  SENDFILE_EMPTY_USER: 4119,
  SENDFILE_EMPTY_FORM: 4120,
  SENDFILE_EMPTY_FILES: 4121,
  SENDFILE_EMPTY_VALUE: 4122,
  SENDFILES_EMPTY_USER: 4123,
  SENDFILES_EMPTY_FILELIST: 4124,
  ACCEPTFILE_NOT_FOUND_FILE: 4125,
  ACCEPTFILE_INVALID_STATE: 4126,
  CANCELFILE_NOT_FOUND_FILE: 4127,
  CANCELFILE_INVALID_STATE: 4128,
  MAKECALL_WEBRTC_UNAVAILABLE: 4129,
  MAKECALL_EMPTY_TARGET: 4130,
  MAKECALL_EMPTY_CONSTRAINTS: 4131,
  MAKECALL_INVALID_CALL: 4132,
  MAKECALL_PNUMBER: 4133,
  MAKECALL_NOT_JOINED_CONF: 4134,
  MAKECALL_DUPLICATE: 4135,
  MAKECALL_SEND_TIMEOUT: 4136,
  MAKECALL_TIMEOUT: 4137,
  SEARCHTOPICSBYDATE_INVALID_DATE: 4138,
  SEARCHLOGSBYTOPIC_INVALID_TOPIC: 4139,
  INVALID_USER_TYPE: 4140,
  WEBRTC_PERMANENTLY_UNAVAILABLE: 4141,
  WEBRTC_TEMPORARILY_UNAVAILABLE: 4142,
  WEBRTC_ERROR_3: 4143,
  WEBRTC_ERROR_4: 4144,
  SENDFILES_FORMDATA_NOT_SUPPORTED: 4145,
  PLEONASTIC_LOGIN: 6001,
  UPDATE_STARTED: 6003,
  LOGIN_FAILED: 0,
  TIMEOUT: -1,
  DISCONNECTED: -2,
  NOT_OPENED: -3,
  UNKNOWN_RESPONSE: -4,
  UNKNOWN_ERROR: -30,
  IP_NOT_ALLOWED: -40,
  SERVER_INTERNAL_ERROR: -50,
  USER_INVALID: -60,
  TENANT_INVALID: -61,
  OVER_MAX_LOGIN_COUNT: -70,
  OVER_MAX_TENANT_LOGIN_COUNT: -71,
  ALREADY_SIGNED_IN: -72,
  LICENSE_INVALID: -80,
  VERSION_INVALID: -81,
  PASSWORD_REQUIRED: -90,
  SENDTEXT_NOT_A_MEMBER: -500,
  JOINCONFERENCE_NOT_A_MEMBER: -600,
  SETTENANTSETTINGS_SERVER_ERROR: -701,
  GETTENANTLISTFROMPBX_SERVER_ERROR: -711,
  PREPAREPROFILEIMAGE_FILE: -752,
  PREPAREPROFILEIMAGE_PERMISSION: -753,
  SAVEPROFILEIMAGE_FILE: -762,
  DELETEPROFILEIMAGE_PERMISSION: -773,
  SETPROPERTIES_1001: -1001,
  SETPROPERTIES_1002: -1002,
  SETPROPERTIES_1003: -1003,
  SETPROPERTIES_1004: -1004,
  SETPROPERTIES_1005: -1005,
  SETPROPERTIES_1006: -1006,
  GENERAL_ERROR_INTERNAL: -2000,
  GENERAL_ERROR_ARGUMENT: -2001,
  GENERAL_ERROR_PERMISSION: -2002,
  ERROR_REENTER_CONF: -2100,
  DUMMY: null,
}
var Constants = {
  STATUS_OFFLINE: 0,
  STATUS_AVAILABLE: 1,
  STATUS_IDLE: 2,
  STATUS_BUSY: 3,
  USER_TYPE_SYSTEM_ADMIN: 1,
  USER_TYPE_TENANT_ADMIN: 2,
  USER_TYPE_TENANT_USER: 3,
  USER_TYPE_TENANT_GUEST: 4,
  BUDDY_MODE_MANUAL: 0,
  BUDDY_MODE_AUTO: 1,
  BUDDY_MODE_GROUP: 2,
  CONF_STATUS_INACTIVE: 0,
  CONF_STATUS_INVITED: 1,
  CONF_STATUS_JOINED: 2,
  CONF_STATUS_LEFT: 3,
  CONF_STATUS_LEFT_UNANSWERED: 4,
  CONF_STATUS_INVITED_WEBCHAT: 5,
  FILE_STATUS_UNPREPARED: 0,
  FILE_STATUS_UNACCEPTED: 1,
  FILE_STATUS_TRANSFERRING: 2,
  FILE_STATUS_COMPLETED: 3,
  FILE_STATUS_LOCAL_CANCEL: 4,
  FILE_STATUS_REMOTE_CANCEL: 5,
  FILE_STATUS_ERROR: 6,
  CALL_STATUS_TERMINATED: 0,
  CALL_STATUS_INCOMING: 1,
  CALL_STATUS_ANSWERING: 2,
  CALL_STATUS_DIALING: 3,
  CALL_STATUS_PROGRESS: 4,
  CALL_STATUS_TALKING: 5,
  CALL_DIRECTION_UNKNOWN: 0,
  CALL_DIRECTION_INCOMING: 1,
  CALL_DIRECTION_OUTGOING: 2,
  STREAM_STATUS_DIALING: 3,
  STREAM_STATUS_TALKING: 5,
  CTYPE_TEXT: 1,
  CTYPE_FILE_REQUEST: 5,
  CTYPE_FILE_ACCEPT: 6,
  CTYPE_FILE_REJECT: 7,
  CTYPE_FILE_CANCEL: 8,
  CTYPE_FILE_PROGRESS: 9,
  CTYPE_CALL_RESULT: 26,
  CTYPE_CONF_START: 27,
  CTYPE_CONF_LEAVE: 28,
  CTYPE_OBJECT: 101,
  PROFILE_IMAGE_URL_DOWNLOAD: '/image?ACTION=DOWNLOAD',
  NOIMAGE_URL: '/img/noimage.png',
  DUMMY: null,
}
var Events = [
  'forcedSignOut',
  'buddyStatusChanged',
  'receivedText',
  'receivedTyping',
  'invitedToConference',
  'conferenceMemberChanged',
  'extConfInfoChanged',
  'confTagUpdated',
  'fileReceived',
  'fileInfoChanged',
  'fileTerminated',
  'objectReceived',
  'confLeaveReceived',
  'phoneStatusChanged',
  'callReceived',
  'callInfoChanged',
  'callTerminated',
  'receivedCustomClientEvent',
  'notifiedUserSearch',
  'notifiedUserDelete',
  'debugLogFilePrepared',
]

/*
 * ChatClient constructor
 */
ChatClient = function (logger, reportConsoleOptions) {
  /*
   * Private fields
   */
  ReportConsole(reportConsoleOptions)
  this._logger = logger && logger.log ? logger : new Logger(logger)

  this._host = null
  this._path = null
  this._tenant = null
  this._user_id = null
  this._pass = null
  this._forceAjax = false
  this._servlet = false
  this._useHttps = false
  this._auth_timeout = 0
  this._admin_mode = false
  this._modest = false
  this._recvMsgs = false
  this._pver = ''
  this._profileImageSize = ''
  this._crAuthMode = 0

  this._profile = {}
  this._settings = {}
  this._buddylist = {}
  this._buddylistOrg = {}
  this._nonbuddylist = {}
  this._nonsubscrlist = {}
  this._allUsers = {}
  this._configProperties = {}
  this._signedInInfo = {}
  this._status = 0
  this._display = ''
  this._buddyStatus = {}

  this._phone = null
  this._phoneProperties = {}
  this._phoneRegistered = false
  this._buddyPhone = {}

  this._sessionBundleIdCounter = 0
  this._sessionBundleTable = {}

  this._conferenceCalls = {}

  this._upload_ids = {}
  this._download_keys = {}
  this._ucclient_customized_status_table = {}

  this._conferences = {}

  this._fileInfos = {}

  this._topicIdCounter = 0
  this._topics = {}

  this._databaseTaskTable = {}

  this._eventListeners = {}
  this._handlers = []
  this._eventListeners0 = {}

  this._rpc = null

  this._signInStatus = 0 // 0:signed-out 1:sign-in-failed 2:signing-in 3:signed-in
  this._signInTimer = null
  this._signInFuncOK = null
  this._signInFuncError = null

  this._phoneRegisterTimer = null

  this._pingTimer = null
  this._timeSentKeepAlive = 0

  this._sendStatusCount = 0

  this._makeCallStatus = {}
  this._sendSharedObjectFuncOKTable = {}
  this._receivedSharedObjectJsonTable = {}

  this._chat_session_id = 0

  this._lastMessageTime = 0

  this._enteringWebchatRoom = null
}

/*
 * ChatClient prototype
 */
ChatClient.prototype = {
  /*
   * Function addHandler
   */
  addHandler(handler) {
    if (Object.keys(this._eventListeners).length === 0) {
      for (var i = 0; i < Events.length; i++) {
        this._eventListeners[Events[i]] = this._initEventListener(Events[i])
      }
    }
    this._handlers.push(handler)
  },

  /*
   * Function removeHandler
   */
  removeHandler(handler) {
    var index = this._handlers.indexOf(handler)
    if (index !== -1) {
      this._handlers.splice(index, 1)
    }
  },

  /*
   * Function setEventListeners
   */
  setEventListeners(listeners) {
    if (Object.keys(this._eventListeners).length === 0) {
      for (var i = 0; i < Events.length; i++) {
        this._eventListeners[Events[i]] = this._initEventListener(Events[i])
      }
    }
    for (var e in listeners) {
      this._eventListeners0[e] = listeners[e]
    }
  },

  /*
   * Function signIn
   */
  signIn(host, path, tenant, user, pass, option, funcOK, funcError) {
    if (this._signInStatus === 2) {
      this._logger.log(
        'info',
        'signIn failed (code: ' +
          Errors.SIGNING_IN +
          ', message: ' +
          'Now in sign-in process' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SIGNING_IN,
          message: 'Now in sign-in process',
        }
        funcError(ev)
      }
      return
    }
    if (this._signInStatus === 3) {
      this._logger.log(
        'info',
        'signIn failed (code: ' +
          Errors.SIGNED_IN +
          ', message: ' +
          'Already signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SIGNED_IN,
          message: 'Already signed-in',
        }
        funcError(ev)
      }
      return
    }

    var trimRegExp = /(^\s+)|(\s+$)/g

    if (host && !user && !pass && !option && !funcOK && !funcError) {
      // signIn(option, funcOK, funcError)
      funcError = tenant
      funcOK = path
      option = host
      pass = option.pass
      user = option.user
      tenant = option.tenant
      if (option.url) {
        var url = string(option.url)
          .replace(trimRegExp, '')
          .replace(/\/$/, '')
          .split('/')
        path = url.pop()
        host = url.join('/')
      } else {
        path = option.path
        host = option.host
      }
    }
    if (!option) {
      option = {}
    }

    if (option.usePhone) {
      if (!Brekeke.webrtc || !Brekeke.webrtc.Phone) {
        this._logger.log(
          'info',
          'signIn failed (code: ' +
            Errors.WEBRTC_NOT_LOADED +
            ', message: ' +
            'WebRTC library not loaded' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.WEBRTC_NOT_LOADED,
            message: 'WebRTC library not loaded',
          }
          funcError(ev)
        }
        return
      }
      if (
        !window.webkitRTCPeerConnection &&
        !window.mozRTCPeerConnection &&
        !window.RTCPeerConnection
      ) {
        this._logger.log(
          'info',
          'signIn failed (code: ' +
            Errors.WEBRTC_NOT_SUPPORTED +
            ', message: ' +
            'WebRTC not supported' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.WEBRTC_NOT_SUPPORTED,
            message: 'WebRTC not supported',
          }
          funcError(ev)
        }
        return
      }
    }

    this._host = string(host)
      .replace(trimRegExp, '')
      .replace(/\/$/, '')
      .split('/')
      .pop()
    this._path = string(path).replace(trimRegExp, '')
    this._tenant = string(tenant).replace(trimRegExp, '')
    this._user_id = string(user).replace(trimRegExp, '')
    this._pass = string(pass).replace(trimRegExp, '')
    this._forceAjax = Boolean(option.forceAjax)
    this._servlet = Boolean(option.servlet)
    this._useHttps = Boolean(
      option.useHttps ||
        string(host).toLowerCase().lastIndexOf('https', 0) === 0,
    )
    this._auth_timeout = int(option.auth_timeout)
    this._admin_mode = Boolean(option.admin_mode)
    this._modest = Boolean(option.modest)
    this._recvMsgs = Boolean(option.recvMsgs)
    this._pver = string(option.pver)
    this._profileImageSize =
      typeof option.profileImageSize === 'undefined'
        ? '40'
        : string(option.profileImageSize)
    this._crAuthMode = int(option.crAuthMode)

    this._profile = {}
    this._settings = {}
    this._buddylist = {}
    this._buddylistOrg = {}
    this._nonbuddylist = {}
    this._nonsubscrlist = {}
    this._allUsers = {}
    this._configProperties = {}
    this._signedInInfo = {}
    this._status =
      !option.status && option.status !== 0 ? null : int(option.status)
    this._display = string(option.display)
    this._buddyStatus = {}

    if (option.usePhone) {
      this._phone = new Brekeke.webrtc.Phone()
    } else {
      this._phone = null
    }
    this._phoneProperties = {}
    this._phoneRegistered = false
    this._buddyPhone = {}

    this._sessionBundleIdCounter = 0
    this._sessionBundleTable = {}

    this._conferenceCalls = {}

    this._upload_ids = {}
    this._download_keys = {}
    this._ucclient_customized_status_table = {}
    this._ucclient_customized_status_table[
      JSON.stringify({ tenant: this._tenant, user_id: this._user_id })
    ] = JSON.stringify({
      myProfileImageUrl:
        typeof option.myProfileImageUrl !== 'undefined'
          ? string(option.myProfileImageUrl)
          : undefined,
      ui_customized_status: option.ui_customized_status,
    })

    this._conferences = {}

    this._fileInfos = {}

    this._topicIdCounter = 0
    this._topics = {}

    this._databaseTaskTable = {}

    this._signInStatus = 2
    this._signInFuncOK = funcOK
    this._signInFuncError = funcError

    this._pingTimer = null

    this._sendStatusCount = 0

    this._makeCallStatus = {}
    this._sendSharedObjectFuncOKTable = {}
    this._receivedSharedObjectJsonTable = {}

    // start sign in timeout timer
    this._signInTimer = setTimeout(
      this._byThis(this._signInTimeout),
      int(option.timeout) || this.SIGN_IN_TIMEOUT_DEFAULT,
    )

    // start json rpc
    this._signInStartRpc(
      this._crAuthMode === 1 ||
        (this._crAuthMode !== 2 && this._host.indexOf('127.0.0.1') !== 0)
        ? null
        : this._pass,
    )

    if (reportConsoleInfo) {
      reportConsoleInfo.report_console_url =
        (this._useHttps ? 'https:' : 'http:') +
        '//' +
        this._host +
        '/' +
        this._path
    }
  },

  /*
   * Function signOut
   */
  signOut(options) {
    this.cancelProfileImage({ _suppressWarn: true })
    this._rpcNotify('Logout', (options && options.logoutParams) || {}, null)
    this._signInStatus = 0
    this._signedOut()
  },

  /*
   * Function enablePhone
   */
  enablePhone() {
    if (this._signInStatus !== 3) {
      this._logger.log('warn', 'Not signed-in')
      return
    }

    if (!this._phone) {
      this._phone = new Brekeke.webrtc.Phone()
      this._getPhoneProperties()
    }
  },

  /*
   * Function loadPhoneProperties
   */
  loadPhoneProperties(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'loadPhoneProperties failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetPhoneProperties',
      {
        tenant: this._tenant,
        user_id: this._user_id,
        force: Boolean(options && options.force),
      },
      function (result) {
        if (result && result.pnumber) {
          if (funcOK) {
            var ev = result
            funcOK(ev)
          }
        } else {
          this._logger.log(
            'info',
            'loadPhoneProperties failed (code: ' +
              Errors.WEBRTC_PERMANENTLY_UNAVAILABLE +
              ', message: ' +
              'Empty pnumber' +
              ')',
          )
          if (funcError) {
            var ev = {
              code: Errors.WEBRTC_PERMANENTLY_UNAVAILABLE,
              message: 'Empty pnumber',
            }
            funcError(ev)
          }
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function saveProperties
   */
  saveProperties(profile, settings, buddylist, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'saveProperties failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var mustReSubscribe = false
    var mustRePublishDisplayName = false
    var configProperties = this.getConfigProperties()
    var optional_config = configProperties.optional_config || {}
    var buddy_mode = configProperties.buddy_mode

    if (!profile) {
      profile = this._profile
    }
    if (!settings) {
      settings = this._settings
    } else {
      if (
        settings.optional_settings &&
        this._settings.optional_settings &&
        settings.optional_settings.display_name !==
          this._settings.optional_settings.display_name
      ) {
        mustRePublishDisplayName = true
      }
    }
    if (!buddylist) {
      buddylist = this._buddylistOrg
    } else {
      if (buddy_mode === Constants.BUDDY_MODE_MANUAL) {
        mustReSubscribe = true
      }
    }

    this._rpcCall(
      'SetProperties',
      {
        tenant: this._tenant,
        user_id: this._user_id,
        profile,
        settings,
        buddylist,
      },
      function () {
        this._rpcCall(
          'GetProperties',
          {
            tenant: this._tenant,
            user_id: this._user_id,
            type: 'all',
          },
          function (result) {
            this._profile = result.profile
            this._settings = result.settings
            try {
              this._buddylistOrg = JSON.parse(JSON.stringify(result.buddylist))
            } catch (e) {
              this._logger.log(
                'error',
                'result.buddylist parse error at saveProperties: ' + e.message,
              )
              this._buddylistOrg = {}
            }
            this._buddylist = result.buddylist
            this._refreshBuddylist()

            // remove nonbuddy
            if (
              this._buddylist &&
              this._buddylist.user &&
              this._buddylist.user.length &&
              this._nonbuddylist &&
              this._nonbuddylist.user &&
              this._nonbuddylist.user.length
            ) {
              for (var i = 0; i < this._buddylist.user.length; i++) {
                for (var j = this._nonbuddylist.user.length - 1; j >= 0; j--) {
                  if (
                    this._buddylist.user[i].tenant ===
                      this._nonbuddylist.user[j].tenant &&
                    this._buddylist.user[i].user_id ===
                      this._nonbuddylist.user[j].user_id
                  ) {
                    this._nonbuddylist.user.splice(j, 1)
                    break
                  }
                }
              }
            }
            // remove nonsubscr
            if (
              this._buddylist &&
              this._buddylist.user &&
              this._buddylist.user.length &&
              this._nonsubscrlist &&
              this._nonsubscrlist.user &&
              this._nonsubscrlist.user.length
            ) {
              for (var i = 0; i < this._buddylist.user.length; i++) {
                for (var j = this._nonsubscrlist.user.length - 1; j >= 0; j--) {
                  if (
                    this._buddylist.user[i].tenant ===
                      this._nonsubscrlist.user[j].tenant &&
                    this._buddylist.user[i].user_id ===
                      this._nonsubscrlist.user[j].user_id
                  ) {
                    this._nonsubscrlist.user.splice(j, 1)
                    break
                  }
                }
              }
            }
            if (mustRePublishDisplayName) {
              // re-publish
              this._rpcCall(
                'ChangeStatus',
                {
                  display_name: 1, // value is dummy
                },
                null,
                null,
              )
            }
            if (mustReSubscribe) {
              // re-subscribe
              var users = []
              if (
                this._buddylist &&
                this._buddylist.user &&
                this._buddylist.user.length
              ) {
                for (var i = 0; i < this._buddylist.user.length; i++) {
                  var buddy = this._buddylist.user[i]
                  if (buddy.user_id || buddy.user_id === '') {
                    users.push({
                      tenant: buddy.tenant,
                      user_id: buddy.user_id,
                    })
                  }
                }
              }
              if (
                this._nonbuddylist &&
                this._nonbuddylist.user &&
                this._nonbuddylist.user.length
              ) {
                for (var i = 0; i < this._nonbuddylist.user.length; i++) {
                  var buddy = this._nonbuddylist.user[i]
                  if (buddy.user_id || buddy.user_id === '') {
                    users.push({
                      tenant: buddy.tenant,
                      user_id: buddy.user_id,
                    })
                  }
                }
              }
              this._rpcCall(
                'SubscribeStatus',
                {
                  users,
                  mutual: false,
                  refresh: true,
                },
                function (result) {
                  if (funcOK) {
                    var ev = {}
                    funcOK(ev)
                  }
                },
                funcError,
              )
            } else {
              if (funcOK) {
                var ev = {}
                funcOK(ev)
              }
            }
          },
          funcError,
        )
      },
      funcError,
    )
  },

  /*
   * Function uploadProfileImage
   */
  uploadProfileImage(input, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'uploadProfileImage failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var tenant = this._tenant
    var user_id = this._user_id
    if (input && input.user_id) {
      tenant = input.tenant || tenant
      user_id = input.user_id
      input = input.input
    }
    var key = JSON.stringify({ tenant, user_id })

    if (!input || !input.form) {
      this._logger.log(
        'info',
        'uploadProfileImage failed (code: ' +
          Errors.UPLOADPROFILEIMAGE_EMPTY_FORM +
          ', message: ' +
          'Empty input.form' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.UPLOADPROFILEIMAGE_EMPTY_FORM,
          message: 'Empty input.form',
        }
        funcError(ev)
      }
      return
    }

    if (this._upload_ids[key]) {
      // already prepared (re-upload)
      this.cancelProfileImage({ tenant, user_id })
    }

    this._rpcCall(
      'PrepareProfileImage',
      {
        tenant,
        user_id,
      },
      function (result) {
        var upload_id = result.upload_id

        var startTime = new Date().getTime()
        // upload-checking function
        var checkFunction = function () {
          this._rpcCall(
            'CheckProfileImage',
            {
              tenant,
              user_id,
              upload_id,
            },
            function (result) {
              if (result.code === 0) {
                // Upload completed
                this._upload_ids[key] = upload_id
                if (funcOK) {
                  var ev = {
                    url:
                      (this._useHttps ? 'https://' : 'http://') +
                      this._host +
                      '/' +
                      this._path +
                      Constants.PROFILE_IMAGE_URL_DOWNLOAD +
                      '&DOWNLOAD_ID=' +
                      encodeURIComponent(result.download_id) +
                      (this._profileImageSize
                        ? '&SIZE=' + encodeURIComponent(this._profileImageSize)
                        : ''),
                  }
                  funcOK(ev)
                }
              } else if (result.code === 1) {
                // Now uploading
                if (
                  new Date().getTime() >
                  startTime + this.UPLOAD_TIMEOUT_DEFAULT
                ) {
                  // Upload timeout
                  this._rpcCall(
                    'CancelProfileImage',
                    { tenant, user_id, upload_id },
                    null,
                    null,
                  )
                  this._logger.log(
                    'info',
                    'uploadProfileImage failed (code: ' +
                      Errors.UPLOADPROFILEIMAGE_TIMEOUT +
                      ', message: ' +
                      'Upload timeout' +
                      ')',
                  )
                  if (funcError) {
                    var ev = {
                      code: Errors.UPLOADPROFILEIMAGE_TIMEOUT,
                      message: 'Upload timeout',
                    }
                    funcError(ev)
                  }
                } else {
                  setTimeout(this._byThis(checkFunction), 1000)
                }
              } else {
                // Upload failed
                this._rpcCall(
                  'CancelProfileImage',
                  { tenant, user_id, upload_id },
                  null,
                  null,
                )
                this._logger.log(
                  'info',
                  'uploadProfileImage failed (code: ' +
                    Errors.UPLOADPROFILEIMAGE_FAILED +
                    ', message: ' +
                    'Upload failed' +
                    ')',
                )
                if (funcError) {
                  var ev = {
                    code: Errors.UPLOADPROFILEIMAGE_FAILED,
                    message: 'Upload failed',
                  }
                  funcError(ev)
                }
              }
            },
            function (error) {
              this._rpcCall(
                'CancelProfileImage',
                { tenant, user_id, upload_id },
                null,
                null,
              )
              if (funcError) {
                var ev = {
                  code: int(error.code),
                  message: string(error.message),
                }
                funcError(error)
              }
            },
          )
        }

        if (window.FormData) {
          // FormData enabled
          // upload with XHR + FormData
          input.form.method = 'POST'
          input.form.enctype = 'multipart/form-data'
          var fd = new window.FormData(input.form)
          var xhr = new XMLHttpRequest()
          xhr.open(
            'POST',
            (this._useHttps ? 'https://' : 'http://') +
              this._host +
              '/' +
              this._path +
              '/image?ACTION=UPLOAD&UPLOAD_ID=' +
              encodeURIComponent(upload_id) +
              '&tenant=' +
              encodeURIComponent(tenant) +
              '&user=' +
              encodeURIComponent(user_id),
            true,
          )
          xhr.onload = this._byThis(checkFunction)
          xhr.send(fd)
        } else {
          // upload with form
          input.form.action =
            (this._useHttps ? 'https://' : 'http://') +
            this._host +
            '/' +
            this._path +
            '/image?ACTION=UPLOAD&UPLOAD_ID=' +
            encodeURIComponent(upload_id) +
            '&tenant=' +
            encodeURIComponent(tenant) +
            '&user=' +
            encodeURIComponent(user_id)
          input.form.method = 'POST'
          input.form.enctype = 'multipart/form-data'
          input.form.submit()
          setTimeout(this._byThis(checkFunction), 1000)
        }
      },
      funcError,
    )
  },

  /*
   * Function cancelProfileImage
   */
  cancelProfileImage(options) {
    if (this._signInStatus !== 3) {
      if (options && options._suppressWarn) {
        this._logger.log('info', 'Not signed-in')
      } else {
        this._logger.log('warn', 'Not signed-in')
      }
      return
    }

    var keyToCancel = null
    if (options && options.user_id) {
      keyToCancel = JSON.stringify({
        tenant: options.tenant || this._tenant,
        user_id: options.user_id,
      })
    }

    var keys = Object.keys(this._upload_ids)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      if (!keyToCancel || key === keyToCancel) {
        var params
        try {
          params = JSON.parse(key)
        } catch (e) {
          continue
        }
        var upload_id = this._upload_ids[key]
        delete this._upload_ids[key]
        params.upload_id = upload_id
        this._rpcCall('CancelProfileImage', params, null, null)
      }
    }
  },

  /*
   * Function saveProfileImage
   */
  saveProfileImage(options, funcOK, funcError) {
    if (
      typeof options === 'function' &&
      typeof funcOK === 'function' &&
      !funcError
    ) {
      funcError = funcOK
      funcOK = options
      options = {}
    }

    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'saveProfileImage failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var tenant = this._tenant
    var user_id = this._user_id
    if (options && options.user_id) {
      tenant = options.tenant || tenant
      user_id = options.user_id
    }
    var key = JSON.stringify({ tenant, user_id })

    var upload_id = this._upload_ids[key]
    if (upload_id) {
      this._rpcCall(
        'SaveProfileImage',
        {
          tenant,
          user_id,
          upload_id,
        },
        function (result) {
          if (result) {
            this._download_keys[key] = result.dlk
          }

          delete this._upload_ids[key]

          if (funcOK) {
            var ev = {
              url: this.getProfile().profile_image_url,
            }
            funcOK(ev)
          }
        },
        funcError,
      )
    } else {
      this._logger.log(
        'info',
        'saveProfileImage failed (code: ' +
          Errors.UPLOADPROFILEIMAGE_FAILED +
          ', message: ' +
          'Empty upload_id' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.UPLOADPROFILEIMAGE_FAILED,
          message: 'Empty upload_id',
        }
        funcError(ev)
      }
      return
    }
  },

  /*
   * Function deleteProfileImage
   */
  deleteProfileImage(options, funcOK, funcError) {
    if (
      typeof options === 'function' &&
      typeof funcOK === 'function' &&
      !funcError
    ) {
      funcError = funcOK
      funcOK = options
      options = {}
    }

    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'deleteProfileImage failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var tenant = this._tenant
    var user_id = this._user_id
    if (options && options.user_id) {
      tenant = options.tenant || tenant
      user_id = options.user_id
    }
    var key = JSON.stringify({ tenant, user_id })

    this._rpcCall(
      'DeleteProfileImage',
      {
        tenant,
        user_id,
      },
      function (result) {
        delete this._download_keys[key]

        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function addTemporaryBuddy
   */
  addTemporaryBuddy(buddyList, funcOK, funcError) {
    var options = {}
    var users = []
    var profile = this.getProfile()

    if (buddyList && buddyList.buddyList) {
      options = buddyList
      buddyList = buddyList.buddyList
    }

    if (!buddyList || !buddyList.length) {
      buddyList = []
    }

    for (var i = 0; i < buddyList.length; i++) {
      var buddy = buddyList[i]
      var tenant = string(buddy.tenant || this._tenant)
      var user_id = string(buddy.user_id)

      if (tenant === profile.tenant && user_id === profile.user_id) {
        // me
        continue
      }
      var exists = false
      var alreadyNonsubscr = false
      if (
        this._buddylist &&
        this._buddylist.user &&
        this._buddylist.user.length
      ) {
        for (var j = 0; j < this._buddylist.user.length; j++) {
          if (
            this._buddylist.user[j].user_id === user_id &&
            (this._buddylist.user[j].tenant || this._tenant) === tenant
          ) {
            // already buddy
            exists = true
            break
          }
        }
      }
      if (exists) {
        continue
      }
      if (
        this._nonbuddylist &&
        this._nonbuddylist.user &&
        this._nonbuddylist.user.length
      ) {
        for (var j = 0; j < this._nonbuddylist.user.length; j++) {
          if (
            this._nonbuddylist.user[j].user_id === user_id &&
            (this._nonbuddylist.user[j].tenant || this._tenant) === tenant
          ) {
            // already nonbuddy
            exists = true
            break
          }
        }
      } else {
        this._nonbuddylist = {}
        this._nonbuddylist.user = []
      }
      if (
        this._nonsubscrlist &&
        this._nonsubscrlist.user &&
        this._nonsubscrlist.user.length
      ) {
        for (var j = 0; j < this._nonsubscrlist.user.length; j++) {
          if (
            this._nonsubscrlist.user[j].user_id === user_id &&
            (this._nonsubscrlist.user[j].tenant || this._tenant) === tenant
          ) {
            // already nonsubscr
            alreadyNonsubscr = true
            break
          }
        }
      } else {
        this._nonsubscrlist = {}
        this._nonsubscrlist.user = []
      }
      if (!exists) {
        if (options.doNotSubscribe || buddy.doNotSubscribe) {
          if (!alreadyNonsubscr) {
            // add nonsubscr immediately
            var nonsubscr = {}
            nonsubscr.user_id = user_id
            nonsubscr.tenant = tenant
            nonsubscr.name = string(buddy.name)
            nonsubscr.group = ''
            nonsubscr.block_settings = {}
            this._nonsubscrlist.user.push(nonsubscr)
          }
        } else {
          // subscribe (add nonbuddy after StatusNotified)
          users.push({ tenant, user_id })
        }
      }
    }

    // subscribe
    if (users.length > 0) {
      this._rpcCall(
        'SubscribeStatus',
        {
          users,
          mutual: false,
          refresh: false,
        },
        function (result) {
          if (funcOK) {
            var ev = {}
            funcOK(ev)
          }
        },
        funcError,
      )
    } else {
      if (funcOK) {
        var ev = {}
        funcOK(ev)
      }
    }
  },

  /*
   * Function removeTemporaryBuddy
   */
  removeTemporaryBuddy(buddyList, funcOK, funcError) {
    var users = []

    for (var i = 0; i < buddyList.length; i++) {
      var buddy = buddyList[i]
      var tenant = string(buddy.tenant || this._tenant)
      var user_id = string(buddy.user_id)

      var exists = false
      if (
        this._buddylist &&
        this._buddylist.user &&
        this._buddylist.user.length
      ) {
        for (var j = 0; j < this._buddylist.user.length; j++) {
          if (
            this._buddylist.user[j].user_id === user_id &&
            (this._buddylist.user[j].tenant || this._tenant) === tenant
          ) {
            // already buddy
            exists = true
            break
          }
        }
      }
      if (exists) {
        continue
      }
      if (
        this._nonbuddylist &&
        this._nonbuddylist.user &&
        this._nonbuddylist.user.length
      ) {
        for (var j = this._nonbuddylist.user.length - 1; j >= 0; j--) {
          if (
            this._nonbuddylist.user[j].user_id === user_id &&
            (this._nonbuddylist.user[j].tenant || this._tenant) === tenant
          ) {
            // remove nonbuddy
            this._nonbuddylist.user.splice(j, 1)
            users.push({ tenant, user_id })
            break
          }
        }
      }
      if (
        this._nonsubscrlist &&
        this._nonsubscrlist.user &&
        this._nonsubscrlist.user.length
      ) {
        for (var j = this._nonsubscrlist.user.length - 1; j >= 0; j--) {
          if (
            this._nonsubscrlist.user[j].user_id === user_id &&
            (this._nonsubscrlist.user[j].tenant || this._tenant) === tenant
          ) {
            // remove nonsubscr
            this._nonsubscrlist.user.splice(j, 1)
            break
          }
        }
      }
    }
    // unsubscribe
    if (users.length > 0) {
      this._rpcCall(
        'UnsubscribeStatus',
        {
          users,
        },
        function (result) {
          if (funcOK) {
            var ev = {}
            funcOK(ev)
          }
        },
        funcError,
      )
    } else {
      if (funcOK) {
        var ev = {}
        funcOK(ev)
      }
    }
  },

  /*
   * Function changeStatus
   */
  changeStatus(status, display, funcOK, funcError) {
    var ui_customized_status = undefined
    if (typeof status === 'object') {
      funcError = funcOK
      funcOK = display
      ui_customized_status = status.ui_customized_status
      display = status.display
      status = status.status
    }

    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'changeStatus failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var myKey = JSON.stringify({
      tenant: this._tenant,
      user_id: this._user_id,
    })
    var statusOrg = this._status
    var displayOrg = this._display
    var ucclient_customized_status_org =
      this._ucclient_customized_status_table[myKey]

    // change status
    this._status = int(status)
    this._display = display
    if (ui_customized_status !== undefined) {
      var ucclient_customized_status_obj = {}
      try {
        ucclient_customized_status_obj =
          JSON.parse(string(this._ucclient_customized_status_table[myKey])) ||
          {}
        ucclient_customized_status_obj.ui_customized_status =
          ui_customized_status
        this._ucclient_customized_status_table[myKey] = JSON.stringify(
          ucclient_customized_status_obj,
        )
      } catch (e) {}
    }

    // notify status
    this._sendStatus(
      funcOK,
      this._byThis(function (error) {
        this._status = statusOrg
        this._display = displayOrg
        this._ucclient_customized_status_table[myKey] =
          ucclient_customized_status_org
        if (funcError) {
          funcError(error)
        }
      }),
    )
  },

  /*
   * Function getAcdUsers
   */
  getAcdUsers(option, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'getAcdUsers failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }
    this._rpcCall('GetAcdUsers', option, funcOK, funcError)
  },

  /*
   * Function sendText
   */
  sendText(text, target, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendText failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!target.user_id) {
      this._logger.log(
        'info',
        'sendText failed (code: ' +
          Errors.SENDTEXT_EMPTY_USER +
          ', message: ' +
          'Empty target.user_id' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDTEXT_EMPTY_USER,
          message: 'Empty target.user_id',
        }
        funcError(ev)
      }
      return
    }

    var textVal = string(text)
    var targetObject = {
      tenant: string(target.tenant || this._tenant),
      user_id: string(target.user_id),
    }
    var targetVal = [targetObject]

    // send
    this._rpcCall(
      'SendText',
      {
        text: textVal,
        target: targetVal,
        ctype: Constants.CTYPE_TEXT,
      },
      function (result) {
        this._lastMessageTime = int(result.tstamp)

        if (funcOK) {
          var topic_id = ''
          ;(result.topic_ids || []).forEach(function (topic) {
            if (
              topic &&
              topic.tenant === targetObject.tenant &&
              topic.user_id === targetObject.user_id
            ) {
              topic_id = string(topic.topic_id || '')
            }
          })
          var ltime = stringifyTstamp(result.tstamp)
          var ev = {
            text_id:
              string(result.action_id) +
              '_' +
              ltime.substr(0, 7).split('-').join(''),
            topic_id,
            ltime,
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function readText
   */
  readText(received_text_id_array, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'readText failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!received_text_id_array || !received_text_id_array.length) {
      this._logger.log(
        'info',
        'readText failed (code: ' +
          Errors.READTEXT_EMPTY_ID +
          ', message: ' +
          'Empty received_text_id_array' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.READTEXT_EMPTY_ID,
          message: 'Empty received_text_id_array',
        }
        funcError(ev)
      }
      return
    }

    var message = []
    for (var i = 0; i < received_text_id_array.length; i++) {
      var received_text_id = received_text_id_array[i].split('_')
      var action_id = received_text_id[0]
      var month = received_text_id[1]
      if (isNaN(action_id) || isNaN(month)) {
        this._logger.log(
          'info',
          'readText failed (code: ' +
            Errors.READTEXT_INVALID_ID +
            ', message: ' +
            'Invalid value: received_text_id_array[' +
            i +
            '] = ' +
            received_text_id_array[i] +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.READTEXT_INVALID_ID,
            message:
              'Invalid value: received_text_id_array[' +
              i +
              '] = ' +
              received_text_id_array[i],
          }
          funcError(ev)
        }
        return
      }
      message.push({
        action_id: int(action_id),
        month: string(month),
      })
    }

    this._rpcNotify(
      'ReadText',
      {
        message,
      },
      funcError,
    )
  },

  /*
   * Function receiveUnreadText
   */
  receiveUnreadText(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'receiveUnreadText failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetUnreadText',
      {},
      function (result) {
        var messages = []
        if (result && result.message && result.message.length) {
          for (var i = 0; i < result.message.length; i++) {
            var message = result.message[i]
            if (!message.sender) {
              this._logger.log('warn', 'Invalid sender')
              continue
            }
            var sender_tenant = message.sender.tenant || this._tenant
            var sender_user_id = string(message.sender.user_id)

            var receivedObject = undefined

            switch (message.ctype) {
              case Constants.CTYPE_OBJECT:
                try {
                  receivedObject = JSON.parse(message.text)
                } catch (e) {
                  this._logger.log('warn', e.message + ' at _recvText')
                }
              // fall through
              case Constants.CTYPE_TEXT:
              case Constants.CTYPE_FILE_REQUEST:
              case Constants.CTYPE_CALL_RESULT:
                messages.push({
                  sender: {
                    tenant: sender_tenant,
                    user_id: sender_user_id,
                  },
                  text: string(message.text),
                  object: receivedObject,
                  conf_id: message.conf_id ? string(message.conf_id) : null, // message.conf_id might be undefined or "" on non-conf
                  ctype: int(message.ctype),
                  received_text_id:
                    int(message.action_id) +
                    '_' +
                    string(message.sent_ltime).substr(0, 7).split('-').join(''),
                  topic_id: string(message.topic_id || ''),
                  ltime: stringifyTstamp(result.tstamp), // received time
                  tstamp: int(result.tstamp), // received time
                  sent_ltime: stringifyTstamp(message.sent_tstamp), // message.sent_tstamp has value in GetUnreadText
                  sent_tstamp: int(message.sent_tstamp), // message.sent_tstamp has value in GetUnreadText
                  requires_read: message.conf_id ? false : true,
                })
                break
              case Constants.CTYPE_CONF_START:
              case Constants.CTYPE_CONF_LEAVE:
                break
              default:
                this._logger.log('warn', 'Invalid ctype=' + message.ctype)
                break
            }
          }
        }

        // callback
        if (funcOK) {
          var ev = {
            hasMore: !Boolean(result.complete),
            messages,
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function receiveUnreceivedConferenceText
   */
  receiveUnreceivedConferenceText(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'receiveUnreceivedConferenceText failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var params = {}
    if (options && options.conf_id) {
      params.conf_id = string(options && options.conf_id)
    }
    if (options && options.conf_status) {
      params.conf_status = int(options && options.conf_status)
    }

    this._rpcCall(
      'GetUnreceivedConferenceText',
      params,
      function (result) {
        var messages = []
        if (result && result.message && result.message.length) {
          for (var i = 0; i < result.message.length; i++) {
            var message = result.message[i]
            if (!message.sender) {
              this._logger.log('warn', 'Invalid sender')
              continue
            }
            var sender_tenant = message.sender.tenant || this._tenant
            var sender_user_id = string(message.sender.user_id)

            var receivedObject = undefined

            switch (message.ctype) {
              case Constants.CTYPE_OBJECT:
                try {
                  receivedObject = JSON.parse(message.text)
                } catch (e) {
                  this._logger.log('warn', e.message + ' at _recvText')
                }
              // fall through
              case Constants.CTYPE_TEXT:
              case Constants.CTYPE_FILE_REQUEST:
              case Constants.CTYPE_CALL_RESULT:
                messages.push({
                  sender: {
                    tenant: sender_tenant,
                    user_id: sender_user_id,
                  },
                  text: string(message.text),
                  object: receivedObject,
                  conf_id: message.conf_id ? string(message.conf_id) : null, // message.conf_id might be undefined or "" on non-conf
                  ctype: int(message.ctype),
                  received_text_id:
                    int(message.action_id) +
                    '_' +
                    string(message.sent_ltime).substr(0, 7).split('-').join(''),
                  ltime: stringifyTstamp(result.tstamp), // received time
                  tstamp: int(result.tstamp), // received time
                  sent_ltime: stringifyTstamp(message.sent_tstamp), // message.sent_tstamp has value in GetUnreadText
                  sent_tstamp: int(message.sent_tstamp), // message.sent_tstamp has value in GetUnreadText
                  requires_read: message.conf_id ? false : true,
                })
                break
              case Constants.CTYPE_CONF_START:
              case Constants.CTYPE_CONF_LEAVE:
                break
              default:
                this._logger.log('warn', 'Invalid ctype=' + message.ctype)
                break
            }
          }
        }

        // callback
        if (funcOK) {
          var ev = {
            hasMore: !Boolean(result.complete),
            messages,
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function peekWebchatConferenceText
   */
  peekWebchatConferenceText(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'peekWebchatConferenceText failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var params = {}
    if (options && options.conf_id) {
      params.conf_id = string(options && options.conf_id)
    }
    if (options && options.max) {
      params.max = int(options && options.max)
    }

    this._rpcCall(
      'PeekWebchatConferenceText',
      params,
      function (result) {
        var messages = []
        if (result && result.message && result.message.length) {
          for (var i = result.message.length - 1; i >= 0; i--) {
            var message = result.message[i]
            if (!message.sender) {
              this._logger.log('warn', 'Invalid sender')
              continue
            }
            var sender_tenant = message.sender.tenant || this._tenant
            var sender_user_id = string(message.sender.user_id)

            var receivedObject = undefined

            switch (message.ctype) {
              case Constants.CTYPE_OBJECT:
                try {
                  receivedObject = JSON.parse(message.text)
                } catch (e) {
                  this._logger.log('warn', e.message + ' at _recvText')
                }
              // fall through
              case Constants.CTYPE_TEXT:
              case Constants.CTYPE_FILE_REQUEST:
              case Constants.CTYPE_CALL_RESULT:
                messages.push({
                  sender: {
                    tenant: sender_tenant,
                    user_id: sender_user_id,
                  },
                  text: string(message.text),
                  object: receivedObject,
                  conf_id: message.conf_id ? string(message.conf_id) : null, // message.conf_id might be undefined or "" on non-conf
                  ctype: int(message.ctype),
                  received_text_id:
                    int(message.action_id) +
                    '_' +
                    string(message.sent_ltime).substr(0, 7).split('-').join(''),
                  ltime: stringifyTstamp(result.tstamp), // received time
                  tstamp: int(result.tstamp), // received time
                  sent_ltime: stringifyTstamp(message.sent_tstamp), // message.sent_tstamp has value in GetUnreadText
                  sent_tstamp: int(message.sent_tstamp), // message.sent_tstamp has value in GetUnreadText
                  requires_read: message.conf_id ? false : true,
                })
                break
              case Constants.CTYPE_CONF_START:
              case Constants.CTYPE_CONF_LEAVE:
                break
              default:
                this._logger.log('warn', 'Invalid ctype=' + message.ctype)
                break
            }
          }
        }

        // callback
        if (funcOK) {
          var ev = {
            hasMore: !Boolean(result.complete),
            messages,
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function sendBroadcastText
   */
  sendBroadcastText(text, target, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendBroadcastText failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!target.length) {
      this._logger.log(
        'info',
        'sendBroadcastText failed (code: ' +
          Errors.SENDBROADCASTTEXT_EMPTY_TARGET +
          ', message: ' +
          'Empty target' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDBROADCASTTEXT_EMPTY_TARGET,
          message: 'Empty target',
        }
        funcError(ev)
      }
      return
    }

    var textVal = string(text)
    var targetVal = []
    for (var i = 0; i < target.length; i++) {
      if (!target[i].user_id) {
        this._logger.log(
          'info',
          'sendBroadcastText failed (code: ' +
            Errors.SENDBROADCASTTEXT_EMPTY_USER +
            ', message: ' +
            'Empty target[' +
            i +
            '].user_id' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDBROADCASTTEXT_EMPTY_USER,
            message: 'Empty target[' + i + '].user_id',
          }
          funcError(ev)
        }
        return
      }
      targetVal.push({
        tenant: string(target[i].tenant || this._tenant),
        user_id: string(target[i].user_id),
      })
    }

    // send
    this._rpcCall(
      'SendText',
      {
        text: textVal,
        target: targetVal,
        ctype: Constants.CTYPE_TEXT,
      },
      function (result) {
        this._lastMessageTime = int(result.tstamp)

        if (funcOK) {
          var topic_ids = []
          targetVal.forEach(function (targetObject) {
            var topic_id = ''
            ;(result.topic_ids || []).forEach(function (topic) {
              if (
                topic &&
                topic.tenant === targetObject.tenant &&
                topic.user_id === targetObject.user_id
              ) {
                topic_id = string(topic.topic_id || '')
              }
            })
            topic_ids.push({
              tenant: targetObject.tenant,
              user_id: targetObject.user_id,
              topic_id,
            })
          })
          var ltime = stringifyTstamp(result.tstamp)
          var ev = {
            text_id:
              string(result.action_id) +
              '_' +
              ltime.substr(0, 7).split('-').join(''),
            topic_ids,
            ltime,
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function sendTyping
   */
  sendTyping(target, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendTyping failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!target.user_id) {
      this._logger.log(
        'info',
        'sendTyping failed (code: ' +
          Errors.SENDTYPING_EMPTY_USER +
          ', message: ' +
          'Empty target.user_id' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDTYPING_EMPTY_USER,
          message: 'Empty target.user_id',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'SendClientEvent',
      {
        client_method: 'Typing',
        target: {
          tenant: string(target.tenant || this._tenant),
          user_id: string(target.user_id),
        },
        client_param: {
          conf_id: '',
          dummy: 'typing',
        },
      },
      funcOK,
      funcError,
    )
  },

  /*
   * Function createConference
   */
  createConference(subject, invite, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'createConference failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!subject) {
      this._logger.log(
        'info',
        'createConference failed (code: ' +
          Errors.CREATECONFERENCE_EMPTY_SUBJECT +
          ', message: ' +
          'Empty subject' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.CREATECONFERENCE_EMPTY_SUBJECT,
          message: 'Empty subject',
        }
        funcError(ev)
      }
      return
    }

    var properties = {
      subject: string(subject),
    }
    var profile = this.getProfile()
    var users = []
    if (invite && invite.length) {
      for (var i = 0; i < invite.length; i++) {
        users.push({
          tenant: string(invite[i].tenant || this._tenant),
          user_id: string(invite[i].user_id || invite[i]),
        })
      }
    }

    this._rpcCall(
      'CreateConference',
      {
        conf_type: this.CONFTYPE_USERCHATCONF,
        expires: this.CONF_EXPIRES,
        properties,
        from_user_name: profile.name,
        user: users,
      },
      function (result) {
        var conf_id = string(result.conf_id)

        // new conference
        this._newConference(conf_id)

        this._conferences[conf_id].subject = string(subject)
        this._conferences[conf_id].created_time = stringifyTstamp(result.tstamp)
        this._conferences[conf_id].created_tstamp = int(result.tstamp)
        this._conferences[conf_id].created_server_time = string(result.ltime)
        this._conferences[conf_id].conf_type = this.CONFTYPE_USERCHATCONF

        // from
        this._conferences[conf_id].from.tenant = this._tenant
        this._conferences[conf_id].from.user_id = this._user_id
        this._conferences[conf_id].from.user_name = profile.name

        // creator
        this._conferences[conf_id].creator.tenant = this._tenant
        this._conferences[conf_id].creator.user_id = this._user_id
        this._conferences[conf_id].creator.user_name = profile.name

        // callback
        if (funcOK) {
          var ev = {
            conference: this.getConference(conf_id),
            ltime: stringifyTstamp(result.tstamp),
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function joinConference
   */
  joinConference(conf_id, properties, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'joinConference failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    conf_id = string(conf_id)
    properties = {
      invisible: Boolean(properties && properties.invisible),
      exclusive: Boolean(properties && properties.exclusive),
    }

    this._rpcCall(
      'JoinConference',
      {
        conf_id,
        properties,
      },
      function (result) {
        this._newConference(conf_id)

        // conf_status
        this._conferences[conf_id].conf_status = Constants.CONF_STATUS_JOINED

        // callback
        if (funcOK) {
          var ev = {
            conference: this.getConference(conf_id),
            ltime: stringifyTstamp(result.tstamp),
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function leaveConference
   */
  leaveConference(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'leaveConference failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var params = {}
    if (typeof options === 'string') {
      params.conf_id = string(options)
    } else {
      params.conf_id = string(options && options.conf_id)
      if (options && options.rejoinable) {
        params.rejoinable = options.rejoinable
      }
    }

    this._rpcCall(
      'LeaveConference',
      params,
      function (result) {
        if (this._conferences[params.conf_id]) {
          delete this._conferences[params.conf_id]
        }

        // callback
        if (funcOK) {
          var ev = {
            closes: Boolean(result.closes),
            ltime: stringifyTstamp(result.tstamp),
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function kickOutOfConference
   */
  kickOutOfConference(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'kickOutOfConference failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var conf_id = string(options && options.conf_id)
    var tenant = string(options && options.tenant)
    var user_id = string(options && options.user_id)

    this._rpcCall(
      'KickOutOfConference',
      {
        conf_id,
        tenant,
        user_id,
      },
      function (result) {
        // callback
        if (funcOK) {
          var ev = {
            ltime: stringifyTstamp(result.tstamp),
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function inviteToConference
   */
  inviteToConference(conf_id, invite, funcOK, funcError) {
    this.transferWebchat(
      conf_id,
      { users: invite, keepDistribution: true },
      funcOK,
      funcError,
    )
  },

  /*
   * Function transferWebchat
   */
  transferWebchat(conf_id, options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'inviteToConference failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    conf_id = string(conf_id)

    if (!this._conferences[conf_id]) {
      this._logger.log(
        'info',
        'inviteToConference failed (code: ' +
          Errors.INVITETOCONFERENCE_NOT_FOUND_CONF +
          ', message: ' +
          'Not found conf_id=' +
          conf_id +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVITETOCONFERENCE_NOT_FOUND_CONF,
          message: 'Not found conf_id=' + conf_id,
        }
        funcError(ev)
      }
      return
    }
    if (
      !options ||
      (options.keepDistribution && (!options.users || !options.users.length))
    ) {
      this._logger.log(
        'info',
        'inviteToConference failed (code: ' +
          Errors.INVITETOCONFERENCE_EMPTY_INVITE +
          ', message: ' +
          'Empty invite' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVITETOCONFERENCE_EMPTY_INVITE,
          message: 'Empty invite',
        }
        funcError(ev)
      }
      return
    }

    var conference = this.getConference(conf_id)
    var profile = this.getProfile()
    var users = []
    var acds = []
    var acd = string(
      options.acd ||
        (conference &&
          conference.invite_properties &&
          conference.invite_properties.webchatfromguest &&
          conference.invite_properties.webchatfromguest.acd_id),
    )
    var newWebchatfromguest = null
    if (
      conference &&
      conference.invite_properties &&
      conference.invite_properties.webchatfromguest
    ) {
      newWebchatfromguest = { fromuser: true }
      if (acd) {
        newWebchatfromguest.acd_id = acd
      }
    }
    if (options.users) {
      for (var i = 0; i < options.users.length; i++) {
        users.push({
          tenant: string(options.users[i].tenant || this._tenant),
          user_id: string(options.users[i].user_id || options.users[i]),
          join: false,
          properties: {
            invisible: Boolean(options.users[i].invisible),
            webchatfromguest: newWebchatfromguest,
          },
        })
      }
    }
    if (!users.length && acd) {
      acds.push({
        tenant: string(this._tenant),
        acd,
        join: false,
        properties: {
          invisible: false,
          webchatfromguest: newWebchatfromguest,
        },
      })
    }

    this._rpcCall(
      'InviteToConference',
      {
        conf_id: conference.conf_id,
        from_user_name: profile.name,
        user: users,
        acds,
      },
      function (result) {
        if (options.keepDistribution) {
          if (funcOK) {
            var ev = {
              ltime: stringifyTstamp(result.tstamp),
              tstamp: int(result.tstamp),
            }
            funcOK(ev)
          }
        } else {
          var adds = []
          if (users.length || !acd) {
            adds.push({
              tag_type: '_webchat',
              tag_key: 'newDistributionType',
              tag_value: '0',
              permission: Constants.USER_TYPE_TENANT_USER,
            })
            adds.push({
              tag_type: '_webchat',
              tag_key: 'newDistributionTarget',
              tag_value: users
                .map(function (u) {
                  return u.user_id
                })
                .join(','),
              permission: Constants.USER_TYPE_TENANT_USER,
            })
          } else {
            adds.push({
              tag_type: '_webchat',
              tag_key: 'newDistributionType',
              tag_value: '1',
              permission: Constants.USER_TYPE_TENANT_USER,
            })
            adds.push({
              tag_type: '_webchat',
              tag_key: 'newDistributionTarget',
              tag_value: acd,
              permission: Constants.USER_TYPE_TENANT_USER,
            })
          }
          if (options.acd) {
            adds.push({
              tag_type: '_webchat',
              tag_key: 'acd',
              tag_value: acd,
              permission: Constants.USER_TYPE_TENANT_USER,
            })
          }
          this._rpcCall(
            'UpdateTag',
            {
              attached_type: 'conf',
              attached_id: conference.conf_id,
              yyyymm: conference.yyyymm,
              adds,
              removes: [],
            },
            function (result2) {
              if (funcOK) {
                var ev = {
                  ltime: stringifyTstamp(result.tstamp),
                  tstamp: int(result.tstamp),
                  users: result.users,
                }
                funcOK(ev)
              }
            },
            function (error) {
              if (funcError) {
                var ev = {
                  code: int(error.code),
                  message: string(error.message),
                }
                funcError(ev)
              }
            },
          )
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function inviteGuest
   */
  inviteGuest(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'inviteGuest failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }
    this._rpcCall('InviteGuest', options, funcOK, funcError)
  },

  /*
   * Function enterWebchatRoom
   */
  enterWebchatRoom(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'enterWebchatRoom failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var profile = this.getProfile()
    var subject = options && options.properties && options.properties.subject
    var ext_conf_info = JSON.parse(
      JSON.stringify(
        (options && options.properties && options.properties.ext_conf_info) ||
          {},
      ),
    )

    var adds = []
    var myProfileImageUrl = ''
    try {
      myProfileImageUrl = string(
        (
          JSON.parse(
            string(
              this._ucclient_customized_status_table[
                JSON.stringify({ tenant: this._tenant, user_id: this._user_id })
              ],
            ),
          ) || {}
        ).myProfileImageUrl,
      )
    } catch (e) {}
    if (myProfileImageUrl) {
      adds.push({
        tag_type: '_webchat',
        tag_key: 'myProfileImageUrl',
        tag_value: myProfileImageUrl,
        permission: Constants.USER_TYPE_TENANT_GUEST,
      })
    }
    if (options && options.adds && options.adds.length) {
      adds = adds.concat(options.adds)
    }

    var continuation_info = options && options.continuation_info
    if (!continuation_info && options && options.continuation_code) {
      continuation_info = this.parseContinuationCode(options.continuation_code)
      if (!continuation_info) {
        this._logger.log(
          'warn',
          'Invalid continuation_code=' + options.continuation_code,
        )
        if (funcError) {
          var ev = {
            code: Errors.LOGIN_FAILED,
            message: 'Invalid continuation_code=' + options.continuation_code,
          }
          funcError(ev)
        }
        return
      }
    }

    this._enteringWebchatRoom = []
    this._rpcCall(
      'EnterWebchatRoom',
      {
        properties: (options && options.properties) || {},
        adds,
        continuation_info,
      },
      function (result) {
        var conf_id = string(result.conf_id)

        // new conference
        this._newConference(conf_id)

        this._conferences[conf_id].subject = string(subject)
        this._conferences[conf_id].created_time = stringifyTstamp(result.tstamp)
        this._conferences[conf_id].created_tstamp = int(result.tstamp)
        this._conferences[conf_id].created_server_time = string(result.ltime)
        this._conferences[conf_id].conf_type = this.CONFTYPE_WEBCHAT
        this._conferences[conf_id].ext_conf_info = ext_conf_info
        this._conferences[conf_id].conf_tags = []

        // from
        this._conferences[conf_id].from.tenant = this._tenant
        this._conferences[conf_id].from.user_id = this._user_id
        this._conferences[conf_id].from.user_name = profile.name

        // creator
        this._conferences[conf_id].creator.tenant = this._tenant
        this._conferences[conf_id].creator.user_id = this._user_id
        this._conferences[conf_id].creator.user_name = profile.name

        // conf_status
        this._conferences[conf_id].conf_status = Constants.CONF_STATUS_JOINED

        // send conf_start
        if (result.confStart) {
          this._rpcCall('SendText', {
            text: '',
            conf_id,
            conf_type: this._conferences[conf_id].conf_type,
            ctype: Constants.CTYPE_CONF_START,
          })
        }

        // callback
        if (funcOK) {
          var ev = {
            conference: this.getConference(conf_id),
            ltime: stringifyTstamp(result.tstamp),
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }

        if (this._enteringWebchatRoom) {
          var enteringWebchatRoom = this._enteringWebchatRoom
          this._enteringWebchatRoom = null
          for (var i = 0; i < enteringWebchatRoom.length; i++) {
            enteringWebchatRoom[i]()
          }
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }

        if (this._enteringWebchatRoom) {
          var enteringWebchatRoom = this._enteringWebchatRoom
          this._enteringWebchatRoom = null
          for (var i = 0; i < enteringWebchatRoom.length; i++) {
            enteringWebchatRoom[i]()
          }
        }
      },
    )
  },

  /*
   * Function publishContinuationCode
   */
  publishContinuationCode(options) {
    var code = Math.floor(Math.random() * 90000) + 10000
    var chkdgt =
      (Math.floor(code / 10000) +
        Math.floor((code % 10000) / 1000) +
        Math.floor((code % 1000) / 100) +
        Math.floor((code % 100) / 10) +
        Math.floor(code % 10)) %
      10
    return (
      string(code) +
      string(chkdgt) +
      string(options.yyyymm) +
      string(options.conf_id)
    )
  },

  /*
   * Function parseContinuationCode
   */
  parseContinuationCode(continuation_code) {
    continuation_code = string(continuation_code)
    var code = int(continuation_code.substring(0, 5))
    var chkdgt =
      (Math.floor(code / 10000) +
        Math.floor((code % 10000) / 1000) +
        Math.floor((code % 1000) / 100) +
        Math.floor((code % 100) / 10) +
        Math.floor(code % 10)) %
      10
    if (string(chkdgt) === continuation_code.substring(5, 6)) {
      return {
        conf_id: continuation_code.substring(12),
        yyyymm: continuation_code.substring(6, 12),
      }
    } else {
      return null
    }
  },

  createOutgoingWebchat(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'createOutgoingWebchat failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall('CreateOutgoingWebchat', options || {}, funcOK, funcError)
  },

  // obsotele (replaced by updateTag)
  /*
   * Function changeExtConfInfo
   */
  changeExtConfInfo(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'changeExtConfInfo failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall('SetExtConfInfo', options, funcOK, funcError)
  },

  /*
   * Function sendConferenceText
   */
  sendConferenceText(text, conf_id, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendConferenceText failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    conf_id = string(conf_id)

    if (!this._conferences[conf_id]) {
      this._logger.log(
        'info',
        'sendConferenceText failed (code: ' +
          Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF +
          ', message: ' +
          'Not found conf_id=' +
          conf_id +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF,
          message: 'Not found conf_id=' + conf_id,
        }
        funcError(ev)
      }
      return
    }

    var textVal = string(text)

    // send
    this._rpcCall(
      'SendText',
      {
        text: textVal,
        conf_id,
        conf_type: string(this._conferences[conf_id].conf_type),
        ctype: Constants.CTYPE_TEXT,
      },
      function (result) {
        this._lastMessageTime = int(result.tstamp)

        if (funcOK) {
          var topic_id = ''
          ;(result.topic_ids || []).forEach(function (topic) {
            if (topic && topic.tenant === '' && topic.user_id === '') {
              topic_id = string(topic.topic_id || '')
            }
          })
          var ltime = stringifyTstamp(result.tstamp)
          var ev = {
            text_id:
              string(result.action_id) +
              '_' +
              ltime.substr(0, 7).split('-').join(''),
            topic_id,
            ltime,
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function sendFile
   */
  sendFile(target, input, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendFile failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!target || !target.user_id) {
      this._logger.log(
        'info',
        'sendFile failed (code: ' +
          Errors.SENDFILE_EMPTY_USER +
          ', message: ' +
          'Empty target.user_id' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDFILE_EMPTY_USER,
          message: 'Empty target.user_id',
        }
        funcError(ev)
      }
      return
    }
    if (!input || !input.form) {
      this._logger.log(
        'info',
        'sendFile failed (code: ' +
          Errors.SENDFILE_EMPTY_FORM +
          ', message: ' +
          'Empty input.form' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDFILE_EMPTY_FORM,
          message: 'Empty input.form',
        }
        funcError(ev)
      }
      return
    }
    var conf_id = string(target.conf_id)
    target = {
      tenant: string(target.tenant || this._tenant),
      user_id: string(target.user_id),
    }
    var name = ''
    var size = 0
    var ext = ''
    if (input.files) {
      // File API enabled
      var file = input.files[0]
      if (file) {
        name = file.name
        size = file.size
      } else {
        this._logger.log(
          'info',
          'sendFile failed (code: ' +
            Errors.SENDFILE_EMPTY_FILES +
            ', message: ' +
            'Empty input.files[0]' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDFILE_EMPTY_FILES,
            message: 'Empty input.files[0]',
          }
          funcError(ev)
        }
        return
      }
    } else {
      var path = input.value
      if (path) {
        name = path.split('\\').pop()
      } else {
        this._logger.log(
          'info',
          'sendFile failed (code: ' +
            Errors.SENDFILE_EMPTY_VALUE +
            ', message: ' +
            'Empty input.value' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDFILE_EMPTY_VALUE,
            message: 'Empty input.value',
          }
          funcError(ev)
        }
        return
      }
    }
    if (name.indexOf('.') > -1) {
      ext = name.split('.').pop()
    }
    var params = {
      type: 'chunk',
      target,
      file_name: name,
    }
    if (size > 0) {
      params.size = size
    }
    if (ext !== '') {
      params.ext = ext
    }
    // get file_id from server
    this._rpcCall(
      'PrepareFileTransfer',
      params,
      function (result) {
        var file_id = result.file_id
        var fileProps = {
          file_id,
          name,
          target,
        }
        if (size > 0) {
          fileProps.size = size
        }
        var sendTextParams = {
          text: JSON.stringify(fileProps),
          ctype: Constants.CTYPE_FILE_REQUEST,
        }
        if (conf_id) {
          sendTextParams.conf_id = conf_id
          sendTextParams.conf_type = string(
            this._conferences[conf_id].conf_type,
          )
        } else {
          sendTextParams.target = [target]
        }
        this._rpcCall(
          'SendText',
          sendTextParams,
          function (result) {
            this._lastMessageTime = int(result.tstamp)

            // FormData
            var fd = input.__rnFormData // __rnFormData from react native ./uc.js
            if (!fd && window.FormData) {
              // FormData enabled
              // upload with XHR + FormData
              input.form.method = 'POST'
              input.form.enctype = 'multipart/form-data'
              fd = new window.FormData(input.form)
            }

            // new file info
            this._newFileInfo(
              file_id,
              target,
              true,
              Constants.FILE_STATUS_UNACCEPTED,
              name,
              size,
              input.form,
              fd,
            )

            // callback
            if (funcOK) {
              var topic_id = ''
              ;(result.topic_ids || []).forEach(function (topic) {
                if (
                  topic &&
                  topic.tenant === target.tenant &&
                  topic.user_id === target.user_id
                ) {
                  topic_id = string(topic.topic_id || '')
                }
              })
              var ltime = stringifyTstamp(result.tstamp)
              var ev = {
                fileInfo: this.getFileInfo(file_id),
                text_id:
                  string(result.action_id) +
                  '_' +
                  ltime.substr(0, 7).split('-').join(''),
                topic_id,
                ltime,
                tstamp: int(result.tstamp),
              }
              funcOK(ev)
            }
          },
          funcError,
        )
      },
      funcError,
    )
  },

  /*
   * Function sendFiles
   */
  sendFiles(options, fileList, funcOK, funcError, evRecursion) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendFiles failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!window.FormData) {
      this._logger.log(
        'info',
        'sendFiles failed (code: ' +
          Errors.SENDFILES_FORMDATA_NOT_SUPPORTED +
          ', message: ' +
          'FormData not supported' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDFILES_FORMDATA_NOT_SUPPORTED,
          message: 'FormData not supported',
        }
        funcError(ev)
      }
      return
    }
    if (
      !options ||
      (!options.user_id &&
        (!options.conf_id || !this._conferences[options.conf_id]))
    ) {
      this._logger.log(
        'info',
        'sendFiles failed (code: ' +
          Errors.SENDFILES_EMPTY_USER +
          ', message: ' +
          'Empty options.user_id' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDFILES_EMPTY_USER,
          message: 'Empty options.user_id',
        }
        funcError(ev)
      }
      return
    }
    if (!fileList || !fileList.length || !fileList[0]) {
      this._logger.log(
        'info',
        'sendFiles failed (code: ' +
          Errors.SENDFILES_EMPTY_FILELIST +
          ', message: ' +
          'Empty fileList' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDFILES_EMPTY_FILELIST,
          message: 'Empty fileList',
        }
        funcError(ev)
      }
      return
    }
    var conf_id = string(options.conf_id)
    var target = {
      tenant: string(options.tenant || this._tenant),
      user_id: string(options.user_id),
    }
    var conf_users = []
    if (
      !options.user_id &&
      this._conferences[conf_id] &&
      this._conferences[conf_id].user
    ) {
      for (var i = 0; i < this._conferences[conf_id].user.length; i++) {
        if (
          int(this._conferences[conf_id].user[i].conf_status) ===
            Constants.CONF_STATUS_JOINED &&
          (this._conferences[conf_id].user[i].tenant !== this._tenant ||
            this._conferences[conf_id].user[i].user_id !== this._user_id)
        ) {
          conf_users.push({
            tenant: string(
              this._conferences[conf_id].user[i].tenant || this._tenant,
            ),
            user_id: string(this._conferences[conf_id].user[i].user_id),
          })
        }
      }
      if (conf_users.length) {
        target = conf_users.shift()
      }
    }
    var file = fileList[0]
    var name = file.name
    var size = file.size
    var ext = ''
    if (name.indexOf('.') > -1) {
      ext = name.split('.').pop()
    }
    var params = {
      type: 'chunk',
      target,
      file_name: name,
    }
    if (size > 0) {
      params.size = size
    }
    if (ext !== '') {
      params.ext = ext
    }

    if (size === 0) {
      // folder
      // skip
      var file_id = 'error' + new Date().getTime() + 'a' + fileList.length
      // new file info
      this._newFileInfo(
        file_id,
        target,
        true,
        Constants.FILE_STATUS_ERROR,
        name,
        size,
        null,
        null,
      )

      if (!evRecursion || !evRecursion.infoList || !evRecursion.infoList.push) {
        evRecursion = {
          infoList: [],
        }
      }
      var date = new Date()
      evRecursion.infoList.push({
        fileInfo: this.getFileInfo(file_id),
        fileInfos: [this.getFileInfo(file_id)],
        ltime: stringifyTstamp(+date),
        tstamp: int(+date),
      })
      if (fileList.length > 1) {
        // recursion
        var newFileList = []
        for (var i = 1; i < fileList.length; i++) {
          newFileList.push(fileList[i])
        }
        this.sendFiles(options, newFileList, funcOK, funcError, evRecursion)
      } else {
        // end of recursion
        if (funcOK) {
          funcOK(evRecursion)
        }
        return
      }
      return
    }

    // get file_id from server
    var fileProps = {
      file_id: null,
      name,
      target,
      additionals: [],
    }
    if (size > 0) {
      fileProps.size = size
    }
    var prepareFileTransferFuncOK = function (result) {
      var file_id = string(result.file_id)
      if (!fileProps.file_id) {
        // file_id of first user
        fileProps.file_id = file_id
      } else {
        // file_id of additional conf_users
        fileProps.additionals.push({
          file_id,
          target: params.target,
        })
      }
      if (conf_users.length) {
        // get file_id for additional conf_users from server
        params.target = conf_users.shift()
        this._rpcCall(
          'PrepareFileTransfer',
          params,
          prepareFileTransferFuncOK,
          funcError,
        )
      } else {
        // getting file_id completed for all users
        var sendTextParams = {
          text: JSON.stringify(fileProps),
          ctype: Constants.CTYPE_FILE_REQUEST,
        }
        if (conf_id) {
          sendTextParams.conf_id = conf_id
          sendTextParams.conf_type = string(
            this._conferences[conf_id].conf_type,
          )
        } else {
          sendTextParams.target = [target]
        }
        this._rpcCall(
          'SendText',
          sendTextParams,
          function (result) {
            this._lastMessageTime = int(result.tstamp)

            var form

            var fd = options.input.__rnFormData // __rnFormData from react native ./uc.js
            if (!fd && window.FormData) {
              // FormData enabled
              // upload with XHR + FormData
              options.input.form.method = 'POST'
              options.input.form.enctype = 'multipart/form-data'
              fd = new window.FormData(options.input.form)
            }

            this._newFileInfo(
              fileProps.file_id,
              target,
              true,
              Constants.FILE_STATUS_UNACCEPTED,
              name,
              size,
              options.input.form,
              fd,
            )
            for (var i = 0; i < fileProps.additionals.length; i++) {
              // FormData for additional conf_users
              var fd = options.input.__rnFormData // __rnFormData from react native ./uc.js
              if (!fd && window.FormData) {
                // FormData enabled
                // upload with XHR + FormData
                options.input.form.method = 'POST'
                options.input.form.enctype = 'multipart/form-data'
                fd = new window.FormData(options.input.form)
              }
              // new file info for additional conf_users
              this._newFileInfo(
                fileProps.additionals[i].file_id,
                fileProps.additionals[i].target,
                true,
                Constants.FILE_STATUS_UNACCEPTED,
                name,
                size,
                options.input.form,
                fd,
              )
            }

            if (
              !evRecursion ||
              !evRecursion.infoList ||
              !evRecursion.infoList.push
            ) {
              evRecursion = {
                infoList: [],
              }
            }
            var topic_id = ''
            ;(result.topic_ids || []).forEach(function (topic) {
              if (
                topic &&
                topic.tenant ===
                  (sendTextParams.conf_id ? '' : target.tenant) &&
                topic.user_id === (sendTextParams.conf_id ? '' : target.user_id)
              ) {
                topic_id = string(topic.topic_id || '')
              }
            })
            var ltime = stringifyTstamp(result.tstamp)
            evRecursion.infoList.push({
              fileInfo: this.getFileInfo(fileProps.file_id),
              fileInfos: [this.getFileInfo(fileProps.file_id)],
              text_id:
                string(result.action_id) +
                '_' +
                ltime.substr(0, 7).split('-').join(''),
              topic_id,
              ltime,
              tstamp: int(result.tstamp),
            })
            for (var i = 0; i < fileProps.additionals.length; i++) {
              evRecursion.infoList[
                evRecursion.infoList.length - 1
              ].fileInfos.push(
                this.getFileInfo(fileProps.additionals[i].file_id),
              )
            }
            if (fileList.length > 1) {
              // recursion
              var newFileList = []
              for (var i = 1; i < fileList.length; i++) {
                newFileList.push(fileList[i])
              }
              this.sendFiles(
                options,
                newFileList,
                funcOK,
                funcError,
                evRecursion,
              )
            } else {
              // end of recursion
              if (funcOK) {
                funcOK(evRecursion)
              }
              return
            }
          },
          funcError,
        )
      }
    }
    this._rpcCall(
      'PrepareFileTransfer',
      params,
      prepareFileTransferFuncOK,
      funcError,
    )
  },

  /*
   * Function acceptFile
   */
  acceptFile(file_id, form, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'acceptFile failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    file_id = string(file_id)
    var fileInfo = this._fileInfos[file_id]
    if (!fileInfo || !fileInfo.file_id) {
      this._logger.log(
        'info',
        'acceptFile failed (code: ' +
          Errors.ACCEPTFILE_NOT_FOUND_FILE +
          ', message: ' +
          'Not found file_id=' +
          file_id +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.ACCEPTFILE_NOT_FOUND_FILE,
          message: 'Not found file_id=' + file_id,
        }
        funcError(ev)
      }
      return
    }
    if (fileInfo.isUpload || fileInfo.status !== 1) {
      this._logger.log(
        'info',
        'acceptFile failed (code: ' +
          Errors.ACCEPTFILE_INVALID_STATE +
          ', message: ' +
          'Invalid transfer state' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.ACCEPTFILE_INVALID_STATE,
          message: 'Invalid transfer state',
        }
        funcError(ev)
      }
      return
    }

    // start download post
    form.action =
      (this._useHttps ? 'https://' : 'http://') +
      this._host +
      '/' +
      this._path +
      '/file?ACTION=DOWNLOAD&SUBACTION=TRANS&TRANSFER_ID=' +
      encodeURIComponent(file_id) +
      '&tenant=' +
      encodeURIComponent(this._tenant) +
      '&user=' +
      encodeURIComponent(this._user_id)
    form.method = 'POST'
    form.enctype = 'application/x-www-form-urlencoded'
    form.submit()

    // accept
    this._rpcCall(
      'SendClientEvent',
      {
        client_method: 'RecvFile',
        target: fileInfo.target,
        client_param: {
          file_id,
          response: Constants.CTYPE_FILE_ACCEPT,
        },
      },
      function (result) {
        this._changeFileInfo(file_id, Constants.FILE_STATUS_TRANSFERRING, 0)
      },
      funcError,
    )
  },

  /*
   * Function acceptFileWithXhr
   */
  acceptFileWithXhr(file_id, xhr, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'acceptFileWithXhr failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    file_id = string(file_id)
    var fileInfo = this._fileInfos[file_id]
    if (!fileInfo || !fileInfo.file_id) {
      this._logger.log(
        'info',
        'acceptFileWithXhr failed (code: ' +
          Errors.ACCEPTFILE_NOT_FOUND_FILE +
          ', message: ' +
          'Not found file_id=' +
          file_id +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.ACCEPTFILE_NOT_FOUND_FILE,
          message: 'Not found file_id=' + file_id,
        }
        funcError(ev)
      }
      return
    }
    if (fileInfo.isUpload || fileInfo.status !== 1) {
      this._logger.log(
        'info',
        'acceptFileWithXhr failed (code: ' +
          Errors.ACCEPTFILE_INVALID_STATE +
          ', message: ' +
          'Invalid transfer state' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.ACCEPTFILE_INVALID_STATE,
          message: 'Invalid transfer state',
        }
        funcError(ev)
      }
      return
    }

    // start download post
    xhr.open(
      'POST',
      (this._useHttps ? 'https://' : 'http://') +
        this._host +
        '/' +
        this._path +
        '/file?ACTION=DOWNLOAD&SUBACTION=TRANS&TRANSFER_ID=' +
        encodeURIComponent(file_id) +
        '&tenant=' +
        encodeURIComponent(this._tenant) +
        '&user=' +
        encodeURIComponent(this._user_id),
      true,
    )
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send()

    // accept
    this._rpcCall(
      'SendClientEvent',
      {
        client_method: 'RecvFile',
        target: fileInfo.target,
        client_param: {
          file_id,
          response: Constants.CTYPE_FILE_ACCEPT,
        },
      },
      function (result) {
        this._changeFileInfo(file_id, Constants.FILE_STATUS_TRANSFERRING, 0)
      },
      funcError,
    )
  },

  /*
   * Function cancelFile
   */
  cancelFile(file_id, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'cancelFile failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    file_id = string(file_id)
    var fileInfo = this._fileInfos[file_id]
    if (!fileInfo || !fileInfo.file_id) {
      this._logger.log(
        'info',
        'cancelFile failed (code: ' +
          Errors.CANCELFILE_NOT_FOUND_FILE +
          ', message: ' +
          'Not found file_id=' +
          file_id +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.CANCELFILE_NOT_FOUND_FILE,
          message: 'Not found file_id=' + file_id,
        }
        funcError(ev)
      }
      return
    }
    if (fileInfo.status !== 1 && fileInfo.status !== 2) {
      this._logger.log(
        'info',
        'cancelFile failed (code: ' +
          Errors.CANCELFILE_INVALID_STATE +
          ', message: ' +
          'Invalid transfer state' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.CANCELFILE_INVALID_STATE,
          message: 'Invalid transfer state',
        }
        funcError(ev)
      }
      return
    }
    if (fileInfo.isUpload) {
      // cancel upload
      this._rpcCall(
        'SendClientEvent',
        {
          client_method: 'NotifyFileTransfer',
          target: fileInfo.target,
          client_param: {
            file_id,
            status: Constants.CTYPE_FILE_CANCEL,
            progress: fileInfo.progress,
          },
        },
        function (result) {
          this._rpcCall(
            'StopFileTransfer',
            {
              file_id,
            },
            function (result) {
              if (fileInfo._xhr) {
                fileInfo._xhr.abort()
              }
              this._terminateFileInfo(
                file_id,
                Constants.FILE_STATUS_LOCAL_CANCEL,
              )
            },
            funcError,
          )
        },
        funcError,
      )
    } else {
      // cancel (reject) download
      this._rpcCall(
        'SendClientEvent',
        {
          client_method: 'RecvFile',
          target: fileInfo.target,
          client_param: {
            file_id,
            response: Constants.CTYPE_FILE_REJECT,
          },
        },
        function (result) {
          this._terminateFileInfo(file_id, Constants.FILE_STATUS_LOCAL_CANCEL)
        },
        funcError,
      )
    }
  },

  /*
   * Function sendCallResult
   */
  sendCallResult(options, text, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendCallResult failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    options = options || {}

    var sendTextParams = {
      text: string(text),
      ctype: Constants.CTYPE_CALL_RESULT,
    }

    if (options.conf_id) {
      // to conference
      var conf_id = string(options.conf_id)
      if (!this._conferences[conf_id]) {
        this._logger.log(
          'info',
          'sendCallResult failed (code: ' +
            Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF +
            ', message: ' +
            'Not found conf_id=' +
            conf_id +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF,
            message: 'Not found conf_id=' + conf_id,
          }
          funcError(ev)
        }
        return
      }
      sendTextParams.conf_id = conf_id
      sendTextParams.conf_type = string(this._conferences[conf_id].conf_type)
    } else {
      // to user or array
      sendTextParams.target = []
      var targets = [options].concat(options.targets || [])
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].user_id) {
          sendTextParams.target.push({
            tenant: string(targets[i].tenant || this._tenant),
            user_id: string(targets[i].user_id),
          })
        }
      }
      if (sendTextParams.target.length < 1) {
        this._logger.log(
          'info',
          'sendCallResult failed (code: ' +
            Errors.SENDTEXT_EMPTY_USER +
            ', message: ' +
            'Empty user_id' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDTEXT_EMPTY_USER,
            message: 'Empty user_id',
          }
          funcError(ev)
        }
        return
      }
    }

    // send
    this._rpcCall(
      'SendText',
      sendTextParams,
      function (result) {
        this._lastMessageTime = int(result.tstamp)

        if (funcOK) {
          var topic_id = ''
          var target = (sendTextParams.target && sendTextParams.target[0]) || {}
          ;(result.topic_ids || []).forEach(function (topic) {
            if (
              topic &&
              topic.tenant === (sendTextParams.conf_id ? '' : target.tenant) &&
              topic.user_id === (sendTextParams.conf_id ? '' : target.user_id)
            ) {
              topic_id = string(topic.topic_id || '')
            }
          })
          var ltime = stringifyTstamp(result.tstamp)
          var ev = {
            text_id:
              string(result.action_id) +
              '_' +
              ltime.substr(0, 7).split('-').join(''),
            topic_id,
            ltime,
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function sendObject
   */
  sendObject(options, object, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendObject failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    options = options || {}

    var sendTextParams = {
      ctype: Constants.CTYPE_OBJECT,
    }

    if (options.conf_id) {
      var conf_id = string(options.conf_id)
      if (!this._conferences[conf_id]) {
        this._logger.log(
          'info',
          'sendObject failed (code: ' +
            Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF +
            ', message: ' +
            'Not found conf_id=' +
            conf_id +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF,
            message: 'Not found conf_id=' + conf_id,
          }
          funcError(ev)
        }
        return
      }
      sendTextParams.conf_id = conf_id
      sendTextParams.conf_type = string(this._conferences[conf_id].conf_type)
    } else {
      sendTextParams.target = []
      var targets = [options].concat(options.targets || [])
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].user_id) {
          sendTextParams.target.push({
            tenant: string(targets[i].tenant || this._tenant),
            user_id: string(targets[i].user_id),
          })
        }
      }
      if (sendTextParams.target.length < 1) {
        this._logger.log(
          'info',
          'sendObject failed (code: ' +
            Errors.SENDTEXT_EMPTY_USER +
            ', message: ' +
            'Empty user_id' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDTEXT_EMPTY_USER,
            message: 'Empty user_id',
          }
          funcError(ev)
        }
        return
      }
    }

    try {
      sendTextParams.text = JSON.stringify(object)
      if (!sendTextParams.text) {
        throw { message: 'object is invalid' }
      }
    } catch (e) {
      this._logger.log(
        'info',
        'sendObject failed (code: ' +
          Errors.SENDFILES_EMPTY_FILELIST +
          ', message: ' +
          e.message +
          ' at sendObject' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDFILES_EMPTY_FILELIST,
          message: e.message + ' at sendObject',
        }
        funcError(ev)
      }
      return
    }

    // send
    this._rpcCall(
      'SendText',
      sendTextParams,
      function (result) {
        this._lastMessageTime = int(result.tstamp)

        if (funcOK) {
          var topic_id = ''
          var target = (sendTextParams.target && sendTextParams.target[0]) || {}
          ;(result.topic_ids || []).forEach(function (topic) {
            if (
              topic &&
              topic.tenant === (sendTextParams.conf_id ? '' : target.tenant) &&
              topic.user_id === (sendTextParams.conf_id ? '' : target.user_id)
            ) {
              topic_id = string(topic.topic_id || '')
            }
          })
          var ltime = stringifyTstamp(result.tstamp)
          var ev = {
            text_id:
              string(result.action_id) +
              '_' +
              ltime.substr(0, 7).split('-').join(''),
            topic_id,
            ltime,
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function sendConfLeave
   */
  sendConfLeave(options, text, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendConfLeave failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    options = options || {}

    var sendTextParams = {
      text: string(text),
      ctype: Constants.CTYPE_CONF_LEAVE,
    }

    if (options.conf_id) {
      // to conference
      var conf_id = string(options.conf_id)
      if (!this._conferences[conf_id]) {
        this._logger.log(
          'info',
          'sendConfLeave failed (code: ' +
            Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF +
            ', message: ' +
            'Not found conf_id=' +
            conf_id +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDCONFERENCETEXT_NOT_FOUND_CONF,
            message: 'Not found conf_id=' + conf_id,
          }
          funcError(ev)
        }
        return
      }
      sendTextParams.conf_id = conf_id
      sendTextParams.conf_type = string(this._conferences[conf_id].conf_type)
    } else {
      // to user or array
      sendTextParams.target = []
      var targets = [options].concat(options.targets || [])
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].user_id) {
          sendTextParams.target.push({
            tenant: string(targets[i].tenant || this._tenant),
            user_id: string(targets[i].user_id),
          })
        }
      }
      if (sendTextParams.target.length < 1) {
        this._logger.log(
          'info',
          'sendConfLeave failed (code: ' +
            Errors.SENDTEXT_EMPTY_USER +
            ', message: ' +
            'Empty user_id' +
            ')',
        )
        if (funcError) {
          var ev = {
            code: Errors.SENDTEXT_EMPTY_USER,
            message: 'Empty user_id',
          }
          funcError(ev)
        }
        return
      }
    }

    // send
    this._rpcCall(
      'SendText',
      sendTextParams,
      function (result) {
        this._lastMessageTime = int(result.tstamp)

        if (funcOK) {
          var topic_id = ''
          var target = (sendTextParams.target && sendTextParams.target[0]) || {}
          ;(result.topic_ids || []).forEach(function (topic) {
            if (
              topic &&
              topic.tenant === (sendTextParams.conf_id ? '' : target.tenant) &&
              topic.user_id === (sendTextParams.conf_id ? '' : target.user_id)
            ) {
              topic_id = string(topic.topic_id || '')
            }
          })
          var ltime = stringifyTstamp(result.tstamp)
          var ev = {
            text_id:
              string(result.action_id) +
              '_' +
              ltime.substr(0, 7).split('-').join(''),
            topic_id,
            ltime,
            tstamp: int(result.tstamp),
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function makeCall
   */
  makeCall(target, mediaConstraints, option, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    // check arguments
    if (!this._phone) {
      if (funcError) {
        var ev = {
          code: Errors.MAKECALL_WEBRTC_UNAVAILABLE,
          message: 'WebRTC unavailable',
        }
        funcError(ev)
      }
      return
    }
    if (target && target.user_id) {
      target = {
        tenant: string(target.tenant || this._tenant),
        user_id: string(target.user_id),
      }
    } else if (target && target.conf_id) {
      target = {
        conf_id: string(target.conf_id),
      }
    } else if (target) {
      target = {
        address: string(target.address || target),
      }
    } else {
      if (funcError) {
        var ev = {
          code: Errors.MAKECALL_EMPTY_TARGET,
          message: 'Empty target',
        }
        funcError(ev)
      }
      return
    }
    if (
      !mediaConstraints ||
      !(mediaConstraints.audio || mediaConstraints.video)
    ) {
      if (funcError) {
        var ev = {
          code: Errors.MAKECALL_EMPTY_CONSTRAINTS,
          message: 'Empty mediaConstraints',
        }
        funcError(ev)
      }
      return
    }
    mediaConstraints = {
      audio: mediaConstraints.audio || false,
      video: mediaConstraints.video || false,
    }
    if (!option) {
      option = {}
    }

    var sessionBundleId
    if (!option.call_id) {
      // numbering sessionBundleId
      sessionBundleId = ++this._sessionBundleIdCounter
    } else {
      sessionBundleId = option.call_id
      if (
        !this._sessionBundleTable[sessionBundleId] ||
        this._makeCallStatus[sessionBundleId]
      ) {
        if (funcError) {
          var ev = {
            code: Errors.MAKECALL_INVALID_CALL,
            message: 'Invalid option.call_id',
          }
          funcError(ev)
        }
        return
      }
    }

    // send shared object
    if (target.user_id && option.sharedObject) {
      var newOption = {}
      for (var key in option) {
        if (key === 'sharedObject') {
          newOption._sharedObject = option[key]
        } else {
          newOption[key] = option[key]
        }
      }
      this._sendSharedObject(
        target,
        option.sharedObject,
        this._byThis(this.makeCall, [
          target,
          mediaConstraints,
          newOption,
          funcOK,
          funcError,
        ]),
        funcError,
      )
      return
    }
    var sharedObjectJson = JSON.stringify(
      option.sharedObject || option._sharedObject || {},
    )

    // initialize makeCall parameters
    var makeCallParamsArray = [] // able to make multi-session
    if (target.user_id) {
      // user_id
      var targetExtension = target.user_id // pbx extension
      // get pnumber
      var targetPnumber = null // sip address
      if (
        this._phoneProperties.mode_uc_call === 1 ||
        (this._phoneProperties.mode_uc_call === 2 && mediaConstraints.video)
      ) {
        var buddyPhone =
          this._buddyPhone[
            JSON.stringify({ tenant: target.tenant, user_id: target.user_id })
          ]
        if (buddyPhone) {
          targetPnumber = string(buddyPhone.pnumber)
        }
        if (targetPnumber === null) {
          if (funcError) {
            var ev = {
              code: Errors.MAKECALL_PNUMBER,
              message: 'Target has no pnumber',
            }
            funcError(ev)
          }
          return
        }
      }
      // mode_uc_call
      if (this._phoneProperties.mode_uc_call === 1) {
        // directly
        makeCallParamsArray.push({
          targetAddress: targetPnumber,
          mediaConstraints,
          extraHeaders: this._phoneProperties.extraHeaderArray,
          tenant: target.tenant,
          user_id: target.user_id,
        })
      } else if (this._phoneProperties.mode_uc_call === 2) {
        // audio via PBX, video directly
        if (mediaConstraints.audio) {
          // audio session
          makeCallParamsArray.push({
            targetAddress: targetExtension,
            mediaConstraints: { audio: mediaConstraints.audio, video: false },
            extraHeaders: [],
            tenant: target.tenant,
            user_id: target.user_id,
          })
        }
        if (mediaConstraints.video) {
          // video session
          makeCallParamsArray.push({
            targetAddress: targetPnumber,
            mediaConstraints: { audio: false, video: mediaConstraints.video },
            extraHeaders: this._phoneProperties.extraHeaderArray,
            tenant: target.tenant,
            user_id: target.user_id,
          })
        }
      } else {
        // via PBX
        makeCallParamsArray.push({
          targetAddress: targetExtension,
          mediaConstraints,
          extraHeaders: [],
          tenant: target.tenant,
          user_id: target.user_id,
        })
      }
    } else if (target.conf_id) {
      // conf_id
      var conf_id = target.conf_id
      if (
        !this._conferences[conf_id] ||
        int(this._conferences[conf_id].conf_status) !==
          Constants.CONF_STATUS_JOINED
      ) {
        if (funcError) {
          var ev = {
            code: Errors.MAKECALL_NOT_JOINED_CONF,
            message: 'Not joined conf_id=' + conf_id,
          }
          funcError(ev)
        }
        return
      }
      var targetExtension = this.PREFIX_CONFERENCE_EXTENSION + conf_id // pbx extension
      // get members pnumber
      var targetUsers = []
      if (
        this._phoneProperties.mode_uc_call === 1 ||
        (this._phoneProperties.mode_uc_call === 2 && mediaConstraints.video)
      ) {
        for (var i = 0; i < this._conferences[conf_id].user.length; i++) {
          var user = this._conferences[conf_id].user[i]
          // only member in video conference call
          if (int(user.video_conf_status) === 7) {
            var buddyPhone =
              this._buddyPhone[
                JSON.stringify({
                  tenant: string(user.tenant || this._tenant),
                  user_id: string(user.user_id),
                })
              ]
            if (buddyPhone) {
              targetUsers.push({
                pnumber: string(buddyPhone.pnumber),
                tenant: string(user.tenant || this._tenant),
                user_id: string(user.user_id),
              })
            }
          }
        }
        // join conference call
        this._conferenceCalls[conf_id] = true
        this._rpcCall(
          'JoinConference',
          {
            conf_id,
            video_conf: this.VIDEO_CONF_VIDEO,
            properties: {
              invisible: false,
            },
          },
          null,
          null,
        )
      } else {
        // join conference call
        this._rpcCall(
          'JoinConference',
          {
            conf_id,
            video_conf: this.VIDEO_CONF_AUDIO,
            properties: {
              invisible: false,
            },
          },
          null,
          null,
        )
      }
      // mode_uc_call
      if (this._phoneProperties.mode_uc_call === 1) {
        // directly
        for (var i = 0; i < targetUsers.length; i++) {
          makeCallParamsArray.push({
            targetAddress: targetUsers[i].pnumber,
            mediaConstraints,
            extraHeaders: this._phoneProperties.extraHeaderArray,
            tenant: targetUsers[i].tenant,
            user_id: targetUsers[i].user_id,
          })
        }
      } else if (this._phoneProperties.mode_uc_call === 2) {
        // audio via PBX, video directly
        if (mediaConstraints.audio) {
          // audio session
          makeCallParamsArray.push({
            targetAddress: targetExtension,
            mediaConstraints: { audio: mediaConstraints.audio, video: false },
            extraHeaders: [],
            tenant: '',
            user_id: '',
          })
        }
        if (mediaConstraints.video) {
          // video session
          for (var i = 0; i < targetUsers.length; i++) {
            makeCallParamsArray.push({
              targetAddress: targetUsers[i].pnumber,
              mediaConstraints: { audio: false, video: mediaConstraints.video },
              extraHeaders: this._phoneProperties.extraHeaderArray,
              tenant: targetUsers[i].tenant,
              user_id: targetUsers[i].user_id,
            })
          }
        }
      } else {
        // via PBX
        makeCallParamsArray.push({
          targetAddress: targetExtension,
          mediaConstraints,
          extraHeaders: [],
          tenant: '',
          user_id: '',
        })
      }
    } else {
      // address
      makeCallParamsArray.push({
        targetAddress: target.address,
        mediaConstraints,
        extraHeaders: [],
        tenant: '',
        user_id: '',
      })
    }

    if (target.conf_id && makeCallParamsArray.length === 0) {
      // create sessionBundle
      sessionBundle = {
        target,
        sessionIdArray: [],
        lastCallInfo: '',
        direction: Constants.CALL_DIRECTION_OUTGOING,
        microphoneMuted: false,
        cameraMuted: false,
        autoAnswer: true,
        autoTerminate: false,
        mediaConstraints,
        sharedObjectJson,
        singleSession: Boolean(option.singleSession),
      }
      if (!this._sessionBundleTable[sessionBundleId]) {
        this._sessionBundleTable[sessionBundleId] = sessionBundle
        var callInfo = this.getCallInfo(sessionBundleId)
        this._sessionBundleTable[sessionBundleId].lastCallInfo =
          JSON.stringify(callInfo)
      }
      if (funcOK) {
        var ev = {
          callInfo,
        }
        funcOK(ev)
      }
      return
    }

    // makeCall timeout timer
    var timer = setTimeout(
      this._byThis(this._makeCallTimeout, [sessionBundleId]),
      this.MAKE_CALL_TIMEOUT_DEFAULT,
    )

    // memory timer and callback functions for each sessionBundleId
    this._makeCallStatus[sessionBundleId] = {
      timer,
      funcOK,
      funcError,
    }

    // do makeCall
    for (var i = 0; i < makeCallParamsArray.length; i++) {
      this._phone.makeCall(
        makeCallParamsArray[i].targetAddress,
        makeCallParamsArray[i].mediaConstraints,
        makeCallParamsArray[i].extraHeaders,
        {
          sessionBundleId,
          target,
          tenant: makeCallParamsArray[i].tenant,
          user_id: makeCallParamsArray[i].user_id,
          mediaConstraints,
          sharedObjectJson,
          singleSession: Boolean(option.singleSession),
        },
      )
    }
  },

  /*
   * Function muteMicrophone
   */
  muteMicrophone(call_id, muted) {
    if (this._signInStatus !== 3) {
      this._logger.log('warn', 'Not signed-in')
      return
    }

    var sessionBundleId = string(call_id)
    muted = Boolean(muted)
    var sessionBundle = this._sessionBundleTable[sessionBundleId]
    if (sessionBundle) {
      sessionBundle.microphoneMuted = muted
      for (var i = 0; i < sessionBundle.sessionIdArray.length; i++) {
        var session = this._phone.getCallSession(
          sessionBundle.sessionIdArray[i],
        )
        if (session && session.status === 'answered') {
          session.muteMicrophone(muted)
        }
      }

      // raise callInfoChanged event
      this._callInfoChanged(sessionBundleId)
    }
  },

  /*
   * Function muteCamera
   */
  muteCamera(call_id, muted) {
    if (this._signInStatus !== 3) {
      this._logger.log('warn', 'Not signed-in')
      return
    }

    var sessionBundleId = string(call_id)
    muted = Boolean(muted)
    var sessionBundle = this._sessionBundleTable[sessionBundleId]
    if (sessionBundle) {
      sessionBundle.cameraMuted = muted
      for (var i = 0; i < sessionBundle.sessionIdArray.length; i++) {
        var session = this._phone.getCallSession(
          sessionBundle.sessionIdArray[i],
        )
        if (session && session.status === 'answered') {
          session.muteCamera(muted)
        }
      }

      // raise callInfoChanged event
      this._callInfoChanged(sessionBundleId)
    }
  },

  /*
   * Function answerCall
   */
  answerCall(call_id, mediaConstraints) {
    if (this._signInStatus !== 3) {
      this._logger.log('warn', 'Not signed-in')
      return
    }

    if (
      !mediaConstraints ||
      !(mediaConstraints.audio || mediaConstraints.video)
    ) {
      return
    }
    var sessionBundleId = string(call_id)
    var sessionBundle = this._sessionBundleTable[sessionBundleId]
    if (sessionBundle) {
      sessionBundle.autoAnswer = true
      sessionBundle.mediaConstraints = {
        audio: mediaConstraints.audio || false,
        video: mediaConstraints.video || false,
      }
      for (var i = 0; i < sessionBundle.sessionIdArray.length; i++) {
        var session = this._phone.getCallSession(
          sessionBundle.sessionIdArray[i],
        )
        if (session && session.status === 'incoming') {
          var audioConstraints = session.mediaConstraints.audio
            ? sessionBundle.mediaConstraints.audio
            : false
          var videoConstraints = session.mediaConstraints.video
            ? sessionBundle.mediaConstraints.video
            : false
          if (audioConstraints || videoConstraints) {
            session.answer({
              audio: audioConstraints,
              video: videoConstraints,
            })
          }
        }
      }
    }
  },

  /*
   * Function sendDTMF
   */
  sendDTMF(call_id, tone) {
    if (this._signInStatus !== 3) {
      this._logger.log('warn', 'Not signed-in')
      return
    }

    var sessionBundleId = string(call_id)
    var sessionBundle = this._sessionBundleTable[sessionBundleId]
    if (sessionBundle) {
      for (var i = 0; i < sessionBundle.sessionIdArray.length; i++) {
        var session = this._phone.getCallSession(
          sessionBundle.sessionIdArray[i],
        )
        if (
          session &&
          session.status === 'answered' &&
          session.mediaConstraints.audio
        ) {
          session.sendDTMF(tone)
        }
      }
    }
  },

  /*
   * Function clearCall
   */
  clearCall(call_id) {
    if (this._signInStatus !== 3) {
      this._logger.log('warn', 'Not signed-in')
      return
    }

    var sessionBundleId = string(call_id)
    var sessionBundle = this._sessionBundleTable[sessionBundleId]
    if (sessionBundle) {
      sessionBundle.autoTerminate = true
      for (var i = sessionBundle.sessionIdArray.length - 1; i >= 0; i--) {
        var session = this._phone.getCallSession(
          sessionBundle.sessionIdArray[i],
        )
        if (session && session.status !== 'terminated') {
          session.hangUp()
        }
      }
      // raise callInfoChanged event
      this._callInfoChanged(sessionBundleId)
    }
  },

  /*
   * Function sendCustomClientEvent
   */
  sendCustomClientEvent(target, client_param, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'sendCustomClientEvent failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!target.user_id) {
      this._logger.log(
        'info',
        'sendCustomClientEvent failed (code: ' +
          Errors.SENDTYPING_EMPTY_USER +
          ', message: ' +
          'Empty target.user_id' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SENDTYPING_EMPTY_USER,
          message: 'Empty target.user_id',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'SendClientEvent',
      {
        client_method: 'CustomClientEvent',
        target: {
          tenant: string(target.tenant || this._tenant),
          user_id: string(target.user_id),
        },
        client_param,
      },
      funcOK,
      funcError,
    )
  },

  /*
   * Function updateTag
   */
  updateTag(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'updateTag failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var text_id = string(options && options.attached_id).split('_')
    if (
      text_id[1] &&
      (options.attached_type === 'text' || options.attached_type === 'topic')
    ) {
      // clone options
      var optionsOrg = options
      options = {}
      var keys = Object.keys(optionsOrg)
      for (var i = 0; i < keys.length; i++) {
        options[keys[i]] = optionsOrg[keys[i]]
      }
      // convert format
      if (options.attached_type === 'text') {
        options.attached_type = 'action'
      }
      options.attached_id = text_id[0]
      options.yyyymm = text_id[1]
    }
    if (
      !options.yyyymm &&
      options.attached_type === 'conf' &&
      this._conferences[options.attached_id]
    ) {
      // clone options
      var optionsOrg = options
      options = {}
      var keys = Object.keys(optionsOrg)
      for (var i = 0; i < keys.length; i++) {
        options[keys[i]] = optionsOrg[keys[i]]
      }
      // complement yyyymm
      options.yyyymm = string(
        this._conferences[options.attached_id].created_server_time,
      )
        .split('-')
        .join('')
        .substr(0, 6)
    }

    this._rpcCall('UpdateTag', options, funcOK, funcError)
  },

  /*
   * Function searchTopicsByDate
   */
  searchTopicsByDate(date, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'searchTopicsByDate failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!date || !date.getTime || !date.getTime()) {
      this._logger.log(
        'info',
        'searchTopicsByDate failed (code: ' +
          Errors.SEARCHTOPICSBYDATE_INVALID_DATE +
          ', message: ' +
          'Invalid date' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SEARCHTOPICSBYDATE_INVALID_DATE,
          message: 'Invalid date',
        }
        funcError(ev)
      }
      return
    }

    var dateString =
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2) +
      ' 00:00:00'

    this._rpcCall(
      'LogSearch',
      {
        date: dateString,
      },
      function (result) {
        var topics = []
        var addedConfs = []
        var addedUsers = []
        for (var i = 0; i < result.topics.length; i++) {
          if (result.topics[i].conf_id) {
            if (addedConfs.indexOf(result.topics[i].conf_id) === -1) {
              var topic = {
                topic_id: string(++this._topicIdCounter),
                conf_id: string(result.topics[i].conf_id),
                subject: string(result.topics[i].subject),
              }
              topics.push(topic)
              addedConfs.push(result.topics[i].conf_id)
              this._topics[topic.topic_id] = {
                date: dateString,
                conf_id: result.topics[i].conf_id,
              }
            }
          } else if (result.topics[i].sender) {
            var opposite
            if (
              result.topics[i].sender.tenant !== this._tenant ||
              result.topics[i].sender.user_id !== this._user_id
            ) {
              opposite = result.topics[i].sender
            } else {
              opposite = result.topics[i].receiver
            }
            if (opposite) {
              if (
                addedUsers.indexOf(
                  JSON.stringify({
                    tenant: opposite.tenant,
                    user_id: opposite.user_id,
                  }),
                ) === -1
              ) {
                var topic = {
                  topic_id: string(++this._topicIdCounter),
                  tenant: string(opposite.tenant),
                  user_id: string(opposite.user_id),
                  user_name: string(opposite.user_name),
                }
                topics.push(topic)
                addedUsers.push(
                  JSON.stringify({
                    tenant: opposite.tenant,
                    user_id: opposite.user_id,
                  }),
                )
                this._topics[topic.topic_id] = {
                  date: dateString,
                  tenant: opposite.tenant,
                  user_id: opposite.user_id,
                }
              }
            }
          }
        }
        if (funcOK) {
          var ev = {
            topics,
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function searchLogsByTopic
   */
  searchLogsByTopic(topic_id, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'searchLogsByTopic failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (!topic_id || !this._topics[topic_id]) {
      this._logger.log(
        'info',
        'searchLogsByTopic failed (code: ' +
          Errors.SEARCHLOGSBYTOPIC_INVALID_TOPIC +
          ', message: ' +
          'Invalid topic_id' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.SEARCHLOGSBYTOPIC_INVALID_TOPIC,
          message: 'Invalid topic_id',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetLog',
      this._topics[topic_id],
      function (result) {
        var logs = []
        for (var i = 0; i < result.logs.length; i++) {
          logs.push({
            content: string(result.logs[i].content),
            sender: {
              tenant: string(result.logs[i].sender.tenant),
              user_id: string(result.logs[i].sender.user_id),
              user_name: string(result.logs[i].sender.user_name),
            },
            receiver: {
              tenant: string(result.logs[i].receiver.tenant),
              user_id: string(result.logs[i].receiver.user_id),
              user_name: string(result.logs[i].receiver.user_name),
            },
            ltime: stringifyTstamp(result.logs[i].tstamp),
          })
        }
        if (funcOK) {
          var ev = {
            logs,
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function searchTopicsByCondition
   */
  searchTopicsByCondition(condition, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'searchTopicsByCondition failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    // check condition
    var toArray = function (a) {
      if (typeof a === 'string' && a.length) {
        return a.split(' ')
      } else if (a && a.length) {
        return a
      } else {
        return []
      }
    }
    var content = toArray(condition.content)
    var name = toArray(condition.name)
    var subject = toArray(condition.subject)
    var any = toArray(condition.any)
    var tenant = string(condition.tenant) || null
    var user_id = string(condition.user_id) || null
    var conf_type = toArray(condition.conf_type)
    var conf_id = toArray(condition.conf_id)
    var tenant_me =
      condition.tenant_me || condition.tenant_me === ''
        ? string(condition.tenant_me)
        : null
    var user_id_me =
      condition.user_id_me || condition.user_id_me === ''
        ? string(condition.user_id_me)
        : null
    var tags = condition.tags && condition.tags.length ? condition.tags : []
    var begin = string(condition.begin) || null
    var end = string(condition.end) || null
    var asc = Boolean(condition.asc)
    var max = int(condition.max) || null

    this._rpcCall(
      'SearchTopics',
      {
        content,
        name,
        subject,
        any,
        tenant,
        user_id,
        conf_type,
        conf_id,
        tenant_me,
        user_id_me,
        tags,
        begin,
        end,
        asc,
        max,
      },
      function (result) {
        if (funcOK) {
          var ev = result
          if (ev && ev.topics) {
            for (var i = 0; i < ev.topics.length; i++) {
              ev.topics[i].object = undefined
              if (ev.topics[i].ctype === Constants.CTYPE_OBJECT) {
                try {
                  ev.topics[i].object = JSON.parse(ev.topics[i].content)
                } catch (e) {
                  this._logger.log(
                    'warn',
                    e.message + ' at searchTopicsByCondition',
                  )
                }
              }
              ev.topics[i].ltime = stringifyTstamp(ev.topics[i].tstamp)
            }
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function searchTopicTexts
   */
  searchTopicTexts(topic_id, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'searchTopicTexts failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'SearchTopicTexts',
      {
        topic_id: string(topic_id),
      },
      function (result) {
        if (funcOK) {
          var ev = result
          if (ev && ev.logs && ev.senders) {
            for (var i = 0; i < ev.logs.length; i++) {
              ev.logs[i].sender = ev.senders[ev.logs[i].sender]
              ev.logs[i].object = undefined
              if (ev.logs[i].ctype === Constants.CTYPE_OBJECT) {
                try {
                  ev.logs[i].object = JSON.parse(ev.logs[i].content)
                } catch (e) {
                  this._logger.log('warn', e.message + ' at searchTopicTexts')
                }
              }
              ev.logs[i].ltime = stringifyTstamp(ev.logs[i].tstamp)
            }
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function searchConferenceTexts
   */
  searchConferenceTexts(condition, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'searchConferenceTexts failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'SearchConferenceTexts',
      {
        conf_id: string(condition && condition.conf_id),
        topic_id: string(condition && condition.topic_id),
        yyyymm: string(condition && condition.yyyymm),
        searchtoken: string(condition && condition.searchtoken),
      },
      function (result) {
        if (funcOK) {
          var ev = result
          if (ev && ev.logs) {
            for (var i = 0; i < ev.logs.length; i++) {
              ev.logs[i].sender =
                (ev.senders && ev.senders[ev.logs[i].sender]) || {}
              ev.logs[i].object = undefined
              if (ev.logs[i].ctype === Constants.CTYPE_OBJECT) {
                try {
                  ev.logs[i].object = JSON.parse(ev.logs[i].content)
                } catch (e) {
                  this._logger.log(
                    'warn',
                    e.message + ' at searchConferenceTexts',
                  )
                }
              }
              ev.logs[i].topic_id = string(ev.logs[i].topic_id || '')
              ev.logs[i].ltime = stringifyTstamp(ev.logs[i].tstamp)
            }
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function searchRelatedConferenceTexts
   */
  searchRelatedConferenceTexts(condition, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'searchRelatedConferenceTexts failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'SearchRelatedConferenceTexts',
      condition,
      function (result) {
        if (funcOK) {
          var ev = result
          if (ev && ev.logs) {
            for (var i = 0; i < ev.logs.length; i++) {
              ev.logs[i].sender =
                (ev.senders && ev.senders[ev.logs[i].sender]) || {}
              ev.logs[i].object = undefined
              if (ev.logs[i].ctype === Constants.CTYPE_OBJECT) {
                try {
                  ev.logs[i].object = JSON.parse(ev.logs[i].content)
                } catch (e) {
                  this._logger.log(
                    'warn',
                    e.message + ' at searchRelatedConferenceTexts',
                  )
                }
              }
              ev.logs[i].topic_id = string(ev.logs[i].topic_id || '')
              ev.logs[i].ltime = stringifyTstamp(ev.logs[i].tstamp)
            }
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function searchTexts
   */
  searchTexts(condition, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'searchTexts failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    // check condition
    var tenant = string(condition.tenant) || null
    var user_id = string(condition.user_id) || null
    var conf_id = string(condition.conf_id) || null
    var begin = string(condition.begin) || null
    var end = string(condition.end) || null
    var asc = Boolean(condition.asc)
    var max = int(condition.max) || null

    this._rpcCall(
      'SearchTexts',
      {
        tenant,
        user_id,
        conf_id,
        begin,
        end,
        asc,
        max,
      },
      function (result) {
        if (funcOK) {
          var ev = result
          if (ev && ev.logs) {
            for (var i = 0; i < ev.logs.length; i++) {
              ev.logs[i].sender =
                (ev.senders && ev.senders[ev.logs[i].sender]) || {}
              ev.logs[i].object = undefined
              if (ev.logs[i].ctype === Constants.CTYPE_OBJECT) {
                try {
                  ev.logs[i].object = JSON.parse(ev.logs[i].content)
                } catch (e) {
                  this._logger.log('warn', e.message + ' at searchTexts')
                }
              }
              ev.logs[i].topic_id = string(ev.logs[i].topic_id || '')
              ev.logs[i].ltime = stringifyTstamp(ev.logs[i].tstamp)
            }
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function getServerTime
   */
  getServerTime(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'getServerTime failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetServerTime',
      {},
      function (result) {
        if (funcOK) {
          var ev = {
            time: stringifyTstamp(result.tstamp),
            tstamp: int(result.tstamp),
            serverTime: string(result.ltime),
          }
          funcOK(ev)
        }
      },
      funcError,
    )
  },

  /*
   * Function createGuestAccount
   */
  createGuestAccount(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'createGuestAccount failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      tenant: string(this._tenant),
    }
    if (options && options.name) {
      params.name = string(options.name)
    }
    if (options && options.email) {
      params.email = string(options.email)
    }

    this._rpcCall(
      'CreateGuestUser',
      params,
      function (result) {
        if (funcOK) {
          var ev = {
            tenant: string(this._tenant),
            user_id: string(result.user_id),
            password: string(result.password),
            expire_time: int(result.expire_time),
            login_token: string(result.login_token),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function loadSystemProperties
   */
  loadSystemProperties(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'loadSystemProperties failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'loadSystemProperties failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetSystemProperties',
      {
        type: 'all',
      },
      function (result) {
        if (funcOK) {
          var ev = {
            systemProperties: {
              db: result.db,
              pbx: result.pbx,
              cim: result.cim,
              log: result.log,
              misc: result.misc,
            },
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function saveSystemProperties
   */
  saveSystemProperties(systemProperties, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'saveSystemProperties failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'saveSystemProperties failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      type: 'db,pbx,cim,log,misc',
      db: systemProperties.db,
      pbx: systemProperties.pbx,
      cim: systemProperties.cim,
      log: systemProperties.log,
      misc: systemProperties.misc,
    }

    this._rpcCall(
      'SetSystemProperties',
      params,
      function (result) {
        var func = function () {}
        if (funcOK) {
          var ev = {
            result,
          }
          func = function () {
            funcOK(ev)
          }
        }
        if (result && result.database_task_id) {
          if (
            this._databaseTaskTable[result.database_task_id] ===
            'DATABASETASKENDED'
          ) {
            func()
            delete this._databaseTaskTable[result.database_task_id]
          } else {
            this._databaseTaskTable[result.database_task_id] = func
          }
        } else {
          func()
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function loadTenantProperties
   */
  loadTenantProperties(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'loadTenantProperties failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (
      this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN &&
      this.getProfile().user_type !== Constants.USER_TYPE_TENANT_ADMIN
    ) {
      this._logger.log(
        'info',
        'loadTenantProperties failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetTenantProperties',
      {},
      function (result) {
        if (funcOK) {
          var ev = {
            tenantProperties: result,
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function saveTenantProperties
   */
  saveTenantProperties(tenantProperties, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'saveTenantProperties failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (
      this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN &&
      this.getProfile().user_type !== Constants.USER_TYPE_TENANT_ADMIN
    ) {
      this._logger.log(
        'info',
        'saveTenantProperties failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'SetTenantProperties',
      tenantProperties,
      function (result) {
        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function createTenantProperties
   */
  createTenantProperties(tenant, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'createTenantProperties failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'createTenantProperties failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'CreateTenantProperties',
      {
        tenant: string(tenant),
      },
      function (result) {
        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function createTenantListFromPbx
   */
  createTenantListFromPbx(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'createTenantListFromPbx failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'createTenantListFromPbx failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'CreateTenantListFromPbx',
      {},
      function (result) {
        if (funcOK) {
          var ev = {
            tenantProperties: result,
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function loadTenantSettings
   */
  loadTenantSettings(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'loadTenantSettings failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'loadTenantSettings failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetTenantSettings',
      {},
      function (result) {
        if (funcOK) {
          var ev = {
            tenantSettings: result,
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function saveTenantSettings
   */
  saveTenantSettings(tenantSettings, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'saveTenantSettings failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'saveTenantSettings failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'SetTenantSettings',
      tenantSettings,
      function (result) {
        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function loadTenantListFromPbx
   */
  loadTenantListFromPbx(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'loadTenantListFromPbx failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'loadTenantListFromPbx failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetTenantListFromPbx',
      {},
      function (result) {
        if (funcOK) {
          var ev = {
            tenantList: result,
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function loadAdvancedSettings
   */
  loadAdvancedSettings(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'loadAdvancedSettings failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'loadAdvancedSettings failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetSystemProperties',
      {
        type: 'adv',
      },
      function (result) {
        if (funcOK) {
          var ev = {
            advancedSettings: string(
              result && result.adv && result.adv.settings,
            ),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function saveAdvancedSettings
   */
  saveAdvancedSettings(advancedSettings, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'saveAdvancedSettings failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'saveAdvancedSettings failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      type: 'adv',
      adv: { settings: advancedSettings },
    }

    this._rpcCall(
      'SetSystemProperties',
      params,
      function (result) {
        this._rpcCall(
          'GetSystemProperties',
          { type: 'configproperties' },
          function (result) {
            if (result && result.configproperties) {
              this._configProperties = result.configproperties
            }
            if (funcOK) {
              var ev = {}
              funcOK(ev)
            }
          },
          function (error) {
            if (funcOK) {
              var ev = {}
              funcOK(ev)
            }
          },
        )
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function loadBlockListSettings
   */
  loadBlockListSettings(funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'loadBlockListSettings failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'loadBlockListSettings failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall(
      'GetSystemProperties',
      {
        type: 'blocklist',
      },
      function (result) {
        if (funcOK) {
          var ev = {
            blocklist: (result && result.blocklist) || {},
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function saveBlockListSettings
   */
  saveBlockListSettings(blocklist, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'saveBlockListSettings failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'saveBlockListSettings failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      type: 'blocklist',
      blocklist,
    }

    this._rpcCall(
      'SetSystemProperties',
      params,
      function (result) {
        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function removeBlockedAddress
   */
  removeBlockedAddress(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'removeBlockedAddress failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'removeBlockedAddress failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      ip: string(options.ip),
    }

    this._rpcCall(
      'RemoveBlockedAddress',
      params,
      function (result) {
        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function startUserSearch
   */
  startUserSearch(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'startUserSearch failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'startUserSearch failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall('StartUserSearch', options || {}, funcOK, funcError)
  },

  /*
   * Function cancelUserSearch
   */
  cancelUserSearch(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'cancelUserSearch failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'cancelUserSearch failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall('CancelUserSearch', options || {}, funcOK, funcError)
  },

  /*
   * Function startUserDelete
   */
  startUserDelete(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'startUserDelete failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'startUserDelete failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    this._rpcCall('StartUserDelete', options || {}, funcOK, funcError)
  },

  /*
   * Function prepareDebugLog
   */
  prepareDebugLog(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'prepareDebugLog failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'prepareDebugLog failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      days: string(options && options.days),
    }

    this._rpcCall(
      'PrepareDebugLog',
      params,
      function (result) {
        if (funcOK) {
          var ev = {
            debug_log_id: string(result && result.debug_log_id),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function cancelDebugLog
   */
  cancelDebugLog(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'cancelDebugLog failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN) {
      this._logger.log(
        'info',
        'cancelDebugLog failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      debug_log_id: string(options && options.debug_log_id),
    }

    this._rpcCall(
      'CancelDebugLog',
      params,
      function (result) {
        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function createSocialToken
   */
  createSocialToken(options, funcOK, funcError) {
    if (this._signInStatus !== 3) {
      this._logger.log(
        'info',
        'createSocialToken failed (code: ' +
          Errors.NOT_SIGNED_IN +
          ', message: ' +
          'Not signed-in' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.NOT_SIGNED_IN,
          message: 'Not signed-in',
        }
        funcError(ev)
      }
      return
    }

    if (
      this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN &&
      this.getProfile().user_type !== Constants.USER_TYPE_TENANT_ADMIN
    ) {
      this._logger.log(
        'info',
        'createSocialToken failed (code: ' +
          Errors.INVALID_USER_TYPE +
          ', message: ' +
          'Invalid user_type' +
          ')',
      )
      if (funcError) {
        var ev = {
          code: Errors.INVALID_USER_TYPE,
          message: 'Invalid user_type',
        }
        funcError(ev)
      }
      return
    }

    var params = {
      social: string(options && options.social),
    }
    if (options && options.tenant) {
      params.tenant = options.tenant
    }

    this._rpcCall(
      'CreateSocialToken',
      params,
      function (result) {
        if (funcOK) {
          var ev = {
            result: string(result),
          }
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
      },
    )
  },

  /*
   * Function getProfile
   */
  getProfile() {
    var profile = {}
    profile.tenant = this._tenant
    profile.user_id = this._user_id
    profile.name = this._profile ? string(this._profile.name) : ''
    profile.group = this._profile ? string(this._profile.group) : ''
    profile.email = this._profile ? string(this._profile.email) : ''
    profile.password = this._profile ? string(this._profile.password) : ''
    profile.user_type = this._profile ? int(this._profile.user_type) : 0
    profile.profile_image_url = this._getProfileImageUrl(
      this._tenant,
      this._user_id,
    )
    return profile
  },

  /*
   * Function getSettings
   */
  getSettings() {
    var settings = {}
    settings.buddylist_settings = {}
    settings.buddylist_settings.display_type =
      this._settings && this._settings.buddylist_settings
        ? int(this._settings.buddylist_settings.display_type)
        : 0
    settings.initial_status = this._settings
      ? int(this._settings.initial_status)
      : 0
    settings.text_open_sec = this._settings
      ? int(this._settings.text_open_sec)
      : 0
    if (this._settings && this._settings.optional_settings) {
      settings.optional_settings = JSON.parse(
        JSON.stringify(this._settings.optional_settings),
      )
    }
    if (this._settings && this._settings.ext_info) {
      settings.ext_info = JSON.parse(JSON.stringify(this._settings.ext_info))
    } else {
      settings.ext_info = {}
    }
    return settings
  },

  /*
   * Function getBuddylist
   */
  getBuddylist(options) {
    var configProperties = this.getConfigProperties()
    var optional_config = configProperties.optional_config || {}
    var buddy_mode = configProperties.buddy_mode
    var buddylist = {}
    var thisBuddylist = this._buddylist
    if (
      options &&
      options.type === 'saved' &&
      buddy_mode !== Constants.BUDDY_MODE_AUTO
    ) {
      var buddyCount = 0
      for (var i = 0; i < this._buddylistOrg.user.length; i++) {
        var buddy = this._buddylistOrg.user[i]
        if (buddy.user_id || buddy.user_id === '') {
          // user
          buddyCount++
        }
      }
      if (buddyCount <= int(optional_config.buddy_max)) {
        thisBuddylist = this._buddylistOrg
      }
    }
    if (thisBuddylist && thisBuddylist.screened) {
      buddylist.screened = true
    }
    buddylist.user = []
    if (thisBuddylist && thisBuddylist.user && thisBuddylist.user.length) {
      for (var i = 0; i < thisBuddylist.user.length; i++) {
        var buddy = thisBuddylist.user[i]
        if (buddy.user_id || buddy.user_id === '') {
          var userBuddy = {}
          userBuddy.user_id = string(buddy.user_id)
          userBuddy.tenant = string(buddy.tenant || this._tenant)
          userBuddy.name = string(buddy.name)
          userBuddy.group = string(buddy.group)
          userBuddy.block_settings = {}
          userBuddy.profile_image_url = this._getProfileImageUrl(
            userBuddy.tenant,
            userBuddy.user_id,
          )
          buddylist.user.push(userBuddy)
        } else if (buddy.id || buddy.id === '') {
          var groupBuddy = {}
          groupBuddy.id = string(buddy.id)
          groupBuddy.name = string(buddy.name)
          groupBuddy.group = string(buddy.group)
          buddylist.user.push(groupBuddy)
        }
      }
    }
    return buddylist
  },

  /*
   * Function getBuddyUser
   */
  getBuddyUser(buddy) {
    var tenant = string(buddy.tenant || this._tenant)
    var user_id = string(buddy.user_id)
    var userBuddy = {
      user_id,
      tenant,
      name: '',
      group: '',
      block_settings: {},
      profile_image_url: this._getProfileImageUrl(tenant, user_id),
    }
    if (tenant === this._tenant && user_id === this._user_id && this._profile) {
      userBuddy.name = string(this._profile.name)
      userBuddy.group = string(this._profile.group)
    }
    if (
      this._buddylist &&
      this._buddylist.user &&
      this._buddylist.user.length
    ) {
      for (var i = 0; i < this._buddylist.user.length; i++) {
        if (
          this._buddylist.user[i].user_id === user_id &&
          (this._buddylist.user[i].tenant || this._tenant) === tenant
        ) {
          userBuddy.user_id = string(this._buddylist.user[i].user_id)
          userBuddy.tenant = string(
            this._buddylist.user[i].tenant || this._tenant,
          )
          userBuddy.name = string(this._buddylist.user[i].name)
          userBuddy.group = string(this._buddylist.user[i].group)
          userBuddy.block_settings = {}
          userBuddy.profile_image_url = this._getProfileImageUrl(
            userBuddy.tenant,
            userBuddy.user_id,
          )
          return userBuddy
        }
      }
    }
    if (
      this._nonbuddylist &&
      this._nonbuddylist.user &&
      this._nonbuddylist.user.length
    ) {
      for (var i = 0; i < this._nonbuddylist.user.length; i++) {
        if (
          this._nonbuddylist.user[i].user_id === user_id &&
          (this._nonbuddylist.user[i].tenant || this._tenant) === tenant
        ) {
          userBuddy.user_id = string(this._nonbuddylist.user[i].user_id)
          userBuddy.tenant = string(
            this._nonbuddylist.user[i].tenant || this._tenant,
          )
          userBuddy.name = string(this._nonbuddylist.user[i].name)
          userBuddy.group = string(this._nonbuddylist.user[i].group)
          userBuddy.block_settings = {}
          userBuddy.profile_image_url = this._getProfileImageUrl(
            userBuddy.tenant,
            userBuddy.user_id,
          )
          return userBuddy
        }
      }
    }
    if (
      this._nonsubscrlist &&
      this._nonsubscrlist.user &&
      this._nonsubscrlist.user.length
    ) {
      for (var i = 0; i < this._nonsubscrlist.user.length; i++) {
        if (
          this._nonsubscrlist.user[i].user_id === user_id &&
          (this._nonsubscrlist.user[i].tenant || this._tenant) === tenant
        ) {
          userBuddy.user_id = string(this._nonsubscrlist.user[i].user_id)
          userBuddy.tenant = string(
            this._nonsubscrlist.user[i].tenant || this._tenant,
          )
          userBuddy.name = string(this._nonsubscrlist.user[i].name)
          userBuddy.group = string(this._nonsubscrlist.user[i].group)
          userBuddy.block_settings = {}
          userBuddy.profile_image_url = this._getProfileImageUrl(
            userBuddy.tenant,
            userBuddy.user_id,
          )
          return userBuddy
        }
      }
    }
    return userBuddy
  },

  /*
   * Function getAllUsers
   */
  getAllUsers() {
    return JSON.parse(JSON.stringify(this._allUsers))
  },

  /*
   * Function getConfigProperties
   */
  getConfigProperties() {
    var configProperties = {}
    configProperties.buddy_mode = this._configProperties
      ? int(this._configProperties.buddy_mode)
      : 0
    configProperties.chat_mode = this._configProperties
      ? int(this._configProperties.chat_mode)
      : 0
    configProperties.webnotif_timeout = this._configProperties
      ? int(this._configProperties.webnotif_timeout)
      : 0
    configProperties.webchat_enabled = this._configProperties
      ? string(this._configProperties.webchat_enabled).toLowerCase()
      : 'false'
    if (this._configProperties && this._configProperties.optional_config) {
      configProperties.optional_config = JSON.parse(
        JSON.stringify(this._configProperties.optional_config),
      )
    }
    return configProperties
  },

  /*
   * Function getSignedInInfo
   */
  getSignedInInfo() {
    return JSON.parse(JSON.stringify(this._signedInInfo))
  },

  /*
   * Function getStatus
   */
  getStatus() {
    var status = {}
    status.status = int(this._status)
    status.display = string(this._display)
    try {
      status.ui_customized_status = (
        JSON.parse(
          string(
            this._ucclient_customized_status_table[
              JSON.stringify({ tenant: this._tenant, user_id: this._user_id })
            ],
          ),
        ) || {}
      ).ui_customized_status
    } catch (e) {}
    if (typeof status.ui_customized_status === 'undefined') {
      status.ui_customized_status = null
    }
    return status
  },

  /*
   * Function getBuddyStatus
   */
  getBuddyStatus(buddy) {
    var status = {}
    var key = JSON.stringify({
      tenant: buddy.tenant || this._tenant,
      user_id: buddy.user_id,
    })
    var buddyStatus = this._buddyStatus[key]
    status.status = buddyStatus
      ? int(buddyStatus.status)
      : Constants.STATUS_OFFLINE
    status.display = buddyStatus ? string(buddyStatus.display) : ''
    try {
      status.ui_customized_status = (
        JSON.parse(string(this._ucclient_customized_status_table[key])) || {}
      ).ui_customized_status
    } catch (e) {}
    if (typeof status.ui_customized_status === 'undefined') {
      status.ui_customized_status = null
    }
    return status
  },

  /*
   * Function getConference
   */
  getConference(conf_id) {
    conf_id = string(conf_id)
    var conference = {
      conf_id: '',
      subject: '',
      created_time: '',
      created_tstamp: 0,
      created_server_time: '',
      yyyymm: '',
      conf_type: '',
      conf_status: Constants.CONF_STATUS_INACTIVE,
      conf_ext: '',
      from: {
        tenant: '',
        user_id: '',
        user_name: '',
        conf_status: Constants.CONF_STATUS_INACTIVE,
      },
      creator: {
        tenant: '',
        user_id: '',
        user_name: '',
        conf_status: Constants.CONF_STATUS_INACTIVE,
      },
      assigned: {
        tenant: '',
        user_id: '',
        conf_status: Constants.CONF_STATUS_INACTIVE,
      },
      ext_conf_info: {},
      conf_tags: [],
      webchatinfo: {},
      invite_properties: {
        invisible: false,
        rejoinable: false,
        webchatfromguest: null,
        continuation_info: null,
        rwq: false,
      },
      user: [],
    }
    if (this._conferences[conf_id]) {
      conference.conf_id = string(this._conferences[conf_id].conf_id)
      conference.subject = string(this._conferences[conf_id].subject)
      conference.created_time = string(this._conferences[conf_id].created_time)
      conference.created_tstamp = int(this._conferences[conf_id].created_tstamp)
      conference.created_server_time = string(
        this._conferences[conf_id].created_server_time,
      )
      conference.yyyymm =
        conference.created_server_time.substr(0, 4) +
        conference.created_server_time.substr(5, 2)
      conference.conf_type = string(this._conferences[conf_id].conf_type)
      conference.conf_status = int(this._conferences[conf_id].conf_status)
      conference.conf_ext =
        this.PREFIX_CONFERENCE_EXTENSION + conference.conf_id
      if (this._conferences[conf_id].from) {
        conference.from.tenant = string(this._conferences[conf_id].from.tenant)
        conference.from.user_id = string(
          this._conferences[conf_id].from.user_id,
        )
        conference.from.user_name = string(
          this._conferences[conf_id].from.user_name,
        )
      }
      if (this._conferences[conf_id].creator) {
        conference.creator.tenant = string(
          this._conferences[conf_id].creator.tenant,
        )
        conference.creator.user_id = string(
          this._conferences[conf_id].creator.user_id,
        )
        conference.creator.user_name = string(
          this._conferences[conf_id].creator.user_name,
        )
      }
      if (this._conferences[conf_id].assigned) {
        conference.assigned.tenant = string(
          this._conferences[conf_id].assigned.tenant,
        )
        conference.assigned.user_id = string(
          this._conferences[conf_id].assigned.user_id,
        )
      }
      if (this._conferences[conf_id].ext_conf_info) {
        conference.ext_conf_info = JSON.parse(
          JSON.stringify(this._conferences[conf_id].ext_conf_info),
        )
      }
      if (this._conferences[conf_id].conf_tags) {
        conference.conf_tags = JSON.parse(
          JSON.stringify(this._conferences[conf_id].conf_tags),
        )
      }
      if (this._conferences[conf_id].webchatinfo) {
        conference.webchatinfo = JSON.parse(
          JSON.stringify(this._conferences[conf_id].webchatinfo),
        )
      }
      if (this._conferences[conf_id].invite_properties) {
        conference.invite_properties.invisible = Boolean(
          this._conferences[conf_id].invite_properties.invisible,
        )
        conference.invite_properties.rejoinable = Boolean(
          this._conferences[conf_id].invite_properties.rejoinable,
        )
        conference.invite_properties.webchatfromguest = this._conferences[
          conf_id
        ].invite_properties.webchatfromguest
          ? JSON.parse(
              JSON.stringify(
                this._conferences[conf_id].invite_properties.webchatfromguest,
              ),
            )
          : null
        conference.invite_properties.continuation_info = this._conferences[
          conf_id
        ].invite_properties.continuation_info
          ? JSON.parse(
              JSON.stringify(
                this._conferences[conf_id].invite_properties.continuation_info,
              ),
            )
          : null
        conference.invite_properties.rwq = Boolean(
          this._conferences[conf_id].invite_properties.rwq,
        )
      }
      for (var i = 0; i < this._conferences[conf_id].user.length; i++) {
        var user = {}
        user.user_id = string(this._conferences[conf_id].user[i].user_id)
        user.tenant = string(
          this._conferences[conf_id].user[i].tenant || this._tenant,
        )
        user.name = string(this._conferences[conf_id].user[i].name)
        user.conf_status = int(this._conferences[conf_id].user[i].conf_status)
        user.reenter_user_id = string(
          this._conferences[conf_id].user[i].reenter_user_id,
        )
        conference.user.push(user)
        if (
          user.tenant === conference.from.tenant &&
          user.user_id === conference.from.user_id
        ) {
          conference.from.conf_status = user.conf_status
        }
        if (
          user.tenant === conference.creator.tenant &&
          user.user_id === conference.creator.user_id
        ) {
          conference.creator.conf_status = user.conf_status
        }
        if (
          user.tenant === conference.assigned.tenant &&
          user.user_id === conference.assigned.user_id
        ) {
          conference.assigned.conf_status = user.conf_status
        }
      }
    }
    return conference
  },

  /*
   * Function getConferenceTag
   */
  getConferenceTag(options) {
    var conf_id = string(options && options.conf_id)
    var tag_key = string(options && options.tag_key)
    return string(
      this._conferences[conf_id] &&
        this._conferences[conf_id].conf_tags &&
        this._conferences[conf_id].conf_tags
          .filter(function (tag) {
            return tag.tag_type === '_conftag' && tag.tag_key === tag_key
          })
          .sort(function (tag1, tag2) {
            return tag1.tstamp - tag2.tstamp
          })
          .map(function (tag) {
            return tag.tag_value
          })
          .pop(),
    )
  },

  /*
   * Function getFileInfo
   */
  getFileInfo(file_id) {
    file_id = string(file_id)
    var fileInfo = {
      file_id: '',
      target: {
        tenant: '',
        user_id: '',
      },
      isUpload: false,
      status: Constants.FILE_STATUS_UNPREPARED,
      name: '',
      size: 0,
      progress: 0,
    }
    if (this._fileInfos[file_id]) {
      fileInfo.file_id = file_id
      fileInfo.target = this._fileInfos[file_id].target
      fileInfo.isUpload = this._fileInfos[file_id].isUpload
      fileInfo.status = this._fileInfos[file_id].status
      fileInfo.name = this._fileInfos[file_id].name
      fileInfo.size = this._fileInfos[file_id].size
      fileInfo.progress = this._fileInfos[file_id].progress
    }
    return fileInfo
  },

  /*
   * Function getCallInfo
   */
  getCallInfo(call_id) {
    var sessionBundleId = string(call_id)
    var callInfo = {
      call_id: '',
      target: {},
      sharedObject: {},
      status: Constants.CALL_STATUS_TERMINATED,
      direction: Constants.CALL_DIRECTION_UNKNOWN,
      audio: false,
      video: false,
      microphoneMuted: false,
      cameraMuted: false,
      localStreamUrl: '',
      streamTables: [],
    }
    var streamTables = {}
    if (this._sessionBundleTable[sessionBundleId]) {
      callInfo.call_id = sessionBundleId
      callInfo.target = this._sessionBundleTable[sessionBundleId].target
      try {
        callInfo.sharedObject = JSON.parse(
          this._sessionBundleTable[sessionBundleId].sharedObjectJson,
        )
      } catch (e) {}
      callInfo.direction = this._sessionBundleTable[sessionBundleId].direction
      callInfo.microphoneMuted =
        this._sessionBundleTable[sessionBundleId].microphoneMuted
      callInfo.cameraMuted =
        this._sessionBundleTable[sessionBundleId].cameraMuted
      for (
        var i = 0;
        i < this._sessionBundleTable[sessionBundleId].sessionIdArray.length;
        i++
      ) {
        var session = this._phone.getCallSession(
          this._sessionBundleTable[sessionBundleId].sessionIdArray[i],
        )
        if (session) {
          if (callInfo.status < Constants.CALL_STATUS_INCOMING) {
            callInfo.status = Constants.CALL_STATUS_INCOMING
          }
          if (session.status === 'answered') {
            callInfo.status = Constants.CALL_STATUS_TALKING
            var buddy = {
              tenant: string(session.option.tenant),
              user_id: string(session.option.user_id),
            }
            var key = JSON.stringify(buddy)
            if (!streamTables[key]) {
              streamTables[key] = {
                buddy,
                status: Constants.STREAM_STATUS_TALKING,
                streamTable: {},
              }
            }
            var stream = {
              url: string(session.streamURL),
              video: Boolean(session.mediaConstraints.video),
            }
            streamTables[key].streamTable[session.id] = stream
            if (
              callInfo.localStreamUrl === '' &&
              stream.video &&
              session.localStreamURL
            ) {
              callInfo.localStreamUrl = string(session.localStreamURL)
            }
          } else if (session.status === 'in-progress') {
            if (callInfo.status < Constants.CALL_STATUS_PROGRESS) {
              callInfo.status = Constants.CALL_STATUS_PROGRESS
            }
          } else if (
            session.status !== 'incoming' &&
            session.status !== 'answering'
          ) {
            if (callInfo.status < Constants.CALL_STATUS_DIALING) {
              callInfo.status = Constants.CALL_STATUS_DIALING
            }
          } else if (session.status === 'answering') {
            if (callInfo.status < Constants.CALL_STATUS_ANSWERING) {
              callInfo.status = Constants.CALL_STATUS_ANSWERING
            }
          }
          if (session.mediaConstraints.audio) {
            callInfo.audio = true
          }
          if (session.mediaConstraints.video) {
            callInfo.video = true
          }
        }
      }
      if (
        callInfo.status === Constants.CALL_STATUS_TERMINATED &&
        !this._sessionBundleTable[sessionBundleId].autoTerminate
      ) {
        callInfo.status = Constants.CALL_STATUS_TALKING
      }
    }
    if (callInfo.target.conf_id) {
      var users =
        (this._conferences[callInfo.target.conf_id] &&
          this._conferences[callInfo.target.conf_id].user) ||
        []
      for (var i = 0; i < users.length; i++) {
        var user = users[i]
        var tenant = string(user.tenant || this._tenant)
        var user_id = string(user.user_id)
        if (tenant === this._tenant && user_id === this._user_id) {
          continue
        }
        var video_conf_status = int(user.video_conf_status)
        if (video_conf_status > 0) {
          var buddy = {
            tenant,
            user_id,
          }
          var key = JSON.stringify(buddy)
          if (!streamTables[key]) {
            streamTables[key] = {
              buddy,
              status:
                video_conf_status === this.VIDEO_CONF_VIDEO
                  ? Constants.STREAM_STATUS_DIALING
                  : Constants.STREAM_STATUS_TALKING,
              streamTable: {},
            }
          }
        }
      }
    }
    for (var key in streamTables) {
      callInfo.streamTables.push(streamTables[key])
    }
    return callInfo
  },

  /*
   * Function getChatSessionToken
   */
  getChatSessionToken() {
    return JSON.stringify({
      tenant: this._tenant,
      user_id: this._user_id,
      chat_session_id: this._chat_session_id,
    })
  },

  /*
   * Private functions
   */
  _initEventListener(eventName) {
    var self = this
    return function (ev) {
      try {
        self._logger.log(
          'debug',
          'eventName: ' + eventName + ' ev: ' + JSON.stringify(ev),
        )
      } catch (e) {}
      for (var i = 0; i < self._handlers.length; i++) {
        var handler = self._handlers[i]
        if (handler && handler[eventName]) {
          handler[eventName].apply(handler, arguments)
        }
      }
      if (self._eventListeners0[eventName]) {
        self._eventListeners0[eventName].apply(self, arguments)
      }
    }
  },
  _byThis(func, argsArray) {
    var self = this
    // if argsArray is not given, returned function calls func with arguments of itself
    return function () {
      func.apply(self, argsArray || arguments)
    }
  },
  _rpcPrintDebug(content) {
    this._logger.log('debug', content)
  },
  _rpcPrintError(content) {
    this._logger.log('error', content)
  },
  _rpcClose(e) {
    if (this._signInStatus === 2) {
      this._signInNG(int((e && e.code) || e) || Errors.RPC_CLOSED, 'RPC closed')
    } else if (this._signInStatus === 3) {
      this._forcedSignOut(
        int((e && e.code) || e) || Errors.RPC_CLOSED,
        'RPC closed',
      )
    }
  },
  _rpcError() {
    if (this._signInStatus === 2) {
      this._signInNG(Errors.RPC_ERROR, 'RPC error')
    } else if (this._signInStatus === 3) {
      this._forcedSignOut(Errors.RPC_ERROR, 'RPC error')
    }
  },
  _rpcCall(method, params, funcOK, funcError) {
    // in funcOK and funcError, "this" is the same this in _rpcCall
    if (this._rpc) {
      this._rpc.call(
        method,
        params,
        function (result, obj) {
          // obj is this in _rpcCall
          if (funcOK) {
            funcOK.call(obj, result)
          }
        },
        function (error, obj) {
          // obj is this in _rpcCall
          obj._logger.log(
            'info',
            '_rpcCall failed (method: ' +
              method +
              ', code: ' +
              string(error.code) +
              ', message: ' +
              string(error.message) +
              ')',
          )
          if (funcError) {
            funcError.call(obj, error)
          }
        },
        this,
      ) // this will be returned as "obj" in callback functions
    } else {
      this._logger.log(
        'info',
        '_rpcCall failed (method: ' + method + ', message: RPC not opened)',
      )
      if (funcError) {
        funcError({
          code: Brekeke.net.ERROR_NOT_OPENED,
          message: 'RPC not opened',
        })
      }
    }
  },
  _rpcNotify(method, params, funcError) {
    if (this._rpc) {
      this._rpc.call(method, params, null, null, null)
    } else {
      this._logger.log(
        'info',
        '_rpcNotify failed (method: ' + method + ', message: RPC not opened)',
      )
      if (funcError) {
        funcError({
          code: Brekeke.net.ERROR_NOT_OPENED,
          message: 'RPC not opened',
        })
      }
    }
  },
  _forcedSignOut(code, message) {
    this._logger.log(
      'warn',
      '_forcedSignOut code: ' + code + ', message: ' + message,
    )

    var signInStatusOrg = this._signInStatus

    this._signInStatus = 0

    this._signedOut()

    // raise forcedSignOut event
    if (this._eventListeners.forcedSignOut && signInStatusOrg === 3) {
      var ev = {
        code: int(code),
        message: string(message),
      }
      this._eventListeners.forcedSignOut(ev)
    }
  },
  _signedOut() {
    if (this._rpc) {
      this._rpc.onClose = function () {}
      delete this._rpc.handlerObject
      this._rpc.close()
      this._rpc = null
    }

    // finalize phone
    if (this._phone) {
      var sessionTable = this._phone.getCallSessionTable()
      for (var id in sessionTable) {
        sessionTable[id].hangUp()
      }
      try {
        this._phone.finalizePhone()
      } catch (e) {
        this._logger.log(
          'warn',
          e.message + ' at finalizePhone' + '\n' + e.stack + '\n',
        )
      }
      this._phone = null
    }
    this._phoneProperties = {}
    this._phoneRegistered = false
    this._buddyPhone = {}

    this._sessionBundleIdCounter = 0
    this._sessionBundleTable = {}

    this._conferenceCalls = {}

    // reinit fields
    this._profile = {}
    this._settings = {}
    this._buddylist = {}
    this._buddylistOrg = {}
    this._nonbuddylist = {}
    this._nonsubscrlist = {}
    this._configProperties = {}
    this._signedInInfo = {}
    this._status = Constants.STATUS_OFFLINE
    this._display = ''
    this._buddyStatus = {}

    this._upload_ids = []
    this._download_keys = {}
    this._ucclient_customized_status_table = {}

    this._conferences = {}

    this._fileInfos = {}

    this._topicIdCounter = 0
    this._topics = {}

    this._databaseTaskTable = {}

    this._sendStatusCount = 0

    this._makeCallStatus = {}
    this._sendSharedObjectFuncOKTable = {}
    this._receivedSharedObjectJsonTable = {}

    if (this._signInTimer) {
      clearTimeout(this._signInTimer)
      this._signInTimer = null
    }

    if (this._pingTimer) {
      clearTimeout(this._pingTimer)
      this._pingTimer = null
    }

    // stop report console
    if (reportConsoleInfo) {
      reportConsoleInfo.signedInAuth = false
    }
  },
  _signInNG(code, message, tstamp) {
    if (code) {
      this._logger.log(
        'warn',
        '_signInNG code: ' + code + ', message: ' + message,
      )
    } else {
      this._logger.log(
        'info',
        '_signInNG code: ' + code + ', message: ' + message,
      )
    }

    this._signInStatus = 1

    this._signedOut()

    if (this._signInFuncError) {
      var ev = {
        code: int(code),
        message: string(message),
        ltime: stringifyTstamp(tstamp),
        tstamp: int(tstamp),
      }
      this._signInFuncError(ev)
    }
    this._signInFuncOK = null
    this._signInFuncError = null
  },
  _signInSuccess(tstamp) {
    this._signInStatus = 3
    if (this._signInTimer) {
      clearTimeout(this._signInTimer)
      this._signInTimer = null
    }

    // start ping timer
    this._pingTimer = setTimeout(
      this._byThis(this._keepAlive),
      this.CHECK_ALIVE_INTERVAL,
    )

    // start report console
    var optional_config = this.getConfigProperties().optional_config
    if (reportConsoleInfo && optional_config) {
      Object.keys(reportConsoleInfo).forEach(function (key) {
        if (typeof reportConsoleInfo[key] === typeof optional_config[key]) {
          reportConsoleInfo[key] = optional_config[key]
        }
      })
      if (
        reportConsoleInfo.report_console &&
        (reportConsoleInfo.report_console_guest ||
          string(this._user_id)[0] !== '#')
      ) {
        reportConsoleInfo.myid = JSON.stringify({
          tenant: this._tenant,
          user_id: this._user_id,
        })
      } else {
        reportConsoleInfo.myid = ''
      }
      reportConsoleInfo.expires =
        new Date().getTime() + reportConsoleInfo.report_console_expiry / 2
      reportConsoleInfo.signedInAuth = true
      reportConsoleInfo.signedIn = false
    }

    if (this._signInFuncOK) {
      var ev = {
        ltime: stringifyTstamp(tstamp),
        tstamp: int(tstamp),
      }
      this._signInFuncOK(ev)
    }
    this._signInFuncOK = null
    this._signInFuncError = null
  },
  _signInTimeout() {
    if (this._signInStatus === 2) {
      this._signInNG(Errors.SIGN_IN_TIMEOUT, 'Sign-in timeout')
    }
  },
  _signInStartRpc(password) {
    if (this._rpc) {
      this._rpc.onClose = this._byThis(function () {
        this._rpc = null
        this._signInStartRpc(password)
      })
      this._rpc.close()
      return
    }
    // start json rpc
    var prms =
      '?tenant=' +
      encodeURIComponent(this._tenant) +
      '&user=' +
      encodeURIComponent(this._user_id)
    if (password) {
      prms += '&password=' + encodeURIComponent(password)
    }
    if (this._auth_timeout) {
      prms += '&auth_timeout=' + encodeURIComponent(this._auth_timeout)
    }
    if (this._admin_mode) {
      prms += '&admin_mode'
    }
    if (this._modest) {
      prms +=
        '&modest&prev_chat_session_id=' +
        encodeURIComponent(this._chat_session_id)
    }
    if (this._recvMsgs && this._lastMessageTime) {
      prms += '&lmt=' + int(this._lastMessageTime)
    }
    if (this._pver) {
      prms += '&pver=' + encodeURIComponent(this._pver)
    }
    try {
      if (this._forceAjax) {
        this._rpc = Brekeke.net.createJsonRpcOverAjax(
          (this._useHttps ? 'https://' : 'http://') +
            this._host +
            '/' +
            this._path +
            '/ca' +
            prms,
        )
      } else {
        try {
          this._rpc = Brekeke.net.createJsonRpcOverWebSocket(
            (this._useHttps ? 'wss://' : 'ws://') +
              this._host +
              '/' +
              this._path +
              (this._servlet ? '/ws' : '/wssep') +
              prms,
          )
        } catch (e) {
          this._logger.log(
            'info',
            'Websocket unavailable, fallback to ajax\n' +
              e.message +
              ' at _signInStartRpc' +
              '\n' +
              e.stack +
              '\n',
          )
        }
        if (!this._rpc) {
          this._rpc = Brekeke.net.createJsonRpcOverAjax(
            (this._useHttps ? 'https://' : 'http://') +
              this._host +
              '/' +
              this._path +
              '/ca' +
              prms,
          )
        }
      }
    } catch (e) {
      this._logger.log(
        'warn',
        e.message + ' at _signInStartRpc' + '\n' + e.stack + '\n',
      )
    }
    if (!this._rpc) {
      this._signInNG(Errors.RPC_ERROR, 'RPC initialization failed')
      return
    }
    this._rpc.printDebug = this._byThis(this._rpcPrintDebug)
    this._rpc.printError = this._byThis(this._rpcPrintError)
    this._rpc.setHandlerObject(this)
    this._rpc.onClose = this._byThis(this._rpcClose)
    this._rpc.onError = this._byThis(this._rpcError)
    this._rpc.open()
  },
  _signInActionStatusOK(args) {
    this._lastMessageTime = int(args.tstamp)

    if (this._signInStatus === 2) {
      // remove auth info from url (mandatory for ajax long polling)
      this._rpc.setUrl(this._rpc.url.split('?').shift())

      this._configProperties = args.properties
      this._signedInInfo = args.sii || {}
      this._chat_session_id = int(
        args.properties && args.properties.chat_session_id,
      )
      if (this._admin_mode && args.type === 2) {
        // chat disabled (admin mode)
        // this is admin
        this._profile.user_type = Constants.USER_TYPE_TENANT_ADMIN

        this._signInSuccess(args.tstamp)
      } else if (args.type === 1) {
        // chat disabled (sa)
        // this is sa
        this._profile.user_type = Constants.USER_TYPE_SYSTEM_ADMIN

        this._signInSuccess(args.tstamp)
      } else {
        // chat enabled
        this._download_keys[
          JSON.stringify({ tenant: this._tenant, user_id: this._user_id })
        ] = args.properties.dlk
        this._rpcCall(
          'GetProperties',
          {
            tenant: this._tenant,
            user_id: this._user_id,
            type: 'all',
          },
          this._signInGetPropertiesOK,
          this._signInGetPropertiesNG,
        )
      }
    }
  },
  _signInActionStatusNG(args) {
    this._logger.log('info', '_signInActionStatusNG code: ' + args.code)
    if (this._signInStatus === 2) {
      if (args.nonce) {
        // update tenant
        if (args.tenant) {
          var newTenant = string(args.tenant)
          if (this._tenant !== newTenant) {
            var orgKey = JSON.stringify({
              tenant: this._tenant,
              user_id: this._user_id,
            })
            if (this._ucclient_customized_status_table[orgKey]) {
              this._ucclient_customized_status_table[
                JSON.stringify({ tenant: newTenant, user_id: this._user_id })
              ] = this._ucclient_customized_status_table[orgKey]
              delete this._ucclient_customized_status_table[orgKey]
            }
            this._tenant = newTenant
          }
        }
        // password required
        var hashedPassword = CryptoJS.MD5(this._pass).toString()
        var passwordHashedWithNonce = CryptoJS.MD5(
          this._user_id + ':' + args.nonce + ':' + hashedPassword,
        ).toString()
        // re-sign-in with password
        this._signInStartRpc(passwordHashedWithNonce)
      } else {
        // authentication error
        this._signInNG(int(args.code), args.msg, args.tstamp)
      }
    }
  },
  _signInGetPropertiesOK(result) {
    if (this._signInStatus === 2) {
      this._profile = result.profile
      this._settings = result.settings
      try {
        this._buddylistOrg = JSON.parse(JSON.stringify(result.buddylist))
      } catch (e) {
        this._logger.log(
          'error',
          'result.buddylist parse error at _signInGetPropertiesOK: ' +
            e.message,
        )
        this._buddylistOrg = {}
      }
      this._buddylist = result.buddylist

      if (this.getProfile().user_type === Constants.USER_TYPE_TENANT_GUEST) {
        this._signInGetAllUsersOK(null)
      } else {
        // get buddy also from PBX
        this._rpcCall(
          'GetAllUsers',
          {
            target: {
              tenant: this._tenant,
            },
          },
          this._signInGetAllUsersOK,
          this._signInGetAllUsersNG,
        )
      }
    }
  },
  _signInGetPropertiesNG(error) {
    if (this._signInStatus === 2) {
      this._signInNG(int(error.code), error.message + ' at GetProperties')
    }
  },
  _refreshBuddylist() {
    var configProperties = this.getConfigProperties()
    var optional_config = configProperties.optional_config || {}
    var buddy_mode = configProperties.buddy_mode
    if (!this._buddylist) {
      this._buddylist = {}
    }
    if (!this._buddylist.user || !this._buddylist.user.length) {
      this._buddylist.user = []
    }
    if (buddy_mode === Constants.BUDDY_MODE_AUTO) {
      // overwrite _buddylist.user by _allUsers.user
      var newBuddylistUser = []
      if (this._allUsers && this._allUsers.user && this._allUsers.user.length) {
        var groupIds = {}
        for (var i = 0; i < this._allUsers.user.length; i++) {
          var pbxUser = this._allUsers.user[i]
          if (pbxUser.disabledBuddy) {
            continue
          }
          if (pbxUser.user_id === this._user_id) {
            // except myself
            continue
          }
          if (this._buddylist.screened) {
            var exists = false
            for (var j = 0; j < this._buddylist.user.length; j++) {
              var buddy = this._buddylist.user[j]
              if (
                buddy.user_id === pbxUser.user_id &&
                buddy.tenant === this._tenant
              ) {
                exists = true
                break
              }
            }
            if (!exists) {
              continue
            }
          }
          if (!groupIds[pbxUser.user_group]) {
            var groupBuddy = {}
            groupBuddy.id = pbxUser.user_group
            groupBuddy.name = pbxUser.user_group
            groupBuddy.group = ''
            newBuddylistUser.push(groupBuddy)
            groupIds[pbxUser.user_group] = true
          }
          var userBuddy = {}
          userBuddy.user_id = pbxUser.user_id
          userBuddy.tenant = this._tenant
          userBuddy.name = pbxUser.user_name
          userBuddy.group = pbxUser.user_group
          userBuddy.block_settings = {}
          newBuddylistUser.push(userBuddy)
        }
      }
      this._buddylist.user = newBuddylistUser
    } else if (buddy_mode === Constants.BUDDY_MODE_GROUP) {
      // add buddy to _buddylist
      if (
        !this._buddylist.screened &&
        this._allUsers &&
        this._allUsers.user &&
        this._allUsers.user.length
      ) {
        for (var i = 0; i < this._allUsers.user.length; i++) {
          var pbxUser = this._allUsers.user[i]
          if (pbxUser.disabledBuddy) {
            continue
          }
          if (pbxUser.user_id === this._user_id) {
            // except myself
            continue
          }
          var exists = false
          for (var j = 0; j < this._buddylist.user.length; j++) {
            var buddy = this._buddylist.user[j]
            if (
              buddy.user_id === pbxUser.user_id &&
              buddy.tenant === this._tenant
            ) {
              exists = true
              break
            }
          }
          if (!exists) {
            var userBuddy = {}
            userBuddy.user_id = pbxUser.user_id
            userBuddy.tenant = this._tenant
            userBuddy.name = pbxUser.user_name
            userBuddy.group = ''
            userBuddy.block_settings = {}
            this._buddylist.user.push(userBuddy)
          }
        }
      }
    }
    // remove buddies not existing in _allUsers from _buddylist
    for (var i = this._buddylist.user.length - 1; i >= 0; i--) {
      var buddy = this._buddylist.user[i]
      if (buddy.user_id || buddy.user_id === '') {
        // user
        var exists = false
        for (var j = 0; j < this._allUsers.user.length; j++) {
          var pbxUser = this._allUsers.user[j]
          if (pbxUser.disabledBuddy) {
            continue
          }
          if (
            buddy.user_id === pbxUser.user_id &&
            buddy.tenant === this._tenant
          ) {
            exists = true
            break
          }
        }
        if (!exists) {
          this._buddylist.user.splice(i, 1)
        }
      }
    }
    // remove excess from _buddylist
    var buddyCount = 0
    for (var i = 0; i < this._buddylist.user.length; i++) {
      var buddy = this._buddylist.user[i]
      if (buddy.user_id || buddy.user_id === '') {
        // user
        buddyCount++
      }
    }
    var excessCount = buddyCount - int(optional_config.buddy_max)
    for (var i = this._buddylist.user.length - 1; i >= 0; i--) {
      if (excessCount <= 0) {
        break
      }
      var buddy = this._buddylist.user[i]
      if (buddy.user_id || buddy.user_id === '') {
        // user
        this._buddylist.user.splice(i, 1)
        excessCount--
      }
    }
    // remove buddies not existing in _allUsers from _buddylistOrg
    for (var i = this._buddylistOrg.user.length - 1; i >= 0; i--) {
      var buddy = this._buddylistOrg.user[i]
      if (buddy.user_id || buddy.user_id === '') {
        // user
        var exists = false
        for (var j = 0; j < this._allUsers.user.length; j++) {
          var pbxUser = this._allUsers.user[j]
          if (pbxUser.disabledBuddy) {
            continue
          }
          if (
            buddy.user_id === pbxUser.user_id &&
            buddy.tenant === this._tenant
          ) {
            exists = true
            break
          }
        }
        if (!exists) {
          this._buddylistOrg.user.splice(i, 1)
        }
      }
    }
  },
  _signInGetAllUsersOK(result) {
    if (this._signInStatus === 2) {
      this._allUsers = result || {}
      if (
        this._allUsers.user &&
        typeof this._allUsers.user.sort === 'function'
      ) {
        this._allUsers.user.sort(function (user1, user2) {
          var id1 = string(user1 && user1.user_id)
          var id2 = string(user2 && user2.user_id)
          return id1 < id2 ? -1 : id1 > id2 ? 1 : 0
        })
      }
      var configProperties = this.getConfigProperties()
      var buddy_mode = configProperties.buddy_mode
      this._refreshBuddylist()

      // subscribe buddy status
      var users = []
      if (
        this._buddylist &&
        this._buddylist.user &&
        this._buddylist.user.length
      ) {
        for (var i = 0; i < this._buddylist.user.length; i++) {
          var buddy = this._buddylist.user[i]
          if (buddy.user_id || buddy.user_id === '') {
            users.push({ tenant: buddy.tenant, user_id: buddy.user_id })
          }
        }
      }
      this._rpcCall(
        'SubscribeStatus',
        {
          users,
          mutual: buddy_mode !== Constants.BUDDY_MODE_MANUAL,
          refresh: true,
        },
        this._signInSubscribeStatusOK,
        this._signInSubscribeStatusNG,
      )
    }
  },
  _signInGetAllUsersNG(error) {
    if (this._signInStatus === 2) {
      this._signInNG(int(error.code), error.message + ' at GetAllUsers')
    }
  },
  _signInSubscribeStatusOK(result) {
    if (this._signInStatus === 2) {
      this._signInAllOK(result)
    }
  },
  _signInSubscribeStatusNG(error) {
    if (this._signInStatus === 2) {
      this._signInNG(int(error.code), error.message + ' at SubscribeStatus')
    }
  },
  _signInAllOK(result) {
    if (this._signInStatus === 2) {
      // change status
      if (this._status === null) {
        // status not specified with sign-in option
        this._status = this.getSettings().initial_status
      }
      setTimeout(this._byThis(this._sendStatusAfterSignIn), 1000)

      // sign-in success callback
      this._signInSuccess(result.tstamp)

      if (this._phone) {
        // webrtc enabled
        this._getPhoneProperties()
      }
    }
  },
  _getPhoneProperties() {
    this._phoneRegisterTimer = setTimeout(
      this._byThis(function () {
        this._logger.log('warn', 'Phone register timeout')
        this._phoneStatusChanged(
          false,
          Errors.WEBRTC_TEMPORARILY_UNAVAILABLE,
          'Phone register timeout',
        )
      }),
      this.PHONE_REGISTER_TIMEOUT_DEFAULT,
    )

    this._rpcCall(
      'GetPhoneProperties',
      {
        tenant: this._tenant,
        user_id: this._user_id,
      },
      this._getPhonePropertiesOK,
      this._getPhonePropertiesNG,
    )
  },
  _getPhonePropertiesOK(result) {
    this._phoneProperties = result

    var sip_host = this._phoneProperties.sip_host || this._host.split(':')[0]
    var stun_servers = []
    if (this._phoneProperties.stun) {
      try {
        stun_servers = JSON.parse(this._phoneProperties.stun)
      } catch (e) {}
    }
    var turn_servers = ''
    if (this._phoneProperties.turn) {
      try {
        turn_servers = JSON.parse(this._phoneProperties.turn)
      } catch (e) {}
    }
    this._phoneProperties.extraHeaderArray = []
    if (this._phoneProperties.extra_headers) {
      try {
        if (this._phoneProperties.extra_headers.charAt(0) !== '[') {
          this._phoneProperties.extraHeaderArray = JSON.parse(
            '["' + this._phoneProperties.extra_headers + '"]',
          )
        } else {
          this._phoneProperties.extraHeaderArray = JSON.parse(
            this._phoneProperties.extra_headers,
          )
        }
      } catch (e) {}
    }

    if (this._phoneProperties.pnumber === '') {
      this._logger.log('warn', 'Empty pnumber')
      this._phoneStatusChanged(
        false,
        Errors.WEBRTC_PERMANENTLY_UNAVAILABLE,
        'Empty pnumber',
      )
      return
    }
    if (
      !this._phoneProperties.password &&
      !this._phoneProperties.authorization
    ) {
      this._logger.log('warn', 'Empty password and empty authorization')
    }

    // init phone
    try {
      this._phone.initPhone(
        {
          log: { level: 'debug' },
          uri: this._phoneProperties.pnumber + '@' + sip_host,
          password: this._phoneProperties.password,
          ws_servers: this._useHttps
            ? 'wss://' + sip_host + ':' + this._phoneProperties.sip_wss_port
            : 'ws://' + sip_host + ':' + this._phoneProperties.sip_ws_port,
          display_name: '',
          authorization_user: '',
          register: true,
          register_expires: this._phoneProperties.register_expires,
          registrar_server: '',
          no_answer_timeout: 60,
          trace_sip: true,
          stun_servers,
          turn_servers,
          use_preloaded_route: false,
          connection_recovery_min_interval: 2,
          connection_recovery_max_interval: 30,
          hack_via_tcp: false,
          hack_ip_in_contact: false,
        },
        this._byThis(this._initPhoneOK),
        this._byThis(this._phoneError),
        this._byThis(this._sessionCreated),
        this._byThis(this._statusChanged),
        {
          registratorExtraHeaders: this._phoneProperties.authorization
            ? ['Authorization: ' + this._phoneProperties.authorization]
            : null,
          iceOnlyVideo: true,
          userAgent: this._phoneProperties.user_agent,
        },
      )
    } catch (e) {
      this._logger.log(
        'warn',
        e.message + ' at InitPhone' + '\n' + e.stack + '\n',
      )

      this._phoneStatusChanged(
        false,
        Errors.WEBRTC_TEMPORARILY_UNAVAILABLE,
        e.message + ' at InitPhone',
      )
    }
  },
  _getPhonePropertiesNG(error) {
    this._logger.log('warn', error.message + ' at GetPhoneProperties')

    this._phoneStatusChanged(
      false,
      Errors.WEBRTC_TEMPORARILY_UNAVAILABLE,
      error.message + ' at GetPhoneProperties',
    )
  },
  _initPhoneOK(e) {
    this._logger.log('info', 'Phone registered')
    this._phoneStatusChanged(true, 0, '')
  },
  _phoneStatusChanged(registered, code, msg) {
    var mustNotify = true
    if (this._phoneRegisterTimer) {
      clearTimeout(this._phoneRegisterTimer)
      this._phoneRegisterTimer = null
    } else {
      // already timeout
      registered = false
      if (!this._phoneRegistered) {
        mustNotify = false
      }
    }
    this._phoneRegistered = registered
    // finalize phone
    if (!this._phoneRegistered && this._phone) {
      var sessionTable = this._phone.getCallSessionTable()
      for (var id in sessionTable) {
        sessionTable[id].hangUp()
      }
      try {
        this._phone.finalizePhone()
      } catch (e) {
        this._logger.log(
          'warn',
          e.message + ' at finalizePhone' + '\n' + e.stack + '\n',
        )
      }
      this._phone = null
    }
    if (mustNotify) {
      this._sendStatus(null, null)
      // raise phoneStatusChanged event
      if (this._eventListeners.phoneStatusChanged && this._signInStatus === 3) {
        var ev = {
          registered: this._phoneRegistered,
          code,
          message: msg,
        }
        this._eventListeners.phoneStatusChanged(ev)
      }
    }
  },
  _sendStatusAfterSignIn() {
    if (this._signInStatus === 3) {
      if (this._sendStatusCount === 0) {
        // ChangeStatus
        this._sendStatus(this._byThis(this._receiveInvitationAfterSignIn), null)
      } else {
        // already sent
        this._receiveInvitationAfterSignIn()
      }
    }
  },
  _receiveInvitationAfterSignIn() {
    if (this._signInStatus === 3) {
      if (this.getProfile().user_type !== Constants.USER_TYPE_TENANT_GUEST) {
        this._rpcNotify('ReceiveConferenceInvitaion', {}, null)
      }
    }
  },
  _keepAlive() {
    clearTimeout(this._pingTimer)
    if (this._signInStatus === 3) {
      if (this._rpc.timeLastReceived > 0) {
        var now = new Date().getTime()
        var elapsed = now - this._rpc.timeLastReceived
        if (
          elapsed > this.KEEP_ALIVE_TIMEOUT &&
          now - this._timeSentKeepAlive < this.KEEP_ALIVE_TIMEOUT
        ) {
          // sign-out
          this._forcedSignOut(Errors.PING_TIMEOUT, 'Ping timeout')
          return
        }
        if (elapsed > this.PING_INTERVAL) {
          // send ping
          this._timeSentKeepAlive = now
          this._rpcNotify('keepalive', { brekeke: 'cool' }, null)
        }
      }
      this._pingTimer = setTimeout(
        this._byThis(this._keepAlive),
        this.CHECK_ALIVE_INTERVAL,
      )
    }
  },
  _sendStatus(funcOK, funcError) {
    var profile = this.getProfile()
    var status = this.getStatus()

    var count = this._sendStatusCount++

    var myKey = JSON.stringify({
      tenant: this._tenant,
      user_id: this._user_id,
    })

    this._rpcCall(
      'ChangeStatus',
      {
        status: status.status,
        name: profile.name,
        display_name: count > 0 ? void 0 : 1, // only first, value is dummy
        display: status.display,
        pnumber: string(this._phoneProperties.pnumber),
        registered: Boolean(this._phoneRegistered),
        ucclient_customized_status: string(
          this._ucclient_customized_status_table[myKey],
        ),
      },
      function (result) {
        if (result) {
          this._download_keys[myKey] = result.dlk
        }
        if (funcOK) {
          var ev = {}
          funcOK(ev)
        }
      },
      function (error) {
        if (funcError) {
          var ev = {
            code: int(error.code),
            message: string(error.message),
          }
          funcError(ev)
        }
        if (count === 0) {
          // force sign-out
          this._forcedSignOut(int(error.code), error.message)
        }
      },
    )
  },
  _recvNotifyStatus(args) {
    if (!args.sender || !args.client_param) {
      this._logger.log('warn', 'Invalid argument: _recvNotifyStatus')
      return
    }
    var sender_tenant = string(args.sender.tenant || this._tenant)
    var sender_user_id = string(args.sender.user_id)

    var user = null
    var isNonbuddy = false
    if (
      this._buddylist &&
      this._buddylist.user &&
      this._buddylist.user.length
    ) {
      for (var i = 0; i < this._buddylist.user.length; i++) {
        if (
          this._buddylist.user[i].user_id === sender_user_id &&
          (this._buddylist.user[i].tenant || this._tenant) === sender_tenant
        ) {
          user = this._buddylist.user[i]
        }
      }
    }
    if (user === null) {
      // nonbuddy
      isNonbuddy = true
      if (
        this._nonbuddylist &&
        this._nonbuddylist.user &&
        this._nonbuddylist.user.length
      ) {
        for (var i = 0; i < this._nonbuddylist.user.length; i++) {
          if (
            this._nonbuddylist.user[i].user_id === sender_user_id &&
            (this._nonbuddylist.user[i].tenant || this._tenant) ===
              sender_tenant
          ) {
            user = this._nonbuddylist.user[i]
          }
        }
      } else {
        this._nonbuddylist = {}
        this._nonbuddylist.user = []
      }
      if (user === null) {
        // add nonbuddy to nonbuddylist
        var nonbuddy = {}
        nonbuddy.user_id = sender_user_id
        nonbuddy.tenant = sender_tenant
        nonbuddy.name = ''
        nonbuddy.group = ''
        nonbuddy.block_settings = {}
        this._nonbuddylist.user.push(nonbuddy)
        user = nonbuddy
      }

      var buddy_mode = this.getConfigProperties().buddy_mode
      if (
        buddy_mode !== Constants.BUDDY_MODE_MANUAL &&
        this.getProfile().user_type !== Constants.USER_TYPE_SYSTEM_ADMIN &&
        this.getProfile().user_type !== Constants.USER_TYPE_TENANT_GUEST &&
        sender_user_id.substr(0, 2) !== '##'
      ) {
        // reload buddy list from PBX
        this._rpcCall(
          'GetAllUsers',
          {
            target: {
              tenant: this._tenant,
            },
          },
          function (result) {
            this._allUsers = result || {}
            if (
              this._allUsers.user &&
              typeof this._allUsers.user.sort === 'function'
            ) {
              this._allUsers.user.sort(function (user1, user2) {
                var id1 = string(user1 && user1.user_id)
                var id2 = string(user2 && user2.user_id)
                return id1 < id2 ? -1 : id1 > id2 ? 1 : 0
              })
            }
            this._refreshBuddylist()

            this._recvNotifyStatus2(args, user, isNonbuddy)
          },
          null,
        )
        return
      }
    }

    this._recvNotifyStatus2(args, user, isNonbuddy)
  },
  _recvNotifyStatus2(args, user, isNonbuddy) {
    var sender_tenant = string(args.sender.tenant || this._tenant)
    var sender_user_id = string(args.sender.user_id)
    var key = JSON.stringify({
      tenant: sender_tenant,
      user_id: sender_user_id,
    })

    // memory status
    this._buddyStatus[key] = {
      status: args.client_param.status,
      display: args.client_param.display,
    }
    // memory download key
    this._download_keys[key] = args.client_param.dlk
    // modify name
    if (
      user.name !== args.client_param.name &&
      args.client_param.name !== null
    ) {
      user.name = args.client_param.name
    }
    // memory phone status
    this._buddyPhone[key] = {
      pnumber: args.client_param.pnumber,
      registered: args.client_param.registered,
    }
    // memory ucclient_customized_status
    if (args.client_param.ucclient_customized_status) {
      this._ucclient_customized_status_table[key] =
        args.client_param.ucclient_customized_status
    }

    // raise buddyStatusChanged event
    if (this._eventListeners.buddyStatusChanged && this._signInStatus === 3) {
      var ev = {
        tenant: sender_tenant,
        user_id: sender_user_id,
        name: string(args.client_param.name),
        profile_image_url: this._getProfileImageUrl(
          sender_tenant,
          sender_user_id,
        ),
        status: int(args.client_param.status),
        display: string(args.client_param.display),
        request_ltime: stringifyTstamp(args.request_tstamp),
        request_tstamp: int(args.request_tstamp),
      }
      try {
        ev.ui_customized_status = (
          JSON.parse(string(this._ucclient_customized_status_table[key])) || {}
        ).ui_customized_status
      } catch (e) {}
      if (typeof ev.ui_customized_status === 'undefined') {
        ev.ui_customized_status = null
      }
      this._eventListeners.buddyStatusChanged(ev)
    }
  },
  _getProfileImageUrl(tenant, user_id) {
    var key = JSON.stringify({ tenant, user_id })
    if (this._ucclient_customized_status_table[key]) {
      var url = ''
      try {
        url = string(
          (
            JSON.parse(string(this._ucclient_customized_status_table[key])) ||
            {}
          ).myProfileImageUrl,
        )
      } catch (e) {
        this._logger.log('warn', e.message + ' at _getProfileImageUrl')
      }
      if (url) {
        return url
      }
    }
    return (
      (this._useHttps ? 'https://' : 'http://') +
      this._host +
      '/' +
      this._path +
      (this._download_keys[key] || string(user_id).substring(0, 2) === '##'
        ? Constants.PROFILE_IMAGE_URL_DOWNLOAD +
          '&tenant=' +
          encodeURIComponent(tenant) +
          '&user=' +
          encodeURIComponent(user_id) +
          (this._download_keys[key]
            ? '&dlk=' + encodeURIComponent(this._download_keys[key])
            : '') +
          (this._profileImageSize
            ? '&SIZE=' + encodeURIComponent(this._profileImageSize)
            : '')
        : Constants.NOIMAGE_URL)
    )
  },
  _recvText(args) {
    if (!args.sender) {
      this._logger.log('warn', 'Invalid argument: _recvText')
      return
    }
    var sender_tenant = args.sender.tenant || this._tenant
    var sender_user_id = string(args.sender.user_id)

    this._lastMessageTime = int(args.tstamp)

    switch (args.ctype) {
      case Constants.CTYPE_TEXT:
      case Constants.CTYPE_CALL_RESULT:
        // raise receivedText event
        if (this._eventListeners.receivedText && this._signInStatus === 3) {
          var ev = {
            sender: {
              tenant: sender_tenant,
              user_id: sender_user_id,
            },
            text: string(args.text),
            conf_id: args.conf_id ? string(args.conf_id) : null, // args.conf_id might be undefined or "" on non-conf
            ctype: int(args.ctype),
            received_text_id:
              string(args.action_id) +
              '_' +
              string(args.sent_ltime || args.ltime)
                .substr(0, 7)
                .split('-')
                .join(''),
            topic_id: string(args.topic_id || ''),
            ltime: stringifyTstamp(args.tstamp),
            tstamp: int(args.tstamp),
            sent_ltime: stringifyTstamp(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
            sent_tstamp: int(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
            requires_read: args.conf_id ? false : true,
          }
          this._eventListeners.receivedText(ev)
        }
        break
      case Constants.CTYPE_FILE_REQUEST:
        var fileProps
        try {
          fileProps = JSON.parse(args.text)
        } catch (e) {
          this._logger.log(
            'warn',
            'Invalid argument: _recvText text=' + args.text,
          )
          break
        }
        var isThirdParty
        var file_id = string(fileProps.file_id)
        if (fileProps.target) {
          if (
            fileProps.target.tenant === this._tenant &&
            fileProps.target.user_id === this._user_id
          ) {
            isThirdParty = false
          } else {
            if (fileProps.additionals) {
              isThirdParty = true
              for (var i = 0; i < fileProps.additionals.length; i++) {
                if (
                  fileProps.additionals[i].target.tenant === this._tenant &&
                  fileProps.additionals[i].target.user_id === this._user_id
                ) {
                  isThirdParty = false
                  file_id = fileProps.additionals[i].file_id
                  break
                }
              }
            } else {
              isThirdParty = true
            }
          }
        } else {
          isThirdParty = false
        }
        if (isThirdParty) {
          // raise receivedText event
          if (this._eventListeners.receivedText && this._signInStatus === 3) {
            var ev = {
              sender: {
                tenant: sender_tenant,
                user_id: sender_user_id,
              },
              text: string(args.text),
              conf_id: args.conf_id ? string(args.conf_id) : null, // args.conf_id might be undefined or "" on non-conf
              ctype: int(args.ctype),
              received_text_id:
                string(args.action_id) +
                '_' +
                string(args.sent_ltime || args.ltime)
                  .substr(0, 7)
                  .split('-')
                  .join(''),
              topic_id: string(args.topic_id || ''),
              ltime: stringifyTstamp(args.tstamp),
              tstamp: int(args.tstamp),
              sent_ltime: stringifyTstamp(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
              sent_tstamp: int(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
              requires_read: args.conf_id ? false : true,
            }
            this._eventListeners.receivedText(ev)
          }
        } else {
          var target = {
            tenant: sender_tenant,
            user_id: sender_user_id,
          }
          var name = string(fileProps.name)
          var size = int(fileProps.size)

          // new file info
          this._newFileInfo(
            file_id,
            target,
            false,
            Constants.FILE_STATUS_UNACCEPTED,
            name,
            size,
            null,
            null,
          )

          // raise fileReceived event
          if (this._eventListeners.fileReceived && this._signInStatus === 3) {
            var ev = {
              fileInfo: this.getFileInfo(file_id),
              conf_id: args.conf_id ? string(args.conf_id) : null,
              text_id:
                string(args.action_id) +
                '_' +
                string(args.sent_ltime || args.ltime)
                  .substr(0, 7)
                  .split('-')
                  .join(''),
              topic_id: string(args.topic_id || ''),
              ltime: stringifyTstamp(args.tstamp),
              tstamp: int(args.tstamp),
              sent_ltime: stringifyTstamp(args.sent_tstamp || args.tstamp),
              sent_tstamp: int(args.sent_tstamp || args.tstamp),
            }
            this._eventListeners.fileReceived(ev)
          }
        }
        break
      case Constants.CTYPE_OBJECT:
        var receivedObject = undefined
        try {
          receivedObject = JSON.parse(args.text)
        } catch (e) {
          this._logger.log('warn', e.message + ' at _recvText')
        }
        // raise objectReceived event
        if (this._eventListeners.objectReceived && this._signInStatus === 3) {
          var ev = {
            sender: {
              tenant: sender_tenant,
              user_id: sender_user_id,
            },
            text: string(args.text),
            object: receivedObject,
            conf_id: args.conf_id ? string(args.conf_id) : null, // args.conf_id might be undefined or "" on non-conf
            ctype: int(args.ctype),
            received_text_id:
              string(args.action_id) +
              '_' +
              string(args.sent_ltime || args.ltime)
                .substr(0, 7)
                .split('-')
                .join(''),
            topic_id: string(args.topic_id || ''),
            ltime: stringifyTstamp(args.tstamp),
            tstamp: int(args.tstamp),
            sent_ltime: stringifyTstamp(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
            sent_tstamp: int(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
            requires_read: args.conf_id ? false : true,
          }
          this._eventListeners.objectReceived(ev)
        }
        break
      case Constants.CTYPE_CONF_START:
        break
      case Constants.CTYPE_CONF_LEAVE:
        // raise confLeaveReceived event
        if (
          this._eventListeners.confLeaveReceived &&
          this._signInStatus === 3
        ) {
          var ev = {
            sender: {
              tenant: sender_tenant,
              user_id: sender_user_id,
            },
            text: string(args.text),
            conf_id: args.conf_id ? string(args.conf_id) : null, // args.conf_id might be undefined or "" on non-conf
            ctype: int(args.ctype),
            received_text_id:
              string(args.action_id) +
              '_' +
              string(args.sent_ltime || args.ltime)
                .substr(0, 7)
                .split('-')
                .join(''),
            topic_id: string(args.topic_id || ''),
            ltime: stringifyTstamp(args.tstamp),
            tstamp: int(args.tstamp),
            sent_ltime: stringifyTstamp(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
            sent_tstamp: int(args.sent_tstamp || args.tstamp), // args.sent_tstamp has value only in GetUnreadText
          }
          this._eventListeners.confLeaveReceived(ev)
        }
        break
      default:
        this._logger.log(
          'warn',
          'Invalid argument: _recvText ctype=' + args.ctype,
        )
        break
    }
  },
  _recvTyping(args) {
    if (!args.sender || !args.client_param) {
      this._logger.log('warn', 'Invalid argument: _recvTyping')
      return
    }
    var sender_tenant = string(args.sender.tenant || this._tenant)
    var sender_user_id = string(args.sender.user_id)

    // raise receivedTyping event
    if (this._eventListeners.receivedTyping && this._signInStatus === 3) {
      var ev = {
        tenant: sender_tenant,
        user_id: sender_user_id,
        request_ltime: stringifyTstamp(args.request_tstamp),
        request_tstamp: int(args.request_tstamp),
      }
      this._eventListeners.receivedTyping(ev)
    }
  },
  _newConference(conf_id) {
    // create conference if not exists
    if (!this._conferences[conf_id]) {
      var conference = {}
      conference.conf_id = conf_id
      conference.subject = ''
      conference.created_time = ''
      conference.created_tstamp = 0
      conference.created_server_time = ''
      conference.conf_type = ''
      conference.conf_status = Constants.CONF_STATUS_INVITED
      conference.from = {
        tenant: '',
        user_id: '',
        user_name: '',
      }
      conference.creator = {
        tenant: '',
        user_id: '',
        user_name: '',
      }
      conference.assigned = {
        tenant: '',
        user_id: '',
      }
      conference.ext_conf_info = {}
      conference.conf_tags = []
      conference.webchatinfo = {}
      conference.invite_properties = {
        invisible: false,
        rejoinable: false,
        webchatfromguest: null,
        continuation_info: null,
        rwq: false,
      }
      conference.user = []
      this._conferences[conf_id] = conference
    }
  },
  _invitedToConference(args) {
    if (!args.conf_id || !args.from) {
      this._logger.log('warn', 'Invalid argument: _invitedToConference')
      return
    }

    var profile = this.getProfile()
    var conf_id = string(args.conf_id)

    this._newConference(conf_id)

    this._conferences[conf_id].subject = string(args.subject)
    this._conferences[conf_id].created_time = stringifyTstamp(
      args.created_tstamp,
    )
    this._conferences[conf_id].created_tstamp = int(args.created_tstamp)
    this._conferences[conf_id].created_server_time = string(args.created_ltime)
    this._conferences[conf_id].conf_type = string(args.conf_type)
    this._conferences[conf_id].conf_status = int(args.conf_status)
    this._conferences[conf_id].invite_properties = {
      invisible: Boolean(
        args.join_properties && args.join_properties.invisible,
      ),
      rejoinable: Boolean(
        args.join_properties && args.join_properties.rejoinable,
      ),
      webchatfromguest:
        (args.join_properties && args.join_properties.webchatfromguest) || null,
      continuation_info:
        (args.join_properties && args.join_properties.continuation_info) ||
        null,
      rwq: Boolean(args.join_properties && args.join_properties.rwq),
    }
    if (args.assigned && args.assigned.user_id) {
      this._conferences[conf_id].assigned = {
        tenant: string(args.assigned.tenant),
        user_id: string(args.assigned.user_id),
      }
    }
    if (args.ext_conf_info) {
      this._conferences[conf_id].ext_conf_info = args.ext_conf_info
    }
    if (args.webchatinfo) {
      this._conferences[conf_id].webchatinfo = args.webchatinfo
    }

    // from
    this._conferences[conf_id].from = {
      tenant: string(args.from && args.from.tenant),
      user_id: string(args.from && args.from.user_id),
      user_name: string(
        args.from && (args.from.user_name || args.from.user_id),
      ),
    }

    // creator
    this._conferences[conf_id].creator = {
      tenant: string(args.creator && args.creator.tenant),
      user_id: string(args.creator && args.creator.user_id),
      user_name: string(
        args.creator && (args.creator.user_name || args.creator.user_id),
      ),
    }

    // user
    this._conferences[conf_id].user = [
      // inviter
      {
        user_id: string(args.from && args.from.user_id),
        tenant: string(args.from && args.from.tenant),
        name: string(args.from && (args.from.user_name || args.from.user_id)),
        conf_status: int(
          (args.from && args.from.conf_status) || Constants.CONF_STATUS_JOINED,
        ),
      },
      // me
      {
        user_id: profile.user_id,
        tenant: profile.tenant,
        name: profile.name || profile.user_id,
        conf_status: int(args.conf_status),
      },
    ]

    // raise invitedToConference event
    if (this._eventListeners.invitedToConference && this._signInStatus === 3) {
      var ev = {
        conference: this.getConference(conf_id),
        ltime: stringifyTstamp(args.tstamp),
        tstamp: int(args.tstamp),
      }
      this._eventListeners.invitedToConference(ev)
    }
  },
  _conferenceMemberChanged(args) {
    if (this._enteringWebchatRoom && this._enteringWebchatRoom.push) {
      this._enteringWebchatRoom.push(
        this._byThis(this._conferenceMemberChanged, [args]),
      )
      return
    }

    var conf_id = string(args.conf_id)
    var conf_status = Constants.CONF_STATUS_INACTIVE

    this._newConference(conf_id)

    // update member list
    var users = []
    if (args.user && args.user.length) {
      for (var i = 0; i < args.user.length; i++) {
        var user = {}
        user.user_id = args.user[i].user_id
        user.tenant = args.user[i].tenant
        user.name = args.user[i].user_name
        user.conf_status = args.user[i].conf_status
        user.video_conf_status = args.user[i].video_conf_status
        user.reenter_user_id = args.user[i].reenter_user_id
        users.push(user)
        if (
          args.user[i].tenant === this._tenant &&
          args.user[i].user_id === this._user_id
        ) {
          conf_status = args.user[i].conf_status
        }
      }
    }
    this._conferences[conf_id].user = users
    this._conferences[conf_id].conf_status = conf_status

    if (conf_status === Constants.CONF_STATUS_INVITED) {
      // inviter
      this._conferences[conf_id].user.push({
        user_id: this._conferences[conf_id].from.user_id,
        tenant: this._conferences[conf_id].from.tenant,
        name:
          this._conferences[conf_id].from.user_name ||
          this._conferences[conf_id].from.user_id,
        conf_status: Constants.CONF_STATUS_JOINED,
      })
    }

    // update assigned
    if (
      this._conferences[conf_id].invite_properties.webchatfromguest &&
      !this._conferences[conf_id].assigned.user_id
    ) {
      for (var i = 0; i < this._conferences[conf_id].user.length; i++) {
        if (
          this._conferences[conf_id].user[i].conf_status ===
            Constants.CONF_STATUS_JOINED &&
          this._conferences[conf_id].user[i].user_id !==
            this._conferences[conf_id].creator.user_id
        ) {
          this._conferences[conf_id].assigned.tenant =
            this._conferences[conf_id].user[i].tenant
          this._conferences[conf_id].assigned.user_id =
            this._conferences[conf_id].user[i].user_id
          break
        }
      }
    }

    var conference = this.getConference(conf_id)

    // forced left
    if (conf_status === Constants.CONF_STATUS_INACTIVE) {
      delete this._conferences[conf_id]
    }

    // raise conferenceMemberChanged event
    if (
      this._eventListeners.conferenceMemberChanged &&
      this._signInStatus === 3
    ) {
      var ev = {
        conference,
        ltime: stringifyTstamp(args.tstamp),
        tstamp: int(args.tstamp),
      }
      this._eventListeners.conferenceMemberChanged(ev)
    }

    // joined only
    if (conf_status === Constants.CONF_STATUS_JOINED) {
      // conference call
      for (var bundleId in this._sessionBundleTable) {
        var bundle = this._sessionBundleTable[bundleId]
        if (bundle.target.conf_id === conf_id) {
          // raise callInfoChanged event
          this._callInfoChanged(bundleId)
        }
      }
    }
  },
  _extConfInfoChanged(args) {
    var conf_id = string(args.conf_id)

    if (!this._conferences[conf_id]) {
      this._logger.log('warn', 'Unknown conference changed: ' + conf_id)
      return
    }

    this._conferences[conf_id].ext_conf_info = args.ext_conf_info || {}

    var conference = this.getConference(conf_id)

    // raise extConfInfoChanged event
    if (this._eventListeners.extConfInfoChanged && this._signInStatus === 3) {
      var ev = {
        conference,
      }
      this._eventListeners.extConfInfoChanged(ev)
    }
  },
  _tagUpdated(args) {
    var attached_type = string(args.attached_type)
    var attached_id = string(args.attached_id)
    var tags = args.tags && args.tags.length ? args.tags : []
    var yyyymm = string(args.yyyymm)
    var ltime = string(args.ltime)

    if (attached_type === 'conf') {
      var conf_id = attached_id
      if (
        Math.abs(int(ltime.substr(0, 7).split('-').join('')) - int(yyyymm)) > 1
      ) {
        this._logger.log(
          'info',
          '_tagUpdated old conference (conf_id: ' +
            conf_id +
            ', yyyymm: ' +
            yyyymm +
            ', ltime: ' +
            ltime +
            ')',
        )
        return
      }
      if (!this._conferences[conf_id]) {
        this._logger.log(
          'info',
          '_tagUpdated inactive conference (conf_id: ' + conf_id + ')',
        )
        return
      }
      this._conferences[conf_id].conf_tags = tags
      var conference = this.getConference(conf_id)
      // raise confTagUpdated event
      if (this._eventListeners.confTagUpdated && this._signInStatus === 3) {
        var ev = {
          conference,
        }
        this._eventListeners.confTagUpdated(ev)
      }
    }
  },
  _newFileInfo(file_id, target, isUpload, status, name, size, form, formData) {
    // create file info
    this._fileInfos[file_id] = {
      file_id,
      target,
      isUpload,
      status,
      name,
      size,
      progress: 0,
      _form: form,
      _formData: formData,
      _xhr: null,
      _lastProgressTime: 0,
    }
  },
  _terminateFileInfo(file_id, status) {
    if (this._fileInfos[file_id]) {
      this._fileInfos[file_id].status = status
      if (status === Constants.FILE_STATUS_COMPLETED) {
        this._fileInfos[file_id].progress = 100
      }
      this._fileInfos[file_id]._form = null
      this._fileInfos[file_id]._formData = null
      this._fileInfos[file_id]._xhr = null

      // raise fileTerminated event
      if (this._eventListeners.fileTerminated && this._signInStatus === 3) {
        var ev = {
          fileInfo: this.getFileInfo(file_id),
        }
        this._eventListeners.fileTerminated(ev)
      }

      delete this._fileInfos[file_id]
    }
  },
  _changeFileInfo(file_id, status, progress) {
    if (this._fileInfos[file_id]) {
      this._fileInfos[file_id].status = status
      this._fileInfos[file_id].progress = progress

      // raise fileInfoChanged event
      if (this._eventListeners.fileInfoChanged && this._signInStatus === 3) {
        var ev = {
          fileInfo: this.getFileInfo(file_id),
        }
        this._eventListeners.fileInfoChanged(ev)
      }
    }
  },
  _recvRecvFile(args) {
    if (
      !args.client_param ||
      !args.client_param.response ||
      !args.client_param.file_id
    ) {
      this._logger.log('warn', 'Invalid argument: _recvRecvFile')
      return
    }
    var file_id = args.client_param.file_id
    var fileInfo = this._fileInfos[file_id]
    if (fileInfo) {
      switch (args.client_param.response) {
        case Constants.CTYPE_FILE_ACCEPT:
          // start upload post
          setTimeout(
            this._byThis(function () {
              // wait to start sync on server
              var fileInfo = this._fileInfos[file_id]
              if (fileInfo) {
                if (fileInfo._formData) {
                  // FormData enabled
                  // upload with XHR + FormData
                  var fd = fileInfo._formData
                  var xhr = new XMLHttpRequest()
                  xhr.open(
                    'POST',
                    (this._useHttps ? 'https://' : 'http://') +
                      this._host +
                      '/' +
                      this._path +
                      '/file?ACTION=UPLOAD&SUBACTION=TRANS&TRANSFER_ID=' +
                      encodeURIComponent(file_id) +
                      '&tenant=' +
                      encodeURIComponent(this._tenant) +
                      '&user=' +
                      encodeURIComponent(this._user_id),
                    true,
                  )
                  xhr.upload.onprogress = this._byThis(function (evt) {
                    if (evt.lengthComputable) {
                      var progress = Math.min(
                        99,
                        Math.round((evt.loaded * 100) / evt.total),
                      )
                      var progressTime = new Date().getTime()
                      if (
                        fileInfo.progress !== progress &&
                        fileInfo._lastProgressTime + 1000 <= progressTime
                      ) {
                        this._changeFileInfo(
                          file_id,
                          Constants.FILE_STATUS_TRANSFERRING,
                          progress,
                        )
                        fileInfo._lastProgressTime = progressTime
                        this._rpcCall(
                          'SendClientEvent',
                          {
                            client_method: 'NotifyFileTransfer',
                            target: fileInfo.target,
                            client_param: {
                              file_id,
                              status: Constants.CTYPE_FILE_PROGRESS,
                              progress: fileInfo.progress,
                            },
                          },
                          null,
                          null,
                        )
                      }
                    }
                  })
                  xhr.upload.onerror = this._byThis(function (evt) {
                    this._terminateFileInfo(
                      file_id,
                      Constants.FILE_STATUS_ERROR,
                    )
                  })
                  xhr.upload.ontimeout = this._byThis(function (evt) {
                    this._terminateFileInfo(
                      file_id,
                      Constants.FILE_STATUS_ERROR,
                    )
                  })
                  xhr.onload = this._byThis(function (evt) {
                    this._terminateFileInfo(
                      file_id,
                      xhr.status === 200
                        ? Constants.FILE_STATUS_COMPLETED
                        : Constants.FILE_STATUS_ERROR,
                    )
                  })
                  xhr.send(fd)
                  fileInfo._xhr = xhr
                  // raise fileInfoChanged event
                  this._changeFileInfo(
                    file_id,
                    Constants.FILE_STATUS_TRANSFERRING,
                    0,
                  )
                } else {
                  // FormData disabled (IE9)
                  // upload with form
                  fileInfo._form.action =
                    (this._useHttps ? 'https://' : 'http://') +
                    this._host +
                    '/' +
                    this._path +
                    '/file?ACTION=UPLOAD&SUBACTION=TRANS&TRANSFER_ID=' +
                    encodeURIComponent(file_id) +
                    '&tenant=' +
                    encodeURIComponent(this._tenant) +
                    '&user=' +
                    encodeURIComponent(this._user_id)
                  fileInfo._form.method = 'POST'
                  fileInfo._form.enctype = 'multipart/form-data'
                  fileInfo._form.submit()
                  // raise fileTerminated event (cannot report progress)
                  this._terminateFileInfo(
                    file_id,
                    Constants.FILE_STATUS_COMPLETED,
                  )
                }
              }
            }),
            2000,
          )
          break
        case Constants.CTYPE_FILE_REJECT:
          this._rpcCall(
            'StopFileTransfer',
            {
              file_id,
            },
            function (result) {
              if (fileInfo._xhr) {
                fileInfo._xhr.upload.onabort = this._byThis(function (evt) {
                  this._terminateFileInfo(
                    file_id,
                    Constants.FILE_STATUS_REMOTE_CANCEL,
                  )
                })
                fileInfo._xhr.abort()
              } else {
                this._terminateFileInfo(
                  file_id,
                  Constants.FILE_STATUS_REMOTE_CANCEL,
                )
              }
            },
            function (error) {
              this._logger.log(
                'warn',
                'Failed to stop file transfer: ' + string(error.message),
              )
              if (fileInfo._xhr) {
                fileInfo._xhr.upload.onabort = this._byThis(function (evt) {
                  this._terminateFileInfo(file_id, Constants.FILE_STATUS_ERROR)
                })
                fileInfo._xhr.abort()
              } else {
                this._terminateFileInfo(file_id, Constants.FILE_STATUS_ERROR)
              }
            },
          )
          break
      }
    }
  },
  _recvNotifyFileTransfer(args) {
    if (
      !args.client_param ||
      !args.client_param.status ||
      !args.client_param.file_id
    ) {
      this._logger.log('warn', 'Invalid argument: _recvNotifyFileTransfer')
      return
    }
    var file_id = args.client_param.file_id
    var fileInfo = this._fileInfos[file_id]
    if (fileInfo) {
      switch (args.client_param.status) {
        case Constants.CTYPE_FILE_CANCEL:
          this._terminateFileInfo(file_id, Constants.FILE_STATUS_REMOTE_CANCEL)
          break
        case Constants.CTYPE_FILE_PROGRESS:
          var progress = args.client_param.progress
          if (fileInfo.progress !== progress) {
            this._changeFileInfo(
              file_id,
              Constants.FILE_STATUS_TRANSFERRING,
              progress,
            )
          }
          break
      }
    }
  },
  _recvFile(args) {
    if (!args.status || !args.file_id) {
      this._logger.log('warn', 'Invalid argument: _recvFile')
      return
    }
    var file_id = args.file_id
    var fileInfo = this._fileInfos[file_id]
    if (fileInfo) {
      if (args.status === 1) {
        this._terminateFileInfo(file_id, Constants.FILE_STATUS_COMPLETED)
      }
    }
  },
  _phoneError(e) {
    var msg = e.event + ' at InitPhone (cause: ' + e.data.cause + ')'
    var detail = e.data.response ? '\n' + e.data.response.data : ''
    this._logger.log('warn', msg + detail)

    this._phoneStatusChanged(false, Errors.WEBRTC_TEMPORARILY_UNAVAILABLE, msg)
  },
  _sessionCreated(e) {
    var callSession = e.callSession
    var sessionBundleId = null
    var sessionBundle = null

    if (callSession.status === 'dialing') {
      // outgoing call
      sessionBundleId = callSession.option.sessionBundleId
      if (this._makeCallStatus[sessionBundleId]) {
        if (this._sessionBundleTable[sessionBundleId]) {
          sessionBundle = this._sessionBundleTable[sessionBundleId]
          if (callSession.option.mediaConstraints) {
            sessionBundle.mediaConstraints = {
              audio:
                callSession.option.mediaConstraints.audio ||
                sessionBundle.mediaConstraints.audio,
              video:
                callSession.option.mediaConstraints.video ||
                sessionBundle.mediaConstraints.video,
            }
          }
          sessionBundle.sharedObjectJson =
            callSession.option.sharedObjectJson || '{}'
          sessionBundle.singleSession = Boolean(
            callSession.option.singleSession,
          )
          if (sessionBundle.direction !== Constants.CALL_DIRECTION_OUTGOING) {
            sessionBundle.direction = Constants.CALL_DIRECTION_UNKNOWN
          }
        } else {
          // create sessionBundle
          sessionBundle = {
            target: callSession.option.target,
            sessionIdArray: [],
            lastCallInfo: '',
            direction: Constants.CALL_DIRECTION_OUTGOING,
            microphoneMuted: false,
            cameraMuted: false,
            autoAnswer: true,
            autoTerminate: !Boolean(callSession.option.target.conf_id),
            mediaConstraints: callSession.option.mediaConstraints || {
              audio: false,
              video: false,
            },
            sharedObjectJson: callSession.option.sharedObjectJson || '{}',
            singleSession: Boolean(callSession.option.singleSession),
          }
          this._sessionBundleTable[sessionBundleId] = sessionBundle
        }
        sessionBundle.sessionIdArray.push(callSession.id)

        clearTimeout(this._makeCallStatus[sessionBundleId].timer)

        // callback funcOK of makeCall
        var callInfo = this.getCallInfo(sessionBundleId)
        this._sessionBundleTable[sessionBundleId].lastCallInfo =
          JSON.stringify(callInfo)
        if (this._makeCallStatus[sessionBundleId].funcOK) {
          var ev = {
            callInfo,
          }
          this._makeCallStatus[sessionBundleId].funcOK(ev)
        }
        delete this._makeCallStatus[sessionBundleId]
      } else if (this._sessionBundleTable[sessionBundleId]) {
        sessionBundle = this._sessionBundleTable[sessionBundleId]
        sessionBundle.sessionIdArray.push(callSession.id)

        // raise callInfoChanged event
        this._callInfoChanged(sessionBundleId)
      } else {
        this._logger.log(
          'warn',
          'Outgoing session without makeCall: ' + sessionBundleId,
        )
        callSession.hangUp()
      }
    } else {
      // incoming call

      // get address
      var address = string(callSession.peerUser)

      // get user_id
      var tenant = null
      var user_id = null
      if (
        this._phoneProperties.mode_uc_call === 1 ||
        (this._phoneProperties.mode_uc_call === 2 &&
          !callSession.mediaConstraints.audio)
      ) {
        // directly (address is pnumber)
        for (var key in this._buddyPhone) {
          var buddyPnumber = string(this._buddyPhone[key].pnumber)
          if (address === buddyPnumber && buddyPnumber !== '') {
            try {
              var tenant_user = JSON.parse(key)
              tenant = tenant_user.tenant
              user_id = tenant_user.user_id
              break
            } catch (e) {}
          }
        }
      } else {
        // via PBX (address is pbx extension)
        var buddylist = this.getBuddylist()
        for (var i = 0; i < buddylist.user.length; i++) {
          var buddyExtension = string(buddylist.user[i].user_id)
          if (address === buddyExtension && buddyExtension !== '') {
            tenant = buddylist.user[i].tenant
            user_id = buddylist.user[i].user_id
            break
          }
        }
      }
      if (user_id !== null) {
        callSession.option.tenant = tenant
        callSession.option.user_id = user_id
        // get sessionBundleId if exists
        for (var bundleId in this._sessionBundleTable) {
          if (
            this._sessionBundleTable[bundleId].target.tenant === tenant &&
            this._sessionBundleTable[bundleId].target.user_id === user_id
          ) {
            //// check direction of session
            //var directionSame = true;
            //for (var i = 0; i < this._sessionBundleTable[bundleId].sessionIdArray.length; i++) {
            //    var session = this._phone.getCallSession(this._sessionBundleTable[bundleId].sessionIdArray[i]);
            //    if (session && session.direction !== callSession.direction) {
            //        directionSame = false;
            //        break;
            //    }
            //}
            //if (directionSame) {
            if (!this._sessionBundleTable[bundleId].singleSession) {
              sessionBundleId = bundleId
              break
            }
            //}
          }
        }
      } else {
        callSession.option.tenant = ''
        callSession.option.user_id = ''
      }

      // get conf_id
      var conf_id = null
      if (
        this._phoneProperties.mode_uc_call === 1 ||
        (this._phoneProperties.mode_uc_call === 2 &&
          !callSession.mediaConstraints.audio)
      ) {
        loop_get_conf_id: for (var id in this._conferenceCalls) {
          var conf = this._conferences[id]
          if (conf) {
            for (var i = 0; i < conf.user.length; i++) {
              var user = conf.user[i]
              // if the user of user_id is joining the video conference call
              if (
                string(user.tenant || this._tenant) === tenant &&
                string(user.user_id) === user_id &&
                int(user.video_conf_status) === this.VIDEO_CONF_VIDEO
              ) {
                for (var bundleId in this._sessionBundleTable) {
                  var bundle = this._sessionBundleTable[bundleId]
                  if (bundle.target.conf_id === id) {
                    var established = false
                    for (var j = 0; j < bundle.sessionIdArray.length; j++) {
                      var sess = this._phone.getCallSession(
                        bundle.sessionIdArray[j],
                      )
                      if (
                        sess &&
                        string(sess.option.tenant) === tenant &&
                        string(sess.option.user_id) === user_id
                      ) {
                        established = true
                        break
                      }
                    }
                    // if the user's session is not established yet
                    if (!established) {
                      conf_id = id
                      sessionBundleId = bundleId
                    }
                    break loop_get_conf_id
                  }
                }
              }
            }
          }
        }
      }

      if (sessionBundleId === null) {
        // create new sessionBundle
        sessionBundle = {
          target: {},
          sessionIdArray: [],
          lastCallInfo: '',
          direction: Constants.CALL_DIRECTION_INCOMING,
          microphoneMuted: false,
          cameraMuted: false,
          autoAnswer: false,
          autoTerminate: true,
          mediaConstraints: { audio: false, video: false },
          sharedObjectJson: '{}',
          singleSession: false,
        }
        if (conf_id !== null) {
          sessionBundle.target.conf_id = conf_id
        } else if (user_id !== null) {
          sessionBundle.target = {
            tenant,
            user_id,
          }
          var key = JSON.stringify(sessionBundle.target)
          if (this._receivedSharedObjectJsonTable[key]) {
            if (
              new Date().getTime() -
                this._receivedSharedObjectJsonTable[key].timestamp <=
              10000
            ) {
              sessionBundle.sharedObjectJson =
                this._receivedSharedObjectJsonTable[key].json
            }
            delete this._receivedSharedObjectJsonTable[key]
          }
        } else {
          sessionBundle.target.address = address
        }
        sessionBundle.sessionIdArray.push(callSession.id)

        sessionBundleId = ++this._sessionBundleIdCounter
        this._sessionBundleTable[sessionBundleId] = sessionBundle

        // raise callReceived event
        var callInfo = this.getCallInfo(sessionBundleId)
        this._sessionBundleTable[sessionBundleId].lastCallInfo =
          JSON.stringify(callInfo)
        if (this._eventListeners.callReceived && this._signInStatus === 3) {
          var ev = {
            callInfo,
          }
          this._eventListeners.callReceived(ev)
        }
      } else {
        // add session to existing sessionBundle
        sessionBundle = this._sessionBundleTable[sessionBundleId]
        sessionBundle.sessionIdArray.push(callSession.id)
        if (sessionBundle.direction !== Constants.CALL_DIRECTION_INCOMING) {
          sessionBundle.direction = Constants.CALL_DIRECTION_UNKNOWN
        }

        if (this._receivedSharedObjectJsonTable[key]) {
          if (
            new Date().getTime() -
              this._receivedSharedObjectJsonTable[key].timestamp <=
            10000
          ) {
            sessionBundle.sharedObjectJson =
              this._receivedSharedObjectJsonTable[key].json
          }
          delete this._receivedSharedObjectJsonTable[key]
        }

        // auto answer
        if (sessionBundle.autoAnswer) {
          var audioConstraints = callSession.mediaConstraints.audio
            ? sessionBundle.mediaConstraints.audio
            : false
          var videoConstraints = callSession.mediaConstraints.video
            ? sessionBundle.mediaConstraints.video
            : false
          if (audioConstraints || videoConstraints) {
            callSession.answer({
              audio: audioConstraints,
              video: videoConstraints,
            })
          }
        }

        // raise callInfoChanged event
        this._callInfoChanged(sessionBundleId)
      }
    }
  },
  _statusChanged(e) {
    var callSession = e.callSession
    var sessionBundleId = null
    var sessionBundle = null
    for (var bundleId in this._sessionBundleTable) {
      var bundle = this._sessionBundleTable[bundleId]
      for (var i = 0; i < bundle.sessionIdArray.length; i++) {
        var sessionId = bundle.sessionIdArray[i]
        if (sessionId === callSession.id) {
          sessionBundleId = bundleId
          sessionBundle = bundle
        }
      }
    }

    if (sessionBundleId === null) {
      this._logger.log('warn', 'Unknown session changed: ' + callSession.id)
      return
    }

    // auto mute
    if (callSession.status === 'answered') {
      if (sessionBundle.microphoneMuted) {
        callSession.muteMicrophone(true)
      }
      if (sessionBundle.cameraMuted) {
        callSession.muteCamera(true)
      }
    }

    // raise callInfoChanged event or callTerminated event
    this._callInfoChanged(sessionBundleId)
  },
  _callInfoChanged(sessionBundleId) {
    var sessionBundle = this._sessionBundleTable[sessionBundleId]
    if (!sessionBundle) {
      return
    }

    // check all sessions terminated
    var terminated = false
    if (sessionBundle.autoTerminate) {
      terminated = true
      for (var i = 0; i < sessionBundle.sessionIdArray.length; i++) {
        var session = this._phone.getCallSession(
          sessionBundle.sessionIdArray[i],
        )
        if (session && session.status !== 'terminated') {
          terminated = false
          break
        }
      }
    }

    var callInfo = this.getCallInfo(sessionBundleId)
    if (!terminated) {
      var callInfoJson = JSON.stringify(callInfo)
      if (sessionBundle.lastCallInfo !== callInfoJson) {
        sessionBundle.lastCallInfo = callInfoJson
        // raise callInfoChanged event
        if (this._eventListeners.callInfoChanged && this._signInStatus === 3) {
          var ev = {
            callInfo,
          }
          this._eventListeners.callInfoChanged(ev)
        }
      }
    } else {
      if (callInfo.target.conf_id) {
        if (
          this._phoneProperties.mode_uc_call === 1 ||
          this._phoneProperties.mode_uc_call === 2
        ) {
          // leave conference call
          delete this._conferenceCalls[callInfo.target.conf_id]
          this._rpcCall(
            'LeaveConference',
            {
              conf_id: callInfo.target.conf_id,
              video_conf: this.VIDEO_CONF_VIDEO,
            },
            null,
            null,
          )
        }
      }

      // raise callTerminated event
      if (this._eventListeners.callTerminated && this._signInStatus === 3) {
        var ev = {
          callInfo,
        }
        this._eventListeners.callTerminated(ev)
      }

      delete this._sessionBundleTable[sessionBundleId]
    }
  },
  _sendSharedObject(target, sharedObject, funcOK, funcError) {
    var sendSharedObjectFuncOKTable = this._sendSharedObjectFuncOKTable
    var key = JSON.stringify(target)
    if (sendSharedObjectFuncOKTable[key]) {
      if (funcError) {
        var ev = {
          code: Errors.MAKECALL_DUPLICATE,
          message: 'Duplicate calling',
        }
        funcError(ev)
      }
      return
    }

    var timer = setTimeout(function () {
      // timeout
      clearTimeout(timer)
      delete sendSharedObjectFuncOKTable[key]
      if (funcError) {
        var ev = {
          code: Errors.MAKECALL_SEND_TIMEOUT,
          message: 'Send timeout',
        }
        funcError(ev)
      }
    }, this.MAKE_CALL_TIMEOUT_DEFAULT)

    sendSharedObjectFuncOKTable[key] = function () {
      // funcOK
      clearTimeout(timer)
      delete sendSharedObjectFuncOKTable[key]
      if (funcOK) {
        funcOK()
      }
    }

    // send shared object
    this._rpcCall(
      'SendClientEvent',
      {
        client_method: 'SendSharedObject',
        target,
        client_param: {
          sharedObject,
        },
      },
      null,
      null,
    )
  },
  _recvSendSharedObject(args) {
    if (!args.sender || !args.client_param) {
      this._logger.log('warn', 'Invalid argument: _recvSendSharedObject')
      return
    }
    var sender_tenant = string(args.sender.tenant || this._tenant)
    var sender_user_id = string(args.sender.user_id)
    var target = { tenant: sender_tenant, user_id: sender_user_id }
    var key = JSON.stringify(target)

    this._receivedSharedObjectJsonTable[key] = {
      json: JSON.stringify(args.client_param.sharedObject),
      timestamp: new Date().getTime(),
    }

    // reply
    this._rpcCall(
      'SendClientEvent',
      {
        client_method: 'RecvSharedObject',
        target,
        client_param: {},
      },
      null,
      null,
    )
  },
  _recvRecvSharedObject(args) {
    if (!args.sender || !args.client_param) {
      this._logger.log('warn', 'Invalid argument: _recvRecvSharedObject')
      return
    }
    var sender_tenant = string(args.sender.tenant || this._tenant)
    var sender_user_id = string(args.sender.user_id)
    var target = { tenant: sender_tenant, user_id: sender_user_id }
    var key = JSON.stringify(target)

    // funcOK
    if (this._sendSharedObjectFuncOKTable[key]) {
      this._sendSharedObjectFuncOKTable[key]()
    }
  },
  _makeCallTimeout(sessionBundleId) {
    clearTimeout(this._makeCallStatus[sessionBundleId].timer)
    if (this._makeCallStatus[sessionBundleId].funcError) {
      var ev = {
        code: Errors.MAKECALL_TIMEOUT,
        message: 'Call timeout',
      }
      this._makeCallStatus[sessionBundleId].funcError(ev)
    }
    delete this._makeCallStatus[sessionBundleId]
  },
  _recvCustomClientEvent(args) {
    if (!args.sender) {
      this._logger.log('warn', 'Invalid argument: _recvCustomClientEvent')
      return
    }
    var sender_tenant = string(args.sender.tenant || this._tenant)
    var sender_user_id = string(args.sender.user_id)

    // raise receivedCustomClientEvent event
    if (
      this._eventListeners.receivedCustomClientEvent &&
      this._signInStatus === 3
    ) {
      var ev = {
        tenant: sender_tenant,
        user_id: sender_user_id,
        client_param: args.client_param,
        request_ltime: stringifyTstamp(args.request_tstamp),
        request_tstamp: int(args.request_tstamp),
      }
      this._eventListeners.receivedCustomClientEvent(ev)
    }
  },

  /*
   * RPC handler functions
   */
  ActionStatus(args) {
    if (args.result) {
      this._signInActionStatusOK(args)
    } else {
      this._signInActionStatusNG(args)
    }
  },
  ErrorNotification(args) {
    this._forcedSignOut(int(args.code), args.message)
  },
  StatusNotified(args) {
    if (!args.users || !args.users.length) {
      this._logger.log('warn', 'Invalid argument: StatusNotified')
      return
    }
    for (var i = 0; i < args.users.length; i++) {
      this._recvNotifyStatus(args.users[i])
    }
  },
  RecvClientEvent(args) {
    switch (args.client_method) {
      case 'Typing':
        this._recvTyping(args)
        break
      case 'RecvFile':
        this._recvRecvFile(args)
        break
      case 'NotifyFileTransfer':
        this._recvNotifyFileTransfer(args)
        break
      case 'SendSharedObject':
        this._recvSendSharedObject(args)
        break
      case 'RecvSharedObject':
        this._recvRecvSharedObject(args)
        break
      case 'CustomClientEvent':
        this._recvCustomClientEvent(args)
        break
      case 'Dummy':
        break
      default:
        this._logger.log(
          'warn',
          'Not implemented: ChatClient.RecvClientEvent client_method=' +
            args.client_method,
        )
        break
    }
  },
  RecvText(args) {
    this._recvText(args)
  },
  InviteToConferenceEvent(args) {
    this._invitedToConference(args)
  },
  ConferenceMemberChanged(args) {
    this._conferenceMemberChanged(args)
  },
  ExtConfInfoChanged(args) {
    this._extConfInfoChanged(args)
  },
  TagUpdated(args) {
    this._tagUpdated(args)
  },
  RecvFile(args) {
    this._recvFile(args)
  },
  NotifiedUserSearch(args) {
    // raise notifiedUserSearch event
    if (this._eventListeners.notifiedUserSearch && this._signInStatus === 3) {
      this._eventListeners.notifiedUserSearch(args)
    }
  },
  NotifiedUserDelete(args) {
    // raise notifiedUserDelete event
    if (this._eventListeners.notifiedUserDelete && this._signInStatus === 3) {
      this._eventListeners.notifiedUserDelete(args)
    }
  },
  DebugLogFilePrepared(args) {
    // raise debugLogFilePrepared event
    if (this._eventListeners.debugLogFilePrepared && this._signInStatus === 3) {
      var ev = {
        debug_log_id: string(args.debug_log_id),
        debug_log_file_id: string(args.debug_log_file_id),
        index: int(args.index),
        has_more: Boolean(args.has_more),
        error: args.error ? string(args.error) : null,
        ltime: stringifyTstamp(args.tstamp),
        tstamp: int(args.tstamp),
      }
      this._eventListeners.debugLogFilePrepared(ev)
    }
  },
  DatabaseTaskEnded(args) {
    if (args && args.database_task_id) {
      if (
        typeof this._databaseTaskTable[args.database_task_id] === 'function'
      ) {
        this._databaseTaskTable[args.database_task_id]()
        delete this._databaseTaskTable[args.database_task_id]
      } else {
        this._databaseTaskTable[args.database_task_id] = 'DATABASETASKENDED'
      }
    }
  },
  keepalive(args) {
    // ping reply OK
  },
  handler(method, args) {
    this._logger.log('warn', 'Not implemented: ChatClient.' + method)
  },

  /*
   * Private constants
   */
  SIGN_IN_TIMEOUT_DEFAULT: 30000,
  PHONE_REGISTER_TIMEOUT_DEFAULT: 30000,
  KEEP_ALIVE_TIMEOUT: 38000,
  PING_INTERVAL: 13000,
  CHECK_ALIVE_INTERVAL: 4000,
  UPLOAD_TIMEOUT_DEFAULT: 30000,
  CONFTYPE_USERCHATCONF: 'userchatconf',
  CONFTYPE_WEBCHAT: 'webchat',
  CONF_EXPIRES: 3600,
  MAKE_CALL_TIMEOUT_DEFAULT: 10000,
  PREFIX_CONFERENCE_EXTENSION: 'uc',
  VIDEO_CONF_AUDIO: 3,
  VIDEO_CONF_VIDEO: 7,
  DUMMY: null,
}

/*
 * Utility functions
 */
var int = function (value) {
  return parseInt(value, 10) || 0
}
var string = function (value) {
  return String(value || value === 0 || value === false ? value : '')
}
var stringifyDate = function (date) {
  return (
    date.getFullYear() +
    '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + date.getDate()).slice(-2) +
    ' ' +
    ('0' + date.getHours()).slice(-2) +
    ':' +
    ('0' + date.getMinutes()).slice(-2) +
    ':' +
    ('0' + date.getSeconds()).slice(-2)
  )
}
var stringifyTstamp = function (tstamp) {
  return stringifyDate(new Date(int(tstamp)))
}

var reportConsoleInfo = null
var ReportConsole = function (options) {
  if (reportConsoleInfo) {
    return
  }
  reportConsoleInfo = {
    report_console: string(options && options.report_console),
    report_console_guest: string(options && options.report_console_guest),
    report_console_methods: string(options && options.report_console_methods),
    report_console_pw: string(options && options.report_console_pw),
    report_console_pw2: string(options && options.report_console_pw2),
    report_console_url: string(options && options.report_console_url),
    report_console_ptn: string(options && options.report_console_ptn) || '/lds',
    myid: string(options && options.myid),
    expires: int(options && options.expires),
    signedIn: false, // anonymous (only on login screen)
    signedInAuth: false,
    report_console_queue_size: int(
      (options && options.report_console_queue_size) || 500,
    ),
    report_console_interval: int(
      (options && options.report_console_interval) || 100,
    ),
    report_console_expiry: int(
      (options && options.report_console_expiry) || 86400000,
    ),
    report_console_categories:
      options && typeof options.report_console_categories === 'string'
        ? options.report_console_categories
        : 'error,warn,info,log,debug,trace',
    report_console_mode:
      options && typeof options.report_console_mode === 'string'
        ? options.report_console_mode
        : 'login,jssip',
  }
  if (!reportConsoleInfo.expires) {
    reportConsoleInfo.expires =
      new Date().getTime() + reportConsoleInfo.report_console_expiry
  }
  var queue = []
  var overflowed = false
  var output = function () {
    var expired =
      int(reportConsoleInfo && reportConsoleInfo.expires) < new Date().getTime()
    if (
      reportConsoleInfo &&
      (reportConsoleInfo.signedIn || reportConsoleInfo.signedInAuth) &&
      queue.length > 0 &&
      reportConsoleInfo.report_console_url &&
      (!expired || reportConsoleInfo.report_console_pw2)
    ) {
      if (reportConsoleInfo.myid) {
        var data =
          '\n' + reportConsoleInfo.myid + (overflowed ? '\noverflowed' : '')
        var categories = string(reportConsoleInfo.report_console_methods).split(
          ',',
        )
        data += queue.reduce(function (accumulator, currentValue) {
          if (categories.indexOf(currentValue.category) >= 0) {
            return accumulator + '\n' + currentValue.message
          } else {
            return accumulator
          }
        }, '')
        var xhr = new XMLHttpRequest()
        xhr.open(
          'POST',
          reportConsoleInfo.report_console_url +
            reportConsoleInfo.report_console_ptn,
        )
        xhr.setRequestHeader(
          'Content-Type',
          'application/x-www-form-urlencoded',
        )
        var body =
          'pw=' +
          encodeURIComponent(reportConsoleInfo.report_console_pw) +
          '&data=' +
          encodeURIComponent(encodeURIComponent(data))
        if (expired) {
          body += '&renew=' + reportConsoleInfo.report_console_pw2
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var pws = string(xhr.responseText).split(',')
                if (reportConsoleInfo && pws[0] && pws[1]) {
                  reportConsoleInfo.report_console_pw = pws[0]
                  reportConsoleInfo.report_console_pw2 = pws[1]
                  reportConsoleInfo.expires =
                    new Date().getTime() +
                    reportConsoleInfo.report_console_expiry / 2
                }
              }
            }
          }
        }
        xhr.send(body)
      }
      queue.length = 0
      overflowed = false
    }
  }
  var timer = null
  var toHack = []
  // override console[category]
  reportConsoleInfo.report_console_categories
    .split(',')
    .forEach(function (category) {
      if (typeof console[category] === 'function') {
        var orgFunc = console[category]
        console[category] = function () {
          orgFunc.apply(console, arguments)
          var msg = arguments[0]
          if (arguments.length >= 2) {
            try {
              msg = Array.prototype.reduce.call(
                arguments,
                function (accumulator, currentValue) {
                  if (accumulator) {
                    accumulator += '\n |||\n'
                  }
                  accumulator += currentValue
                  if (typeof currentValue === 'object') {
                    try {
                      accumulator += JSON.stringify(currentValue)
                    } catch (e) {}
                  }
                  return accumulator
                },
                '',
              )
            } catch (e) {}
          }
          var now = new Date()
          queue.push({
            category,
            message:
              '(' +
              ('0' + now.getHours()).slice(-2) +
              ('0' + now.getMinutes()).slice(-2) +
              ('0' + now.getSeconds()).slice(-2) +
              '.' +
              ('00' + now.getMilliseconds()).slice(-3) +
              ')' +
              category[0] +
              msg,
          })
          if (queue.length > reportConsoleInfo.report_console_queue_size) {
            queue.shift()
            overflowed = true
          }
          if (!timer) {
            timer = setInterval(
              output,
              reportConsoleInfo.report_console_interval,
            )
          }
          toHack = toHack.filter(function (f) {
            return f()
          })
        }
      }
    })
  // get pw for dumping logs of login screen
  if (
    reportConsoleInfo.report_console_mode.split(',').indexOf('login') != -1 &&
    reportConsoleInfo.report_console_url
  ) {
    var xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      reportConsoleInfo.report_console_url +
        reportConsoleInfo.report_console_ptn,
    )
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    var body = 'anonymous=true'
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var newReportConsoleInfo = JSON.parse(xhr.responseText)
            Object.keys(reportConsoleInfo).forEach(function (key) {
              if (
                typeof reportConsoleInfo[key] ===
                typeof newReportConsoleInfo[key]
              ) {
                reportConsoleInfo[key] = newReportConsoleInfo[key]
              }
            })
          } catch (e) {}
        }
      }
    }
    xhr.send(body)
  }
  // hack jssip (after jssip loaded)
  if (reportConsoleInfo.report_console_mode.split(',').indexOf('jssip') != -1) {
    toHack.push(function () {
      if (
        typeof JsSIP !== 'undefined' &&
        JsSIP.debug &&
        JsSIP.debug.instances &&
        JsSIP.debug.instances.length
      ) {
        Array.prototype.forEach.call(
          JsSIP.debug.instances,
          function (debug_instance) {
            if (debug_instance && debug_instance.useColors) {
              debug_instance.useColors = false
            }
          },
        )
        return false
      } else {
        return true
      }
    })
  }
  toHack = toHack.filter(function (f) {
    return f()
  })
}

var CryptoJS = (function () {
  /**
     * @license
/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
  var CryptoJS =
    CryptoJS ||
    (function (s, p) {
      var m = {}
      var l = (m.lib = {})
      var n = function () {}
      var r = (l.Base = {
        extend(b) {
          n.prototype = this
          var h = new n()
          b && h.mixIn(b)
          h.hasOwnProperty('init') ||
            (h.init = function () {
              h.$super.init.apply(this, arguments)
            })
          h.init.prototype = h
          h.$super = this
          return h
        },
        create() {
          var b = this.extend()
          b.init.apply(b, arguments)
          return b
        },
        init() {},
        mixIn(b) {
          for (var h in b) {
            b.hasOwnProperty(h) && (this[h] = b[h])
          }
          b.hasOwnProperty('toString') && (this.toString = b.toString)
        },
        clone() {
          return this.init.prototype.extend(this)
        },
      })
      var q = (l.WordArray = r.extend({
        init(b, h) {
          b = this.words = b || []
          this.sigBytes = h != p ? h : 4 * b.length
        },
        toString(b) {
          return (b || t).stringify(this)
        },
        concat(b) {
          var h = this.words
          var a = b.words
          var j = this.sigBytes
          b = b.sigBytes
          this.clamp()
          if (j % 4) {
            for (var g = 0; g < b; g++) {
              h[(j + g) >>> 2] |=
                ((a[g >>> 2] >>> (24 - 8 * (g % 4))) & 255) <<
                (24 - 8 * ((j + g) % 4))
            }
          } else if (65535 < a.length) {
            for (g = 0; g < b; g += 4) {
              h[(j + g) >>> 2] = a[g >>> 2]
            }
          } else {
            h.push.apply(h, a)
          }
          this.sigBytes += b
          return this
        },
        clamp() {
          var b = this.words
          var h = this.sigBytes
          b[h >>> 2] &= 4294967295 << (32 - 8 * (h % 4))
          b.length = s.ceil(h / 4)
        },
        clone() {
          var b = r.clone.call(this)
          b.words = this.words.slice(0)
          return b
        },
        random(b) {
          for (var h = [], a = 0; a < b; a += 4) {
            h.push((4294967296 * s.random()) | 0)
          }
          return new q.init(h, b)
        },
      }))
      var v = (m.enc = {})
      var t = (v.Hex = {
        stringify(b) {
          var a = b.words
          b = b.sigBytes
          for (var g = [], j = 0; j < b; j++) {
            var k = (a[j >>> 2] >>> (24 - 8 * (j % 4))) & 255
            g.push((k >>> 4).toString(16))
            g.push((k & 15).toString(16))
          }
          return g.join('')
        },
        parse(b) {
          for (var a = b.length, g = [], j = 0; j < a; j += 2) {
            g[j >>> 3] |= parseInt(b.substr(j, 2), 16) << (24 - 4 * (j % 8))
          }
          return new q.init(g, a / 2)
        },
      })
      var a = (v.Latin1 = {
        stringify(b) {
          var a = b.words
          b = b.sigBytes
          for (var g = [], j = 0; j < b; j++) {
            g.push(
              String.fromCharCode((a[j >>> 2] >>> (24 - 8 * (j % 4))) & 255),
            )
          }
          return g.join('')
        },
        parse(b) {
          for (var a = b.length, g = [], j = 0; j < a; j++) {
            g[j >>> 2] |= (b.charCodeAt(j) & 255) << (24 - 8 * (j % 4))
          }
          return new q.init(g, a)
        },
      })
      var u = (v.Utf8 = {
        stringify(b) {
          try {
            return decodeURIComponent(escape(a.stringify(b)))
          } catch (g) {
            throw Error('Malformed UTF-8 data')
          }
        },
        parse(b) {
          return a.parse(unescape(encodeURIComponent(b)))
        },
      })
      var g = (l.BufferedBlockAlgorithm = r.extend({
        reset() {
          this._data = new q.init()
          this._nDataBytes = 0
        },
        _append(b) {
          'string' == typeof b && (b = u.parse(b))
          this._data.concat(b)
          this._nDataBytes += b.sigBytes
        },
        _process(b) {
          var a = this._data
          var g = a.words
          var j = a.sigBytes
          var k = this.blockSize
          var m = j / (4 * k)
          var m = b ? s.ceil(m) : s.max((m | 0) - this._minBufferSize, 0)
          b = m * k
          j = s.min(4 * b, j)
          if (b) {
            for (var l = 0; l < b; l += k) {
              this._doProcessBlock(g, l)
            }
            l = g.splice(0, b)
            a.sigBytes -= j
          }
          return new q.init(l, j)
        },
        clone() {
          var b = r.clone.call(this)
          b._data = this._data.clone()
          return b
        },
        _minBufferSize: 0,
      }))
      l.Hasher = g.extend({
        cfg: r.extend(),
        init(b) {
          this.cfg = this.cfg.extend(b)
          this.reset()
        },
        reset() {
          g.reset.call(this)
          this._doReset()
        },
        update(b) {
          this._append(b)
          this._process()
          return this
        },
        finalize(b) {
          b && this._append(b)
          return this._doFinalize()
        },
        blockSize: 16,
        _createHelper(b) {
          return function (a, g) {
            return new b.init(g).finalize(a)
          }
        },
        _createHmacHelper(b) {
          return function (a, g) {
            return new k.HMAC.init(b, g).finalize(a)
          }
        },
      })
      var k = (m.algo = {})
      return m
    })(Math)
  ;(function (s) {
    function p(a, k, b, h, l, j, m) {
      a = a + ((k & b) | (~k & h)) + l + m
      return ((a << j) | (a >>> (32 - j))) + k
    }
    function m(a, k, b, h, l, j, m) {
      a = a + ((k & h) | (b & ~h)) + l + m
      return ((a << j) | (a >>> (32 - j))) + k
    }
    function l(a, k, b, h, l, j, m) {
      a = a + (k ^ b ^ h) + l + m
      return ((a << j) | (a >>> (32 - j))) + k
    }
    function n(a, k, b, h, l, j, m) {
      a = a + (b ^ (k | ~h)) + l + m
      return ((a << j) | (a >>> (32 - j))) + k
    }
    for (
      var r = CryptoJS,
        q = r.lib,
        v = q.WordArray,
        t = q.Hasher,
        q = r.algo,
        a = [],
        u = 0;
      64 > u;
      u++
    ) {
      a[u] = (4294967296 * s.abs(s.sin(u + 1))) | 0
    }
    q = q.MD5 = t.extend({
      _doReset() {
        this._hash = new v.init([1732584193, 4023233417, 2562383102, 271733878])
      },
      _doProcessBlock(g, k) {
        for (var b = 0; 16 > b; b++) {
          var h = k + b
          var w = g[h]
          g[h] =
            (((w << 8) | (w >>> 24)) & 16711935) |
            (((w << 24) | (w >>> 8)) & 4278255360)
        }
        var b = this._hash.words
        var h = g[k + 0]
        var w = g[k + 1]
        var j = g[k + 2]
        var q = g[k + 3]
        var r = g[k + 4]
        var s = g[k + 5]
        var t = g[k + 6]
        var u = g[k + 7]
        var v = g[k + 8]
        var x = g[k + 9]
        var y = g[k + 10]
        var z = g[k + 11]
        var A = g[k + 12]
        var B = g[k + 13]
        var C = g[k + 14]
        var D = g[k + 15]
        var c = b[0]
        var d = b[1]
        var e = b[2]
        var f = b[3]
        var c = p(c, d, e, f, h, 7, a[0])
        var f = p(f, c, d, e, w, 12, a[1])
        var e = p(e, f, c, d, j, 17, a[2])
        var d = p(d, e, f, c, q, 22, a[3])
        var c = p(c, d, e, f, r, 7, a[4])
        var f = p(f, c, d, e, s, 12, a[5])
        var e = p(e, f, c, d, t, 17, a[6])
        var d = p(d, e, f, c, u, 22, a[7])
        var c = p(c, d, e, f, v, 7, a[8])
        var f = p(f, c, d, e, x, 12, a[9])
        var e = p(e, f, c, d, y, 17, a[10])
        var d = p(d, e, f, c, z, 22, a[11])
        var c = p(c, d, e, f, A, 7, a[12])
        var f = p(f, c, d, e, B, 12, a[13])
        var e = p(e, f, c, d, C, 17, a[14])
        var d = p(d, e, f, c, D, 22, a[15])
        var c = m(c, d, e, f, w, 5, a[16])
        var f = m(f, c, d, e, t, 9, a[17])
        var e = m(e, f, c, d, z, 14, a[18])
        var d = m(d, e, f, c, h, 20, a[19])
        var c = m(c, d, e, f, s, 5, a[20])
        var f = m(f, c, d, e, y, 9, a[21])
        var e = m(e, f, c, d, D, 14, a[22])
        var d = m(d, e, f, c, r, 20, a[23])
        var c = m(c, d, e, f, x, 5, a[24])
        var f = m(f, c, d, e, C, 9, a[25])
        var e = m(e, f, c, d, q, 14, a[26])
        var d = m(d, e, f, c, v, 20, a[27])
        var c = m(c, d, e, f, B, 5, a[28])
        var f = m(f, c, d, e, j, 9, a[29])
        var e = m(e, f, c, d, u, 14, a[30])
        var d = m(d, e, f, c, A, 20, a[31])
        var c = l(c, d, e, f, s, 4, a[32])
        var f = l(f, c, d, e, v, 11, a[33])
        var e = l(e, f, c, d, z, 16, a[34])
        var d = l(d, e, f, c, C, 23, a[35])
        var c = l(c, d, e, f, w, 4, a[36])
        var f = l(f, c, d, e, r, 11, a[37])
        var e = l(e, f, c, d, u, 16, a[38])
        var d = l(d, e, f, c, y, 23, a[39])
        var c = l(c, d, e, f, B, 4, a[40])
        var f = l(f, c, d, e, h, 11, a[41])
        var e = l(e, f, c, d, q, 16, a[42])
        var d = l(d, e, f, c, t, 23, a[43])
        var c = l(c, d, e, f, x, 4, a[44])
        var f = l(f, c, d, e, A, 11, a[45])
        var e = l(e, f, c, d, D, 16, a[46])
        var d = l(d, e, f, c, j, 23, a[47])
        var c = n(c, d, e, f, h, 6, a[48])
        var f = n(f, c, d, e, u, 10, a[49])
        var e = n(e, f, c, d, C, 15, a[50])
        var d = n(d, e, f, c, s, 21, a[51])
        var c = n(c, d, e, f, A, 6, a[52])
        var f = n(f, c, d, e, q, 10, a[53])
        var e = n(e, f, c, d, y, 15, a[54])
        var d = n(d, e, f, c, w, 21, a[55])
        var c = n(c, d, e, f, v, 6, a[56])
        var f = n(f, c, d, e, D, 10, a[57])
        var e = n(e, f, c, d, t, 15, a[58])
        var d = n(d, e, f, c, B, 21, a[59])
        var c = n(c, d, e, f, r, 6, a[60])
        var f = n(f, c, d, e, z, 10, a[61])
        var e = n(e, f, c, d, j, 15, a[62])
        var d = n(d, e, f, c, x, 21, a[63])
        b[0] = (b[0] + c) | 0
        b[1] = (b[1] + d) | 0
        b[2] = (b[2] + e) | 0
        b[3] = (b[3] + f) | 0
      },
      _doFinalize() {
        var a = this._data
        var k = a.words
        var b = 8 * this._nDataBytes
        var h = 8 * a.sigBytes
        k[h >>> 5] |= 128 << (24 - (h % 32))
        var l = s.floor(b / 4294967296)
        k[(((h + 64) >>> 9) << 4) + 15] =
          (((l << 8) | (l >>> 24)) & 16711935) |
          (((l << 24) | (l >>> 8)) & 4278255360)
        k[(((h + 64) >>> 9) << 4) + 14] =
          (((b << 8) | (b >>> 24)) & 16711935) |
          (((b << 24) | (b >>> 8)) & 4278255360)
        a.sigBytes = 4 * (k.length + 1)
        this._process()
        a = this._hash
        k = a.words
        for (b = 0; 4 > b; b++) {
          ;(h = k[b]),
            (k[b] =
              (((h << 8) | (h >>> 24)) & 16711935) |
              (((h << 24) | (h >>> 8)) & 4278255360))
        }
        return a
      },
      clone() {
        var a = t.clone.call(this)
        a._hash = this._hash.clone()
        return a
      },
    })
    r.MD5 = t._createHelper(q)
    r.HmacMD5 = t._createHmacHelper(q)
  })(Math)
  return CryptoJS
})()

UCClient.ChatClient = ChatClient
UCClient.Errors = Errors
UCClient.Constants = Constants
UCClient.Events = Events
UCClient.ReportConsole = ReportConsole
UCClient.CryptoJS = CryptoJS

/*
 * Class Brekeke.UCClient.Logger
 */
var Logger

/*
 * Logger constructor
 */
Logger = function (level, func, withStackTrace) {
  var self = this

  /*
   * Private fields
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

/*
 * Logger prototype
 */
Logger.prototype = {
  /*
   * Function setLoggerLevel
   */
  setLoggerLevel(level) {
    this._levelValue =
      level in this.LEVEL_VALUES
        ? this.LEVEL_VALUES[level]
        : this.LEVEL_VALUES['log']
  },

  /*
   * Function setLogFunction
   */
  setLogFunction(func) {
    this._logFunction = func
  },

  /*
   * Function log
   */
  log(level, content) {
    var stackTrace = ''
    var date = new Date()

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
            stackTrace = ' @ ' + stackTrace.substr(this._stackTraceHeaderLength)
          } else {
            // failed to initialize stackTraceHeaderLength
            // print full stack trace
            stackTrace = ' : ' + stackTrace
          }
        }
        this.outputLog(level, content, stackTrace, date)
      }
    } catch (e) {}
  },

  /*
   * Function outputLog
   */
  outputLog(level, content, stackTrace, date) {
    try {
      if (this._logFunction) {
        if (!this._logFunction(level, content, stackTrace, date)) {
          this._logFunctionDefault(level, content, stackTrace, date)
        }
      } else {
        this._logFunctionDefault(level, content, stackTrace, date)
      }
    } catch (e) {}
  },

  /*
   * Private functions
   */
  _logFunctionDefault(level, content, stackTrace, date) {
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
        func = console.debug || console.log
      } else if (level === 'trace') {
        func = console.debug || console.log
      } else {
        func = console.log
      }
      if (func) {
        if (typeof content === 'object') {
          try {
            content += JSON.stringify(content) // output both toString (for Exception) and JSON.stringify (for JSON-RPC)
          } catch (e) {}
        }
        func.call(console, date + ' [' + level + '] ' + content + stackTrace)
      }
    }
  },

  /*
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
  DUMMY: null,
}

UCClient.Logger = Logger

module.exports = UCClient
