import { observable } from 'mobx';

import BaseStore from './BaseStore';

export class VoiceMailStore extends BaseStore {
  //user
  //new
  //saved
  //unread
  //read

  @observable voicemail = {};
}

const voiceMailStore = new VoiceMailStore();

export default voiceMailStore;
