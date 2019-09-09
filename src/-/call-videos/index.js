import { observer } from 'mobx-react';
import React from 'react';

import callStore from '../../shared/callStore';
import UI from './ui';

@observer
class View extends React.Component {
  render() {
    return (
      <UI
        callIds={callStore.runnings
          .filter(c => c.videoSessionId)
          .map(c => c.id)}
        resolveCall={this.resolveCall}
      />
    );
  }

  resolveCall = id => {
    const call = callStore.getRunningCall(id);

    return {
      enabled: call.localVideoEnabled,
      sourceObject: call.remoteVideoStreamObject,
    };
  };
}

export default View;
