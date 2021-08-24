import { observer } from 'mobx-react'
import React from 'react'

import Call from '../stores/Call'
import { callStore } from '../stores/callStore'
import CallVoicesUI from './CallVoicesUI'

@observer
class CallVoices extends React.Component {
  render() {
    const map = callStore.calls.reduce((m, c) => {
      // @ts-ignore
      m[c.id] = c
      return m
    }, {} as { [k: string]: Call })
    return (
      <CallVoicesUI
        answeredCallIds={callStore.calls.filter(c => c.answered).map(c => c.id)}
        incomingCallIds={callStore.calls
          .filter(
            c =>
              !c.answered &&
              c.incoming &&
              // Do not ring if already show callkeep
              !callStore.callkeepMap[c.callkeepUuid],
          )
          .map(c => c.id)}
        outgoingCallIds={callStore.calls
          .filter(c => !c.answered && !c.incoming)
          .map(c => c.id)}
        resolveCall={(id: string) => map[id]}
      />
    )
  }
}

export default CallVoices
