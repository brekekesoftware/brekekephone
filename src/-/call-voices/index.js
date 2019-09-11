import { observer } from 'mobx-react';
import React from 'react';

import callStore from '../callStore';
import UI from './ui';

const isIncoming = call => !call.answered && call.incoming;
const isOutgoing = call => !call.answered && !call.incoming;
const isAnswered = call => call.answered;

@observer
class View extends React.Component {
  render() {
    return (
      <UI
        incomingCallIds={callStore.runnings
          .filter(c => isIncoming(c))
          .map(c => c.id)}
        outgoingCallIds={callStore.runnings
          .filter(c => isOutgoing(c))
          .map(c => c.id)}
        answeredCallIds={callStore.runnings
          .filter(c => isAnswered(c))
          .map(c => c.id)}
        resolveCall={callStore.getRunningCall}
      />
    );
  }
}

export default View;
