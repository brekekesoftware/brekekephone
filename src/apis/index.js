import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import authStore from '../mobx/authStore';
import chatStore from '../mobx/chatStore';
import contactStore from '../mobx/contactStore';
import routerStore from '../mobx/routerStore';
import Alert from '../shared/Alert';
import { getPushNotificationToken } from '../shared/pushNotification';
import toast from '../shared/Toast';
import { setApiProvider } from './getApiProvider';
import pbx from './pbx';
import sip from './sip';
import uc from './uc';

@observer
@createModelView(
  getter => state => ({
    runningCallById: getter.runningCalls.detailMapById(state),
  }),
  action => emit => ({
    onPBXConnectionStopped() {
      // authStore.set('pbxState', 'stopped');
    },
    onPBXConnectionTimeout() {
      authStore.set('pbxState', 'failure');
    },
    //
    onSIPConnectionStarted() {
      authStore.set('sipState', 'success');
    },
    onSIPConnectionStopped() {
      // authStore.set('sipState', 'stopped');
    },
    onSIPConnectionTimeout() {
      authStore.set('sipState', 'failure');
    },
    //
    onUCConnectionStopped() {
      // authStore.set('ucState', 'stopped');
    },
    onUCConnectionTimeout() {
      authStore.set('ucState', 'failure');
    },
    //
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
    createRecentCall(call) {
      emit(action.recentCalls.create(call));
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
  }),
)
@observer
class ApiProvider extends React.Component {
  static childContextTypes = {
    pbx: PropTypes.object.isRequired,
    sip: PropTypes.object.isRequired,
    uc: PropTypes.object.isRequired,
  };

  static defaultProps = {
    runningCallById: {},
  };

  getChildContext() {
    return {
      pbx,
      sip,
      uc,
    };
  }

  componentDidMount() {
    if (Platform.OS !== 'web') {
      SplashScreen.hide();
    }

    setApiProvider(this);
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
    uc.on('user-updated', this.onUCUserUpdated);
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
    setApiProvider(null);
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
    uc.off('user-updated', this.onUCUserUpdated);
    uc.off('buddy-chat-created', this.onBuddyChatCreated);
    uc.off('group-chat-created', this.onGroupChatCreated);
    uc.off('chat-group-invited', this.onChatGroupInvited);
    uc.off('chat-group-revoked', this.onChatGroupRevoked);
    uc.off('chat-group-updated', this.onChatGroupUpdated);
    uc.off('file-received', this.onFileReceived);
    uc.off('file-progress', this.onFileProgress);
    uc.off('file-finished', this.onFileFinished);
  }

  pbxAndSipStarted = 0;

  onPBXAndSipStarted = async () => {
    try {
      await this._onPBXAndSipStarted();
    } catch (err) {
      console.error('onPBXAndSipStarted', err);
    }
  };

  _onPBXAndSipStarted = async () => {
    if (this.pbxAndSipStarted < 1) {
      this.pbxAndSipStarted += 1;
      return;
    }

    this.pbxAndSipStarted = 0;
    const webPhone = await this.updatePhoneIndex();

    if (!webPhone) {
      return;
    }

    this.addPnToken(webPhone);
  };

  updatePhoneIndex = async () => {
    try {
      return await this._updatePhoneIndex();
    } catch (err) {
      console.error('updatePhoneIndex', err);
      routerStore.goToSigninPage();
      return null;
    }
  };

  _updatePhoneIndex = async () => {
    let phoneIndex = authStore.profile.pbxPhoneIndex;
    phoneIndex = parseInt(phoneIndex) || 4;
    phoneIndex = phoneIndex - 1;
    const extProps = authStore.userExtensionProperties;
    const phone = extProps.phones[phoneIndex];
    const phoneTypeCorrect = phone.type === 'Web Phone';
    const hasPhoneId = !!phone.id;

    const { pbxTenant, pbxUsername } = authStore.profile;

    const setExtensionProperties = async () => {
      await pbx.pal('setExtensionProperties', {
        tenant: pbxTenant,
        extension: pbxUsername,

        properties: {
          pnumber: extProps.phones.map(p => p.id).join(','),
          [`p${phoneIndex + 1}_ptype`]: phone.type,
        },
      });

      authStore.userExtensionProperties = extProps;
    };

    if (phoneTypeCorrect && hasPhoneId) {
    } else if (phoneTypeCorrect && !hasPhoneId) {
      phone.id = `${pbxTenant}_${pbxUsername}_webphone`;
      await setExtensionProperties();
    } else if (!phoneTypeCorrect && !hasPhoneId) {
      phone.id = `${pbxTenant}_${pbxUsername}_webphone`;
      phone.type = 'Web Phone';
      await setExtensionProperties();
    } else {
      return new Promise(resolve => {
        Alert.alert(
          'Warning',
          'This phone index is already in use. Do you want to continue?',
          [
            {
              text: 'Cancel',

              onPress: () => {
                routerStore.goToSigninPage();
                resolve(null);
              },

              style: 'cancel',
            },
            {
              text: 'OK',

              onPress: () => {
                phone.type = 'Web Phone';

                setExtensionProperties()
                  .then(() => {
                    resolve(phone);
                  })
                  .catch(err => {
                    console.error('setExtensionProperties', err);
                    resolve(null);
                  });
              },
            },
          ],
          {
            cancelable: false,
          },
        );
      });
    }

    return phone;
  };

  addPnToken = async webPhone => {
    const t = await getPushNotificationToken();

    if (!t) {
      return;
    }

    if (Platform.OS === 'ios') {
      pbx.addApnsToken({
        username: webPhone.id,
        device_id: t,
      });
    } else if (Platform.OS === 'android') {
      pbx.addFcmPnToken({
        username: webPhone.id,
        device_id: t,
      });
    } else if (Platform.OS === 'web') {
      pbx.addWebPnToken({
        user: webPhone.id,
        endpoint: t.endpoint,
        auth_secret: t.auth,
        key: t.p256dh,
      });
    }
  };

  onPBXConnectionStarted = () => {
    this.loadPBXUsers().catch(err => {
      toast.error('Failed to load PBX users');
      console.error(err);
    });

    setTimeout(this.onPBXAndSipStarted, 170);
  };

  onPBXConnectionStopped = () => {
    this.props.onPBXConnectionStopped();
  };

  onPBXConnectionTimeout = () => {
    this.props.onPBXConnectionTimeout();
  };

  loadPBXUsers = async () => {
    if (!authStore.profile) {
      return;
    }
    const tenant = authStore.profile.pbxTenant;
    const username = authStore.profile.pbxUsername;
    const userIds = await pbx
      .getUsers(tenant)
      .then(ids => ids.filter(id => id !== username));
    const users = await pbx.getOtherUsers(tenant, userIds);
    contactStore.set('pbxUsers', users);
  };

  onPBXUserCalling = ev => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'calling');
  };
  onPBXUserRinging = ev => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'ringing');
  };
  onPBXUserTalking = ev => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'talking');
  };
  onPBXUserHolding = ev => {
    contactStore.setTalkerStatus(ev.user, ev.talker, 'holding');
  };
  onPBXUserHanging = ev => {
    contactStore.setTalkerStatus(ev.user, ev.talker, '');
  };

  onPBXParkStarted = park => {
    this.props.createParkingCall(park);
  };

  onPBXParkStopped = park => {
    this.props.removeParkingCall(park);
  };

  onSIPConnectionStarted = () => {
    this.props.onSIPConnectionStarted();
    setTimeout(this.onPBXAndSipStarted, 170);
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
      const pbxUser = contactStore.getPBXUser(number);
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
      profile: authStore.profile.id,
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

  onUCUserUpdated = ev => {
    contactStore.updateUCUser(ev);
  };

  onBuddyChatCreated = chat => {
    chatStore.pushMessages(chat.creator, chat);
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

export default ApiProvider;
