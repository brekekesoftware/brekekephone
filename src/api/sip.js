import 'brekekejs/lib/jsonrpc';
import 'brekekejs/lib/webrtcclient';

import EventEmitter from 'eventemitter3';
import { Platform } from 'react-native';

import getFrontCameraSourceId from './getFrontCameraSourceId';
import turnConfig from './turnConfig';

class SIP extends EventEmitter {
  init = async () => {
    const sourceId = await getFrontCameraSourceId();
    this.phone = new window.Brekeke.WebrtcClient.Phone({
      logLevel: `all`,
      multiSession: true,
      defaultOptions: {
        videoOptions: {
          call: {
            mediaConstraints: {
              audio: false,
              video: {
                mandatory: {
                  minWidth: 0,
                  minHeight: 0,
                  minFrameRate: 0,
                },
                facingMode: Platform.OS === `web` ? undefined : `user`,
                optional: sourceId
                  ? [
                      {
                        sourceId,
                      },
                    ]
                  : [],
              },
            },
          },
          answer: {
            mediaConstraints: {
              audio: false,
              video: {
                mandatory: {
                  minWidth: 0,
                  minHeight: 0,
                  minFrameRate: 0,
                },
                facingMode: Platform.OS === `web` ? undefined : `user`,
                optional: sourceId
                  ? [
                      {
                        sourceId,
                      },
                    ]
                  : [],
              },
            },
          },
        },
      },
      dtmfSendMode: 1,
      ctiAutoAnswer: true,
      eventTalk: true,
    });
    this.phone.dtmfSendMode = 1;
    this.phone.ctiAutoAnswer = true;
    this.phone.eventTalk = true;

    this.phone.addEventListener(`phoneStatusChanged`, ev => {
      if (!ev) {
        return;
      }
      if (ev.phoneStatus === `started`) {
        return this.emit(`connection-started`);
      }
      if (ev.phoneStatus === `stopped`) {
        return this.emit(`connection-stopped`);
      }
    });

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
    this.phone.addEventListener(`sessionCreated`, ev => {
      if (!ev) {
        return;
      }
      this.emit(`session-started`, {
        id: ev.sessionId,
        incoming: ev.rtcSession.direction === `incoming`,
        partyNumber: ev.rtcSession.remote_identity.uri.user,
        partyName: ev.rtcSession.remote_identity.display_name,
        remoteVideoEnabled: ev.remoteWithVideo,
        localVideoEnabled: ev.withVideo,
      });
    });
    this.phone.addEventListener(`sessionStatusChanged`, ev => {
      if (!ev) {
        return;
      }
      if (ev.sessionStatus === `terminated`) {
        return this.emit(`session-stopped`, ev.sessionId);
      }
      const patch = {
        id: ev.sessionId,
        answered: ev.sessionStatus === `connected`,
        voiceStreamObject: ev.remoteStreamObject,
        localVideoEnabled: ev.withVideo,
        remoteVideoEnabled: ev.remoteWithVideo,
      };
      if (ev.incomingMessage) {
        const pbxSessionInfo = ev.incomingMessage.getHeader(
          `X-PBX-Session-Info`,
        );
        if (typeof pbxSessionInfo === `string`) {
          const infos = pbxSessionInfo.split(`;`);
          patch.pbxTenant = infos[0];
          patch.pbxRoomId = infos[1];
          patch.pbxTalkerId = infos[2];
          patch.pbxUsername = infos[3];
        }
      }
      this.emit(`session-updated`, patch);
    });

    this.phone.addEventListener(`videoClientSessionCreated`, ev => {
      if (!ev) {
        return;
      }
      const session = this.phone.getSession(ev.sessionId);
      const videoSession =
        session.videoClientSessionTable[ev.videoClientSessionId];
      this.emit(`session-updated`, {
        id: ev.sessionId,
        videoSessionId: ev.videoClientSessionId,
        remoteVideoEnabled: true,
        remoteVideoStreamObject: videoSession.remoteStreamObject,
      });
    });
    this.phone.addEventListener(`videoClientSessionEnded`, ev => {
      if (!ev) {
        return;
      }
      this.emit(`session-updated`, {
        id: ev.sessionId,
        videoSessionId: ev.videoClientSessionId,
        remoteVideoEnabled: false,
        remoteVideoStreamObject: null,
      });
    });

    this.phone.addEventListener(`rtcErrorOccurred`, ev => {
      console.error(`sip.phone.rtcErrorOccurred:`, ev); // TODO
    });

    this._makeCallOptionsForAndoirOrIos = {
      rtcOfferConstraints: {
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: false,
          _____SKIP_Adapter_fixRTCOfferOptions_____: true,
        },
        optional: [],
      },
    };
  };

  connect(profile) {
    //
    let platformOs = Platform.OS;
    if (platformOs === `ios`) {
      platformOs = `iOS`;
    } else if (platformOs === `android`) {
      platformOs = `Android`;
    } else if (platformOs === `web`) {
      platformOs = `Web`;
    }
    //
    const jssipVersion = `3.2.15`;
    const appPackageJson = require(`../../package.json`);
    const appVersion = appPackageJson.version;
    const lUseragent =
      `Brekeke Phone for ` +
      platformOs +
      ` ` +
      appVersion +
      `/JsSIP ` +
      jssipVersion;
    //
    const config = profile.pbxTurnEnabled ? turnConfig : {};
    if (!config.pcConfig) {
      config.pcConfig = {};
    }
    if (!Array.isArray(config.pcConfig.iceServers)) {
      config.pcConfig.iceServers = [];
    }
    config.pcConfig.bundlePolicy = `balanced`;
    this.phone.setDefaultCallOptions(config);
    //
    this.phone.startWebRTC({
      host: profile.hostname,
      port: profile.port,
      tls: true,
      tenant: profile.tenant,
      user: profile.username,
      password: profile.password,
      auth: profile.accessToken,
      useVideoClient: true,
      userAgent: lUseragent,
    });
  }

  disconnect() {
    this.phone.stopWebRTC();
  }

  createSession(number, opts = {}) {
    const options =
      Platform.OS === `android` || Platform.OS === `ios`
        ? this._makeCallOptionsForAndoirOrIos
        : null;
    this.phone.makeCall(number, options, opts.videoEnabled, undefined, ``);
  }

  hangupSession(sessionId) {
    const session = this.phone.getSession(sessionId);
    const rtcSession = session && session.rtcSession;
    rtcSession && rtcSession.terminate();
  }
  answerSession(sessionId, opts = {}) {
    this.phone.answer(sessionId, null, opts.videoEnabled);
  }
  sendDTMF(dtmf, sessionId) {
    this.phone.sendDTMF(dtmf, sessionId);
  }
  enableVideo(sessionId) {
    this.phone.setWithVideo(sessionId, true);
  }
  disableVideo(sessionId) {
    this.phone.setWithVideo(sessionId, false);
  }
  setMuted(muted, sessionId) {
    this.phone.setMuted({ main: muted }, sessionId);
  }
}

const sip = new SIP();
sip.init();
export default sip;
