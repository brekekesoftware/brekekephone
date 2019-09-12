import { action, computed, observable } from 'mobx';

import arrToMap from './arrToMap';
import BaseStore from './BaseStore';

class ContactStore extends BaseStore {
  @observable searchText = '';

  // id
  // name
  // talkers?[]
  //   id
  //   status
  //     'calling'
  //     'ringing'
  //     'talking'
  //     'holding'
  @observable pbxUsers = [];
  setTalkerStatus = (userId, talkerId, status) => {
    const user = this.getPBXUser(userId);
    if (!user) {
      return;
    }
    if (!user.talkers) {
      user.talkers = [];
    }
    if (!status) {
      user.talkers = user.talkers.filter(t => t.id !== talkerId);
    } else {
      const talker = user.talkers.find(t => t.id === talkerId);
      if (!talker) {
        user.talkers.push({
          id: talkerId,
          status,
        });
      } else {
        talker.status = status;
      }
    }
    this.set('pbxUsers', [...this.pbxUsers]);
  };
  //
  @computed get _pbxUsersMap() {
    return arrToMap(this.pbxUsers, 'id', u => u);
  }
  getPBXUser = id => {
    return this._pbxUsersMap[id];
  };

  // id
  // name
  // avatar
  // status
  //   'online'
  //   'offline'
  //   'idle'
  //   'busy'
  // statusText
  @observable ucUsers = [];
  updateUCUser = action(_u => {
    const u = this.getUCUser(_u.id);
    if (!u) {
      return;
    }
    Object.assign(u, _u);
    this.set('ucUsers', [...this.ucUsers]);
  });
  @computed get _ucUsersMap() {
    return arrToMap(this.ucUsers, 'id', u => u);
  }
  getUCUser = id => {
    return this._ucUsersMap[id];
  };
}

export default new ContactStore();
