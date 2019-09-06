import { observable } from 'mobx';
import { Platform } from 'react-native';

import LoudSpeaker from '../shared/LoudSpeaker';
import BaseStore from './BaseStore';

export class CallStore extends BaseStore {
  @observable selectedId = '';

  // id
  // type
  //   'outgoing'
  //   'incoming'
  // status
  //   'connected'
  //   'not_connected'
  // partyNumber
  // createdAt
  @observable recentCalls = [];

  // id
  // type
  //   'outgoing'
  //   'incoming'
  // status
  //   'ringing'
  //   'answered'
  //   'holding'
  // isRecording
  // isTransferring
  // partyUCUserId
  // partyPBXUserId
  // partyPBXTenant
  // createdAt
  // voice{}
  //   muted = false
  //   streamObject
  // video{} = null when voice call
  //   sessionId
  //   localMuted = false
  //   remoteMuted = false
  //   remoteStreamURL
  //   remoteStreamObject
  @observable runningCalls = [];

  @observable isLoudSpeakerOn = false; // TODO get and watch it from RN loud speaker
  initLoudSpeaker = async () => {
    if (Platform.OS === 'web') {
      return;
    }
    const data = await LoudSpeaker.about();
    console.error(data); // TODO
    this.set('isLoudSpeakerOn', data);
  };
  enableLoudSpeaker = () => {
    if (Platform.OS === 'web') {
      return;
    }
    LoudSpeaker.open(true);
    this.set('isLoudSpeakerOn', true);
  };
  disableLoudSpeaker = () => {
    if (Platform.OS === 'web') {
      return;
    }
    LoudSpeaker.open(false);
    this.set('isLoudSpeakerOn', false);
  };
}

const callStore = new CallStore();
callStore.initLoudSpeaker();

export default callStore;
