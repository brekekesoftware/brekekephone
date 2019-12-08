import { observer } from 'mobx-react';
import React from 'react';

import callStore from '../global/callStore';
import CallVideosUI from './CallVideosUI';

@observer
class CallVideos extends React.Component {
  render() {
    return (
      <CallVideosUI
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

export default CallVideos;
