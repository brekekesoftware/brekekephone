import { observer } from 'mobx-react'
import { Component } from 'react'

import { CallVideosUI } from '#/components/CallVideosUI'
import { getCallStore } from '#/stores/callStore'
import { checkMutedRemoteUser } from '#/utils/checkMutedRemoteUser'

@observer
export class CallVideos extends Component {
  render() {
    const oc = getCallStore().getOngoingCall()
    return (
      <CallVideosUI
        callIds={(oc ? [oc] : [])
          .filter(
            _ =>
              _.videoSessionId && _.localVideoEnabled && _.remoteVideoEnabled,
          )
          .map(_ => _.id)}
        resolveCall={this.resolveCall}
      />
    )
  }

  resolveCall() {
    const oc = getCallStore().getOngoingCall()
    return {
      sourceObject: checkMutedRemoteUser(
        oc?.remoteUserOptionsTable?.[oc?.videoStreamActive?.user ?? '']?.muted,
      )
        ? oc?.videoStreamActive?.remoteStreamObject
        : null,
    }
  }
}
