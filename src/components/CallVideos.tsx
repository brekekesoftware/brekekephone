import { observer } from 'mobx-react'
import { Component } from 'react'

import { CallVideosUI } from '#/components/CallVideosUI'
import { ctx } from '#/stores/ctx'
import { checkMutedRemoteUser } from '#/utils/checkMutedRemoteUser'

@observer
export class CallVideos extends Component {
  render() {
    const oc = ctx.call.getOngoingCall()
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
    const oc = ctx.call.getOngoingCall()
    return {
      sourceObject: checkMutedRemoteUser(
        oc?.remoteUserOptionsTable?.[oc?.videoStreamActive?.user ?? '']?.muted,
      )
        ? oc?.videoStreamActive?.remoteStreamObject
        : null,
    }
  }
}
