import { observer } from 'mobx-react'
import React from 'react'

import { callStore } from '../stores/callStore'
import { AnsweredItem, OutgoingItem } from './CallVoicesUI'

export const CallVoices = observer(() => {
  // Try trigger observer?
  void Object.keys(callStore.callkeepMap)
  void callStore.calls.map(_ => _.callkeepUuid)
  return (
    <>
      {!!callStore.calls.filter(c => !c.incoming && !c.answered).length && (
        <OutgoingItem />
      )}
      {callStore.calls
        .filter(c => c.answered)
        .map(c => (
          <AnsweredItem key={c.id} voiceStreamObject={c.voiceStreamObject} />
        ))}
    </>
  )
})
