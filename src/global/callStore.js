import { computed, observable } from 'mobx';

import { arrToMap } from '../utils/toMap';
import BaseStore from './BaseStore';

export class CallStore extends BaseStore {
  @observable selectedId = ``;
  // id
  // incoming
  // answered
  // holding
  // recording
  // transferring
  // parking
  // partyNumber
  // partyName
  // pbxTalkerId
  // pbxTenant
  // createdAt
  // voiceStreamObject
  // videoSessionId
  // localVideoEnabled
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
    setTimeout(() => {
      if (!this.runnings.some(r => r.id === this.selectedId)) {
        this.selectedId = this.runnings[0].id;
      }
    }, 17);
  };
  removeRunning = id => {
    this.set(`selectedId`, ``);
    this.runnings = this.runnings.filter(c => c.id !== id);
  };
  @computed get _runningsMap() {
    return arrToMap(this.runnings, `id`, c => c);
  }
  getRunningCall = id => {
    return this._runningsMap[id];
  };

  @observable newVoicemailCount = 0;

  // Style in CallVideosUI to save the previous video position
  @observable videoPositionT = 25;
  @observable videoPositionL = 5;
}

const callStore = new CallStore();

export default callStore;
