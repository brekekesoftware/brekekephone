import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import UI from './ui';

const isIncoming = call => call.incoming && !call.answered;

@observer
@createModelView(
  getter => state => ({
    callIds: getter.runningCalls
      .idsByOrder(state)
      .filter(id => isIncoming(getter.runningCalls.detailMapById(state)[id])),
    callById: getter.runningCalls.detailMapById(state),
  }),
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  resolveCall = id => {
    const call = this.props.callById[id];
    return call;
  };

  reject = id => {
    const { sip } = this.context;

    sip.hangupSession(id);
  };

  accept = id => {
    const { sip } = this.context;

    const call = this.props.callById[id];
    const videoEnabled = call.remoteVideoEnabled;

    sip.answerSession(id, {
      videoEnabled,
    });
  };

  render = () => (
    <UI
      callIds={this.props.callIds}
      resolveCall={this.resolveCall}
      accept={this.accept}
      reject={this.reject}
    />
  );
}

export default View;
