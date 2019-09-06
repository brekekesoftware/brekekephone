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
  @observable recentCalls = [];

  // videoSessionId = null when voicecall
  // id
  // status:
  //	'incoming'
  //	'answered'
  //	'holding'
  // partyName
  // partyNumber
  // recording
  // loudspeaker
  // pbxTenant
  // pbxTalkerId
  // transfering
  // =======
  // localVideoEnabled
  // voiceStreamObject
  // remoteVideoStreamURL
  // remoteVideoStreamObject
  // remoteVideoEnabled
  // createdAt
  @observable runningCalls = [];
}

export default new CallStore();
