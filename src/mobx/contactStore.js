import { observable } from 'mobx';

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
  getPBXUser = id => {
    return this.pbxUsers.find(u => u.id === id);
  };
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
  getUCUser = id => {
    return this.ucUsers.find(u => u.id === id);
  };
  updateUCUser = _u => {
    const u = this.getUCUser(_u.id);
    if (!u) {
      return;
    }
    Object.assign(u, _u);
    this.set('ucUsers', [...this.ucUsers]);
  };
}

export default new ContactStore();
