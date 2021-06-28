import { observer } from 'mobx-react'
import React from 'react'

import callStore from '../stores/callStore'
import CallVideosUI from './CallVideosUI'

@observer
class CallVideos extends React.Component {
  render() {
    const c = callStore.currentCall()
    return (
      <CallVideosUI
        callIds={(c ? [c] : [])
          .filter(
            c =>
              c.videoSessionId && c.localVideoEnabled && c.remoteVideoEnabled,
          )
          .map(c => c.id)}
        resolveCall={this.resolveCall}
      />
    )
  }

  resolveCall = () => ({
    sourceObject: callStore.currentCall()?.remoteVideoStreamObject,
  })
}

export default CallVideos
