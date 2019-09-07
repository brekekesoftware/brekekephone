import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import { action, computed, observable } from 'mobx';

import arrToMap from '../shared/arrToMap';
import BaseStore from './BaseStore';

class ChatStore extends BaseStore {
  // id
  // text
  // file
  // created => TODO update to createdAt apis/uc
  // creator => TODO update to ucUserId apis/uc
  @observable messagesByThreadId = {}; // threadId can be `ucUserId` or `groupId`
  @computed get threadIdsOrderedByRecent() {
    return sortBy(
      Object.keys(this.messagesByThreadId),
      k => this.messagesByThreadId[k].created,
    );
  }
  pushMessages = (threadId, newMessages) => {
    if (!Array.isArray(newMessages)) {
      newMessages = [newMessages];
    }
    const messages = this.messagesByThreadId[threadId] || [];
    messages.push(...newMessages);
    this.set(
      `messagesByThreadId.${threadId}`,
      sortBy(uniq(messages, 'id'), 'created'),
    );
  };

  // id
  // name
  // inviter
  // jointed
  // members
  @observable groups = [];
  upsertGroup = _g => {
    const g = this.groups.find(g => g.id === _g.id);
    if (g) {
      Object.assign(g, _g);
    } else {
      this.groups.push(_g);
    }
    this.set('groups', [...this.groups]);
  };
  @action removeGroup = groupId => {
    delete this.messagesByThreadId[groupId];
    this.groups = this.groups.filter(g => g.id !== groupId);
  };
  // Support the old methods
  // TODO remove them later
  @computed get _groupsMap() {
    return arrToMap(this.groups, 'id', g => g);
  }
  getGroup = groupId => {
    return this._groupsMap[groupId];
  };
}

export default new ChatStore();
