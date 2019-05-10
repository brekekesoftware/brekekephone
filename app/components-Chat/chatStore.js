import { action, observable } from 'mobx';

class ChatStore {
  @observable msgsMapBuddyId = {};

  @action setMsgs = (msgs, buddyId) => {
    this.msgsMapBuddyId[buddyId] = msgs;
  };
  @action clear = () => {
    this.msgsMapBuddyId = {};
  };

  getMsgs = buddyId => {
    return this.msgsMapBuddyId[buddyId] || [];
  };
}

export default new ChatStore();
