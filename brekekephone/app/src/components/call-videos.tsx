import { observer } from 'mobx-react'

import { CallVideosUI } from '#/components/call-videos-ui'
import { ctx } from '#/stores/ctx'
import { checkMutedRemoteUser } from '#/utils/check-muted-remote-user'

const resolveCall = () => {
  const oc = ctx.call.getOngoingCall()
  return {
    sourceObject: checkMutedRemoteUser(
      oc?.remoteUserOptionsTable?.[oc?.videoStreamActive?.user ?? '']?.muted,
    )
      ? oc?.videoStreamActive?.remoteStreamObject
      : null,
  }
}

export const CallVideos = observer(() => {
  const oc = ctx.call.getOngoingCall()
  return (
    <CallVideosUI
      callIds={(oc ? [oc] : [])
        .filter(
          _ => _.videoSessionId && _.localVideoEnabled && _.remoteVideoEnabled,
        )
        .map(_ => _.id)}
      resolveCall={resolveCall}
    />
  )
})
