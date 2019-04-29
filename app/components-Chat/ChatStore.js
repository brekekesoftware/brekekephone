import { observable, action } from 'mobx';

class ChatStore {
    @observable msgsMapBuddyId = {};


    @action setMsgs = (msgs, buddyId) => {
        this.msgsMapBuddyId[buddyId] = msgs;
    };
    @action clear = () => {
        this.msgsMapBuddyId = {};
    };
}