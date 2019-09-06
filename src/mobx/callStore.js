import { observable } from 'mobx';

import BaseStore from './BaseStore';

class CallStore extends BaseStore {
  @observable selectedId = '';

  // id,
  // status:
  // 	'incoming'
  //	'answered'
  // partyNumber
  // created
  //@observable recentCalls = [];

  // id
  // status:
  //	'incoming'
  //	'answered'
  //	'holding'
  // partyName
  // partyNumber
  // recording
  // localVideoEnabled
  // loudspeaker
  // pbxTenant
  // pbxTalkerId
  //
  // @observable runningCalls = [];
}

export default new CallStore();
