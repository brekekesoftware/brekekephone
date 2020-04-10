import { computed, observable } from 'mobx';

import { arrToMap } from '../utils/toMap';

class ContactStore {
  @observable usersSearchTerm = '';

  @observable callSearchRecents = '';

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
    this.pbxUsers = [...this.pbxUsers];
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
  updateUCUser = _u => {
    const u = this.getUCUser(_u.id);
    if (!u) {
      return;
    }
    Object.assign(u, _u);
    this.ucUsers = [...this.ucUsers];
  };
  @computed get _ucUsersMap() {
    return arrToMap(this.ucUsers, 'id', u => u);
  }
  getUCUser = id => {
    return this._ucUsersMap[id];
  };

  // id
  // book
  // firstName
  // lastName
  // workNumber
  // cellNumber
  // homeNumber
  // job
  // company
  // address
  // email
  // shared
  @observable phoneBooks = [];
  @computed get _phoneBooksMap() {
    return arrToMap(this.phoneBooks, 'id', u => u);
  }
  updatePhonebook = _u => {
    const u = this.getPhonebook(_u.id);
    if (!u) {
      return;
    }
    Object.assign(u, _u);
    this.phoneBooks = [...this.phoneBooks];
  };

  pushPhonebook = _p => {
    const p = this.getPhonebook(_p.id);
    if (!p) {
      this.phoneBooks.push(_p);
    }
  };

  setPhonebook = _p => {
    if (!Array.isArray(_p)) {
      return;
    }
    this.phoneBooks = [...this.phoneBooks, ..._p];
  };

  getPhonebook = id => {
    return this._phoneBooksMap[id];
  };

  clearStore = () => {
    this.phoneBooks = [];
    this.ucUsers = [];
    this.pbxUsers = [];
  };
}

export default new ContactStore();
