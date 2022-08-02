import { observer } from 'mobx-react'
import { Component } from 'react'

import { callStore } from '../stores/callStore'
import { CallVideosUI } from './CallVideosUI'

@observer
export class CallVideos extends Component {
  render() {
    const c = callStore.getCurrentCall()
    return (
      <CallVideosUI
        callIds={(c ? [c] : [])
          .filter(
            _ =>
              _.videoSessionId && _.localVideoEnabled && _.remoteVideoEnabled,
          )
          .map(_ => _.id)}
        resolveCall={this.resolveCall}
      />
    )
  }

  resolveCall = () => ({
    sourceObject: callStore.getCurrentCall()?.remoteVideoStreamObject,
  })
}
