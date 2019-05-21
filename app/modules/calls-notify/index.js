import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import UI from './ui';

const isIncoming = call => call.incoming && !call.answered;

const mapGetter = getter => state => ({
  callIds: getter.runningCalls
    .idsByOrder(state)
    .filter(id => isIncoming(getter.runningCalls.detailMapById(state)[id])),
  callById: getter.runningCalls.detailMapById(state),
});

const mapAction = action => emit => ({
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
});

class View extends Component {
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
    sip.answerSession(id, { videoEnabled });
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

export default createModelView(mapGetter, mapAction)(View);
