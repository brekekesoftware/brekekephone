import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import sip from '../api/sip';
import g from '../global';
import callStore from '../global/callStore';
import Notify from './Notify';

const isIncoming = call => call.incoming && !call.answered;

@observer
class CallNotify extends React.Component {
  @computed get callIds() {
    return callStore.runnings.filter(c => isIncoming(c)).map(c => c.id);
  }
  accept = id => {
    const call = callStore.getRunningCall(id);
    callStore.set(`selectedId`, call.id);
    const videoEnabled = call.remoteVideoEnabled;
    sip.answerSession(id, {
      videoEnabled,
    });
    g.goToPageCallManage();
  };
  reject = id => {
    sip.hangupSession(id);
  };

  render() {
    return this.callIds
      .filter(id => id !== callStore.selectedId)
      .map(id => (
        <Notify
          key={id}
          {...callStore.getRunningCall(id)}
          accept={this.accept}
          reject={this.reject}
          type={`call`}
        />
      ));
  }
}

export default CallNotify;
