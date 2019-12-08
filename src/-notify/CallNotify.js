import { computed } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import callStore from '../global/callStore';
import Notify from './Notify';

const isIncoming = call => call.incoming && !call.answered;

@observer
class CallNotify extends React.Component {
  @computed get callIds() {
    return callStore.runnings.filter(c => isIncoming(c)).map(c => c.id);
  }
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  accept = id => {
    const call = callStore.getRunningCall(id);
    callStore.set(`selectedId`, call.id);
    const videoEnabled = call.remoteVideoEnabled;
    this.context.sip.answerSession(id, {
      videoEnabled,
    });
  };

  reject = id => {
    this.context.sip.hangupSession(id);
  };

  render() {
    return this.callIds.map(id => (
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
