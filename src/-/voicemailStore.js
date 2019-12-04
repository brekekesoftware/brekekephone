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

const voicemailStore = new VoiceMailStore();

export default voicemailStore;
