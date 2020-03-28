import { observer } from 'mobx-react';
import React from 'react';

import callStore from '../global/callStore';
import CallVoicesUI from './CallVoicesUI';

const isIncoming = call => !call.answered && call.incoming;
const isOutgoing = call => !call.answered && !call.incoming;
const isAnswered = call => call.answered;

@observer
class CallVoices extends React.Component {
  render() {
    const calls = callStore._calls; // TODO
    const m = calls.reduce((m, c) => {
      m[c.id] = c;
      return m;
    }, {});
    return (
      <CallVoicesUI
        answeredCallIds={calls.filter(c => isAnswered(c)).map(c => c.id)}
        incomingCallIds={calls.filter(c => isIncoming(c)).map(c => c.id)}
        outgoingCallIds={calls.filter(c => isOutgoing(c)).map(c => c.id)}
        resolveCall={id => m[id]}
      />
    );
  }
}

export default CallVoices;
