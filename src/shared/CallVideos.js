import { observer } from 'mobx-react';
import React from 'react';

import callStore from '../global/callStore';
import CallVideosUI from './CallVideosUI';

@observer
class CallVideos extends React.Component {
  render() {
    return (
      <CallVideosUI
        callIds={(callStore.currentCall ? [callStore.currentCall] : [])
          .filter(
            c =>
              c.videoSessionId && c.localVideoEnabled && c.remoteVideoEnabled,
          )
          .map(c => c.id)}
        resolveCall={this.resolveCall}
      />
    );
  }

  resolveCall = () => ({
    sourceObject: callStore.currentCall?.remoteVideoStreamObject,
  });
}

export default CallVideos;
