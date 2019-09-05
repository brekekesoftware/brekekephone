import { observable } from 'mobx';

import BaseStore from './BaseStore';

class ChatStore extends BaseStore {
  @observable messagesMap = {};
}

export default new ChatStore();
