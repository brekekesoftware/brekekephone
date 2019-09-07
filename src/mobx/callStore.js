import { action, computed, observable } from 'mobx';
import { Platform } from 'react-native';

import arrToMap from '../shared/arrToMap';
import LoudSpeaker from '../shared/LoudSpeaker';
import BaseStore from './BaseStore';

export class CallStore extends BaseStore {
  @observable selectedId = '';

  // id
  // incoming
  // answered
  // partyNumber
  // partyName
  // created
  @observable recents = [];

  // id
  // incoming
  // answered
  // holding
  // recording
  // transferring
  // parking => new TODO need to implement and test
  // partyNumber
  // partyName
  // pbxTalkerId => TODO rename to partyPBXUserId
  // pbxTenant => TODO rename to partyPBXTenant
  // createdAt
  // voiceStreamObject
  // videoSessionId
  // localVideoEnabled
  // remoteVideoStreamURL
  // remoteVideoStreamObject
  // remoteVideoEnabled
  @observable runnings = [];
  upsertRunning = _c => {
    const c = this.getRunningCall(_c.id);
    if (c) {
      Object.assign(c, _c);
      this.set('runnings', [...this.runnings]);
    } else {
      this.set('runnings', [...this.runnings, _c]);
    }
  };
  @action removeRunning = id => {
    this.runnings = this.runnings.filter(c => c.id !== id);
  };
  //
  @computed get _runningsMap() {
    return arrToMap(this.runnings, 'id', c => c);
  }
  getRunningCall = id => {
    return this._runningsMap[id];
  };

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
