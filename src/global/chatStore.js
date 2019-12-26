import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import { computed, observable } from 'mobx';

import { arrToMap } from '../utils/toMap';
import BaseStore from './BaseStore';

class ChatStore extends BaseStore {
  // id
  // text
  // file
  // isGroup => new TODO consider to keep this? also in apis/index
  // created => TODO update to createdAt apis/uc
  // creator => TODO update to ucUserId apis/uc
  @observable messagesByThreadId = {};
  // threadId can be `ucUserId` or `groupId`
  // TODO threadId can be duplicated between them
  @computed get threadIdsOrderedByRecent() {
    return sortBy(
      Object.keys(this.messagesByThreadId),
      k => this.messagesByThreadId[k].created,
    );
  }
  pushMessages = (threadId, _m) => {
    if (!Array.isArray(_m)) {
      _m = [_m];
    }
    const messages = this.messagesByThreadId[threadId] || [];
    messages.push(..._m);
    this.set(
      `messagesByThreadId.${threadId}`,
      sortBy(uniq(messages, `id`), `created`),
    );
  };

  // id
  // name
  // incoming
  // size
  // state
  //   'waiting'
  //   'started'
  //   'success'
  //   'stopped'
  //   'failure'
  // transferPercent
  @observable filesMap = {};
  upsertFile = _f => {
    const f = this.filesMap[_f.id];
    this.set(`filesMap.${_f.id}`, f ? Object.assign(f, _f) : _f);
  };
  removeFile = id => {
    delete this.filesMap[id];
  };

  // id
  // name
  // inviter
  // jointed
  // members
  @observable groups = [];
  upsertGroup = _g => {
    const g = this.getGroup(_g.id);
    if (g) {
      Object.assign(g, _g);
    } else {
      this.groups.push(_g);
    }
    this.set(`groups`, [...this.groups]);
  };
  removeGroup = id => {
    delete this.messagesByThreadId[id];
    this.groups = this.groups.filter(g => g.id !== id);
  };
  //
  @computed get _groupsMap() {
    return arrToMap(this.groups, `id`, g => g);
  }
  getGroup = id => {
    return this._groupsMap[id];
  };
}

export default new ChatStore();
