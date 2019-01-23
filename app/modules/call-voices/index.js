import React, { Component } from 'react';
import { createModelView } from '@thenewvu/redux-model';
import UI from './ui';

const isIncoming = call => !call.answered && call.incoming;
const isOutgoing = call => !call.answered && !call.incoming;
const isAnswered = call => call.answered;

const mapGetter = getter => state => ({
  incomingCallIds: getter.runningCalls
    .idsByOrder(state)
    .filter(id => isIncoming(getter.runningCalls.detailMapById(state)[id])),
  outgoingCallIds: getter.runningCalls
    .idsByOrder(state)
    .filter(id => isOutgoing(getter.runningCalls.detailMapById(state)[id])),
  answeredCallIds: getter.runningCalls
    .idsByOrder(state)
    .filter(id => isAnswered(getter.runningCalls.detailMapById(state)[id])),
  callById: getter.runningCalls.detailMapById(state),
});

class View extends Component {
  render = () => (
    <UI
      incomingCallIds={this.props.incomingCallIds}
      outgoingCallIds={this.props.outgoingCallIds}
      answeredCallIds={this.props.answeredCallIds}
      resolveCall={this.resolveCall}
    />
  );

  resolveCall = id => this.props.callById[id];
}

export default createModelView(mapGetter, null)(View);
