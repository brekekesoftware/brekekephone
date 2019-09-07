import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import { computed, observable } from 'mobx';

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
      k => this.messagesByThreadId[k].createdAt,
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
      sortBy(uniq(messages), 'createdAt'),
    );
  };
}

export default new ChatStore();
