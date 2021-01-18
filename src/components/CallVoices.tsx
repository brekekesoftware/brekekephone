import { observer } from 'mobx-react'
import React from 'react'

import Call from '../stores/Call'
import callStore from '../stores/callStore'
import CallVoicesUI from './CallVoicesUI'

const isIncoming = (c: Call) => !c.answered && c.incoming
const isOutgoing = (c: Call) => !c.answered && !c.incoming
const isAnswered = (c: Call) => c.answered

@observer
class CallVoices extends React.Component {
  render() {
    const calls: Call[] = callStore.calls // TODO
    const m = calls.reduce((m, c) => {
      m[c.id] = c
      return m
    }, {} as { [k: string]: Call })
    return (
      <CallVoicesUI
        answeredCallIds={calls.filter(c => isAnswered(c)).map(c => c.id)}
        incomingCallIds={calls.filter(c => isIncoming(c)).map(c => c.id)}
        outgoingCallIds={calls.filter(c => isOutgoing(c)).map(c => c.id)}
        resolveCall={(id: string) => m[id]}
      />
    )
  }
}

export default CallVoices
