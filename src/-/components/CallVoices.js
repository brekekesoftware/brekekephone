import { observer } from 'mobx-react';
import React from 'react';

import callStore from '../callStore';
import CallVoicesUI from './CallVoicesUI';

const isIncoming = call => !call.answered && call.incoming;
const isOutgoing = call => !call.answered && !call.incoming;
const isAnswered = call => call.answered;

@observer
class CallVoices extends React.Component {
  render() {
    return (
      <CallVoicesUI
        answeredCallIds={callStore.runnings
          .filter(c => isAnswered(c))
          .map(c => c.id)}
        incomingCallIds={callStore.runnings
          .filter(c => isIncoming(c))
          .map(c => c.id)}
        outgoingCallIds={callStore.runnings
          .filter(c => isOutgoing(c))
          .map(c => c.id)}
        resolveCall={callStore.getRunningCall}
      />
    );
  }
}

export default CallVoices;
