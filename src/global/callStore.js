import { computed, observable } from 'mobx';

import pbx from '../api/pbx';
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
      this.runnings = [...this.runnings];
    } else {
      this.runnings = [...this.runnings, _c];
    }
    this.updateSelectedId();
  };

  setSelectedId = id => {
    if (id && !this.runnings.some(r => r.id === id)) {
      return; // Not found
    }
    this.selectedId = id;
    if (!id) {
      return; // Remove
    }
    // selectedId changed
    setTimeout(() => {
      this.runnings.forEach(r => {
        if (r.id !== id && !r.holding) {
          pbx.holdTalker(r.pbxTenant, r.pbxTalkerId);
          // TODO handle errors
        }
        if (r.id === id && r.holding) {
          pbx.unholdTalker(r.pbxTenant, r.pbxTalkerId);
          // TODO handle errors
        }
      });
    }, 300);
  };
  updateSelectedId = () =>
    setTimeout(() => {
      if (!this.runnings.some(r => r.id === this.selectedId)) {
        this.setSelectedId(this.runnings[0].id);
      }
    }, 17);

  removeRunning = id => {
    this.setSelectedId(``);
    this.runnings = this.runnings.filter(c => c.id !== id);
    this.updateSelectedId();
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
