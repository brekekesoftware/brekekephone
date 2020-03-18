import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import pbx from '../api/pbx';
import sip from '../api/sip';
import g from '../global';
import callStore from '../global/callStore';
import intl from '../intl/intl';
import { arrToMap } from '../utils/toMap';
import Notify from './Notify';

const isIncoming = call => call.incoming && !call.answered;

@observer
class CallNotify extends React.Component {
  @computed get callIds() {
    return callStore.runnings.filter(c => isIncoming(c)).map(c => c.id);
  }
  @computed get runningById() {
    return arrToMap(callStore.runnings, `id`, c => c);
  }
  onHoldSuccess = () => {
    callStore.upsertRunning({
      id: callStore.selectedId,
      holding: true,
    });
  };
  onHoldFailure = err => {
    g.showError({
      message: intl.debug`Failed to hold the call`,
      err,
    });
  };
  accept = id => {
    const u = callStore.runnings.map(c => {
      return this.runningById[c.id];
    });
    if (u.length <= 1) {
      const call = callStore.getRunningCall(id);
      callStore.setSelectedId(call.id);
      const videoEnabled = call.remoteVideoEnabled;
      sip.answerSession(id, {
        videoEnabled,
      });
      g.goToPageCallManage();
    } else {
      const call = callStore.getRunningCall(id);
      const callActive = this.runningById[callStore.selectedId];
      const videoEnabled = call.remoteVideoEnabled;
      pbx
        .holdTalker(callActive.pbxTenant, callActive.pbxTalkerId)
        .then(this.onHoldSuccess)
        .then(() => callStore.setSelectedId(call.id))
        .then(() =>
          sip.answerSession(id, {
            videoEnabled,
          }),
        )
        .catch(this.onHoldFailure);
    }
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
          type="call"
        />
      ));
  }
}

export default CallNotify;
