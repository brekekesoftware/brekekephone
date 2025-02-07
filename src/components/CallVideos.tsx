import { observer } from 'mobx-react'
import { Component } from 'react'

import { getCallStore } from '../stores/callStore'
import { convertExInfo } from '../utils/convertExInfo'
import { CallVideosUI } from './CallVideosUI'

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
      sourceObject: convertExInfo(
        oc?.remoteUserOptionsTable?.[oc?.videoStreamActive?.user ?? '']?.exInfo,
      )
        ? oc?.videoStreamActive?.remoteStreamObject
        : null,
    }
  }
}
