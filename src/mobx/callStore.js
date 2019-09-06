import { observable } from 'mobx';
import { Platform } from 'react-native';

import LoudSpeaker from '../shared/LoudSpeaker';
import BaseStore from './BaseStore';

export class CallStore extends BaseStore {
  @observable selectedId = '';

  // id
  // incoming
  // answered
  // partyNumber
  // partyName
  // createdAt
  @observable recents = [];

  // id
  // incoming
  // answered
  // holding
  // recording
  // transferring
  // parking <- from parkingCalls TODO fix all references
  // partyNumber
  // partyName
  // partyPBXUserId <- pbxTalkerId
  // partyPBXTenant <- pbxTenant
  // createdAt
  // voiceStreamObject
  // videoSessionId
  // localVideoEnabled
  // remoteVideoStreamURL
  // remoteVideoStreamObject
  // remoteVideoEnabled
  @observable runnings = [];

  @observable isLoudSpeakerOn = false;
  initLoudSpeaker = () => {
    if (Platform.OS !== 'web') {
      LoudSpeaker.open(false);
    }
  };
  enableLoudSpeaker = () => {
    if (Platform.OS !== 'web') {
      LoudSpeaker.open(true);
      this.set('isLoudSpeakerOn', true);
    }
  };
  disableLoudSpeaker = () => {
    if (Platform.OS !== 'web') {
      LoudSpeaker.open(false);
      this.set('isLoudSpeakerOn', false);
    }
  };
}

const callStore = new CallStore();
callStore.initLoudSpeaker();

export default callStore;
