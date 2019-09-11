import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import callStore from '../callStore';
import UI from './ui';

const isIncoming = call => call.incoming && !call.answered;

@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  accept = id => {
    const call = this.props.callById[id];
    const videoEnabled = call.remoteVideoEnabled;
    this.context.sip.answerSession(id, {
      videoEnabled,
    });
  };
  reject = id => {
    this.context.sip.hangupSession(id);
  };

  render() {
    return (
      <UI
        callIds={callStore.runnings.filter(c => isIncoming(c)).map(c => c.id)}
        resolveCall={callStore.getRunningCall}
        accept={this.accept}
        reject={this.reject}
      />
    );
  }
}

export default View;
