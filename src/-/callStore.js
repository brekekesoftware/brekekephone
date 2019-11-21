import { action, computed, observable } from 'mobx';

import { arrToMap } from '../utils/toMap';
import BaseStore from './BaseStore';

export class CallStore extends BaseStore {
  @observable selectedId = ``;
  @observable callBar = ``;
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
      this.set(`runnings`, [...this.runnings]);
    } else {
      this.set(`runnings`, [...this.runnings, _c]);
    }
  };
  @action removeRunning = id => {
    this.set(`selectedId`, ``);
    this.runnings = this.runnings.filter(c => c.id !== id);
  };
  //
  @computed get _runningsMap() {
    return arrToMap(this.runnings, `id`, c => c);
  }
  getRunningCall = id => {
    return this._runningsMap[id];
  };
}

const callStore = new CallStore();

export default callStore;
