import { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from 'redux-model';
import createId from 'shortid';
import pbx from './pbx';
import sip from './sip';
import uc from './uc';
import FCM, { FCMEvent } from 'react-native-fcm';
import subscribePn from '../util/subscribe-pn';
import fmtKey from '../util/uint8ArrayToUrlBase64';
import { Platform } from 'react-native';
import { getApnsToken } from '../push-notification/apns';
import SplashScreen from 'react-native-splash-screen';

let API_PROVIDER = null;

const mapGetter = getter => state => ({
  profile: getter.auth.profile(state),
  userExtensionProperties: getter.auth.userExtensionProperties(state),
  runningCallById: getter.runningCalls.detailMapById(state),
  pbxUserById: getter.pbxUsers.detailMapById(state),
});

const mapAction = action => emit => ({
  onPBXConnectionTimeout() {},
  onPBXConnectionStopped() {
    emit(action.auth.pbx.onStopped());
  },
  onSIPConnectionStarted() {
    emit(action.auth.sip.onSuccess());
    if (Platform.OS === 'ios') {
      const device_id = getApnsToken();
      if (!device_id) {
        return;
      }
      pbx.endpoint
        .apns({
          username: this.userExtensionProperties.phones[3].id,
          device_id,
        })
        .then(res => {
          console.log('Add apns token to pbx successfully', res);
        })
        .catch(err => {
          console.error('Can not add apns token to pbx', err);
        });
    } else {
      this.registerFcm();
    }
  },

  registerFcm() {
    FCM.createNotificationChannel({
      id: 'default',
      name: 'Default',
      description: 'default desc',
      priority: 'high',
    });

    const webPhoneId = this.userExtensionProperties.phones[3].id;

    if (Platform.OS === 'web') {
      setTimeout(async () => {
        try {
          const sub = await subscribePn();
          await pbx.endpoint.web({
            id: sub.endpoint,
            user: webPhoneId,
            app: '22177122297',
            p256dh: fmtKey(sub.getKey('p256dh')),
            auth: fmtKey(sub.getKey('auth')),
          });
        } catch (err) {
          console.log(err);
        }
      }, 100);
    } else if (Platform.OS === 'android') {
      setTimeout(async () => {
        try {
          const deviceToken = await FCM.getFCMToken();
          await pbx.endpoint.fcm({
            user: webPhoneId,
            app: '22177122297',
            device: deviceToken,
          });

          try {
            await FCM.requestPermissions({
              badge: false,
              sound: true,
              alert: true,
            });
          } catch (e) {
            console.error(e);
          }

          FCM.getFCMToken().then(token => {});

          if (Platform.OS === 'ios') {
            FCM.getAPNSToken().then(token => {});
          }

          API_PROVIDER._refreshTokenListener = FCM.on(
            FCMEvent.RefreshToken,
            token => {},
          );

          FCM.enableDirectChannel();
          API_PROVIDER._directChannelConnectionChangedListener = FCM.on(
            FCMEvent.DirectChannelConnectionChanged,
            data => {},
          );
        } catch (err) {
          console.error(err);
        }
      }, 100);
    }
  },

  componentWillUnmount() {
    if (this._refreshTokenListener) {
      this._refreshTokenListener.remove();
    }
    if (this._directChannelConnectionChangedListener) {
      this._directChannelConnectionChangedListener.remove();
    }
    if (this._directChannelConnectionChangedListener) {
      this._directChannelConnectionChangedListener.remove();
    }
  },

  onSIPConnectionStopped() {
    emit(action.auth.sip.onStopped());
  },
  onSIPConnectionTimeout() {
    emit(action.auth.sip.onStopped());
  },
  onUCConnectionStopped() {
    emit(action.auth.uc.onStopped());
  },
  onUCConnectionTimeout() {
    emit(action.auth.uc.onStopped());
  },
  createRunningCall(call) {
    emit(action.runningCalls.create(call));
  },
  updateRunningCall(call) {
    emit(action.runningCalls.update(call));
  },
  removeRunningCall(call) {
    emit(action.runningCalls.remove(call));
  },
  createRunningVideo(call) {
    emit(action.runningVideos.create(call));
  },
  updateRunningVideo(call) {
    emit(action.runningVideos.update(call));
  },
  removeRunningVideo(call) {
    emit(action.runningVideos.remove(call));
  },
  removeRunningVideoByCallid(callid) {
    emit(action.runningVideos.removeByCallid(callid));
  },
  createParkingCall(call) {
    emit(action.parkingCalls.create(call));
  },
  removeParkingCall(call) {
    emit(action.parkingCalls.remove(call));
  },
  fillPbxUsers(users) {
    emit(action.pbxUsers.refill(users));
  },
  setPBXUserTalkerCalling(user, talker) {
    emit(action.pbxUsers.setTalkerCalling(user, talker));
  },
  setPBXUserTalkerRinging(user, talker) {
    emit(action.pbxUsers.setTalkerRinging(user, talker));
  },
  setPBXUserTalkerTalking(user, talker) {
    emit(action.pbxUsers.setTalkerTalking(user, talker));
  },
  setPBXUserTalkerHolding(user, talker) {
    emit(action.pbxUsers.setTalkerHolding(user, talker));
  },
  setPBXUserTalkerHanging(user, talker) {
    emit(action.pbxUsers.setTalkerHanging(user, talker));
  },
  createRecentCall(call) {
    emit(action.recentCalls.create(call));
  },
  updateUcUser(user) {
    emit(action.ucUsers.update(user));
  },
  appendBuddyChat(buddy, chat) {
    emit(action.buddyChats.appendByBuddy(buddy, [chat]));
  },
  appendGroupChat(group, chat) {
    emit(action.groupChats.appendByGroup(group, [chat]));
  },
  createChatGroup(group) {
    emit(action.chatGroups.create(group));
  },
  updateChatGroup(group) {
    emit(action.chatGroups.update(group));
  },
  removeChatGroup(id) {
    emit(action.chatGroups.remove(id));
  },
  clearChatsByGroup(group) {
    emit(action.groupChats.clearByGroup(group));
  },
  createChatFile(file) {
    emit(action.chatFiles.create(file));
  },
  updateChatFile(file) {
    emit(action.chatFiles.update(file));
  },
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
});

class APIProvider extends Component {
  static childContextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
    uc: PropTypes.object.isRequired,
  };

  static defaultProps = {
    runningCallById: {},
    pbxUserById: {},
  };

  getChildContext() {
    return { pbx, sip, uc };
  }

  componentDidMount() {
    API_PROVIDER = this;
    SplashScreen.hide();
    pbx.on('connection-started', this.onPBXConnectionStarted);
    pbx.on('connection-stopped', this.onPBXConnectionStopped);
    pbx.on('connection-timeout', this.onPBXConnectionTimeout);

    pbx.on('park-started', this.onPBXParkStarted);
    pbx.on('park-stopped', this.onPBXParkStopped);

    pbx.on('user-calling', this.onPBXUserCalling);
    pbx.on('user-ringing', this.onPBXUserRinging);
    pbx.on('user-talking', this.onPBXUserTalking);
    pbx.on('user-holding', this.onPBXUserHolding);
    pbx.on('user-hanging', this.onPBXUserHanging);

    sip.on('connection-started', this.onSIPConnectionStarted);
    sip.on('connection-stopped', this.onSIPConnectionStopped);
    sip.on('connection-timeout', this.onSIPConnectionTimeout);

    sip.on('session-started', this.onSIPSessionStarted);
    sip.on('session-updated', this.onSIPSessionUpdated);
    sip.on('session-stopped', this.onSIPSessionStopped);

    sip.on('video-session-created', this.onSIPVideoSessionCreated);
    sip.on('video-session-updated', this.onSIPVideoSessionUpdated);
    sip.on('video-session-ended', this.onSIPVideoSessionEnded);

    uc.on('connection-stopped', this.onUCConnectionStopped);
    uc.on('user-updated', this.onUcUserUpdated);
    uc.on('buddy-chat-created', this.onBuddyChatCreated);
    uc.on('group-chat-created', this.onGroupChatCreated);
    uc.on('chat-group-invited', this.onChatGroupInvited);
    uc.on('chat-group-revoked', this.onChatGroupRevoked);
    uc.on('chat-group-updated', this.onChatGroupUpdated);
    uc.on('file-received', this.onFileReceived);
    uc.on('file-progress', this.onFileProgress);
    uc.on('file-finished', this.onFileFinished);
  }

  componentWillUnmount() {
    pbx.off('connection-started', this.onPBXConnectionStarted);
    pbx.off('connection-stopped', this.onPBXConnectionStopped);
    pbx.off('connection-timeout', this.onPBXConnectionTimeout);

    pbx.off('park-started', this.onPBXParkStarted);
    pbx.off('park-stopped', this.onPBXParkStopped);

    pbx.off('user-calling', this.onPBXUserCalling);
    pbx.off('user-ringing', this.onPBXUserRinging);
    pbx.off('user-talking', this.onPBXUserTalking);
    pbx.off('user-holding', this.onPBXUserHolding);
    pbx.off('user-hanging', this.onPBXUserHanging);

    sip.off('connection-started', this.onSIPConnectionStarted);
    sip.off('connection-stopped', this.onSIPConnectionStopped);
    sip.off('connection-timeout', this.onSIPConnectionTimeout);

    sip.off('session-started', this.onSIPSessionStarted);
    sip.off('session-updated', this.onSIPSessionUpdated);
    sip.off('session-stopped', this.onSIPSessionStopped);

    sip.off('video-session-created', this.onSIPVideoSessionCreated);
    sip.off('video-session-updated', this.onSIPVideoSessionUpdated);
    sip.off('video-session-ended', this.onSIPVideoSessionEnded);

    uc.off('connection-stopped', this.onUCConnectionStopped);
    uc.off('connection-timeout', this.onUCConnectionTimeout);
    uc.off('user-updated', this.onUcUserUpdated);
    uc.off('buddy-chat-created', this.onBuddyChatCreated);
    uc.off('group-chat-created', this.onGroupChatCreated);
    uc.off('chat-group-invited', this.onChatGroupInvited);
    uc.off('chat-group-revoked', this.onChatGroupRevoked);
    uc.off('chat-group-updated', this.onChatGroupUpdated);
    uc.off('file-received', this.onFileReceived);
    uc.off('file-progress', this.onFileProgress);
    uc.off('file-finished', this.onFileFinished);
  }

  onPBXConnectionStarted = () => {
    this.loadPbxUsers().catch(err => {
      this.props.showToast('Failed to load PBX users');
      console.error(err);
    });
  };

  onPBXConnectionStopped = () => {
    this.props.onPBXConnectionStopped();
  };

  onPBXConnectionTimeout = () => {
    this.props.onPBXConnectionTimeout();
  };

  async loadPbxUsers() {
    const { profile } = this.props;
    if (!profile) return;

    const tenant = profile.pbxTenant;
    const username = profile.pbxUsername;

    const userIds = await pbx
      .getUsers(tenant)
      .then(ids => ids.filter(id => id !== username));

    const users = await pbx.getOtherUsers(tenant, userIds);
    this.props.fillPbxUsers(users);
  }

  onPBXUserCalling = ev => {
    this.props.setPBXUserTalkerCalling(ev.user, ev.talker);
  };

  onPBXUserRinging = ev => {
    this.props.setPBXUserTalkerRinging(ev.user, ev.talker);
  };

  onPBXUserTalking = ev => {
    this.props.setPBXUserTalkerTalking(ev.user, ev.talker);
  };

  onPBXUserHolding = ev => {
    this.props.setPBXUserTalkerHolding(ev.user, ev.talker);
  };

  onPBXUserHanging = ev => {
    this.props.setPBXUserTalkerHanging(ev.user, ev.talker);
  };

  onPBXParkStarted = park => {
    this.props.createParkingCall(park);
  };

  onPBXParkStopped = park => {
    this.props.removeParkingCall(park);
  };

  onSIPConnectionStarted = () => {
    this.props.onSIPConnectionStarted();
  };

  onSIPConnectionStopped = () => {
    this.props.onSIPConnectionStopped();
  };

  onSIPConnectionTimeout = () => {
    this.props.onSIPConnectionTimeout();
  };

  onSIPSessionStarted = call => {
    const number = call.partyNumber;

    if (number === '8') {
      call.partyName = 'Voicemails';
    }

    if (!call.partyName) {
      const { pbxUserById } = this.props;
      const pbxUser = pbxUserById[number];
      call.partyName = pbxUser ? pbxUser.name : 'Unnamed';
    }

    this.props.createRunningCall(call);
  };

  onSIPSessionUpdated = call => {
    this.props.updateRunningCall(call);
  };

  onSIPSessionStopped = id => {
    const call = this.props.runningCallById[id];

    this.props.createRecentCall({
      id: createId(),
      incoming: call.incoming,
      answered: call.answered,
      partyName: call.partyName,
      partyNumber: call.partyNumber,
      profile: this.props.profile.id,
      created: Date.now(),
    });
    this.props.removeRunningCall(call.id);
    this.props.removeRunningVideoByCallid(call.id);
  };

  onUCConnectionStopped = () => {
    this.props.onUCConnectionStopped();
  };

  onUCConnectionTimeout = () => {
    this.props.onUCConnectionTimeout();
  };

  onUcUserUpdated = ev => {
    this.props.updateUcUser(ev);
  };

  onBuddyChatCreated = chat => {
    this.props.appendBuddyChat(chat.creator, chat);
  };

  onGroupChatCreated = chat => {
    this.props.appendGroupChat(chat.group, chat);
  };

  onChatGroupInvited = group => {
    this.props.createChatGroup(group);
  };

  onChatGroupUpdated = group => {
    this.props.updateChatGroup(group);
  };

  onChatGroupRevoked = group => {
    this.props.removeChatGroup(group.id);
    this.props.clearChatsByGroup(group.id);
  };

  onFileReceived = file => {
    this.props.createChatFile(file);
  };

  onFileProgress = file => {
    this.props.updateChatFile(file);
  };

  onFileFinished = file => {
    this.props.updateChatFile(file);
  };

  onSIPVideoSessionCreated = ev => {
    this.props.createRunningVideo(ev);
  };

  onSIPVideoSessionUpdated = ev => {
    this.props.updateRunningVideo(ev);
  };

  onSIPVideoSessionEnded = ev => {
    this.props.removeRunningVideo(ev);
  };

  render() {
    return this.props.children;
  }
}

export default createModelView(mapGetter, mapAction)(APIProvider);
