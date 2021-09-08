import { observer } from 'mobx-react'
import React from 'react'

import { Call } from '../stores/Call'
import { callStore } from '../stores/callStore'
import { CallVoicesUI } from './CallVoicesUI'

export const CallVoices = observer(() => {
  // Try trigger observer?
  void Object.keys(callStore.callkeepMap)
  void callStore.calls.map(_ => _.callkeepUuid)
  // Old logic resolveCall from redux
  const map = callStore.calls.reduce((m, c) => {
    // @ts-ignore
    m[c.id] = c
    return m
  }, {} as { [k: string]: Call })
  return (
    <CallVoicesUI
      resolveCall={(id: string) => map[id]}
      answeredCallIds={callStore.calls.filter(c => c.answered).map(c => c.id)}
      incomingCallIds={callStore.calls
        .filter(
          c =>
            c.incoming &&
            !c.answered &&
            // Do not ring if already show callkeep
            !callStore.callkeepMap[c.callkeepUuid],
        )
        .map(c => c.id)}
      outgoingCallIds={callStore.calls
        .filter(c => !c.incoming && !c.answered)
        .map(c => c.id)}
    />
  )
})
