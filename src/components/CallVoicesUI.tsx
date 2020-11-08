import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { Platform } from 'react-native'
import IncallManager from 'react-native-incall-manager'

import callStore from '../stores/callStore'

@observer
class IncomingItem extends React.Component {
  // Use window.setTimeout to prevent PN answered the call but still ring in a blink
  timeoutId = 0

  componentDidMount() {
    this.timeoutId = window.setTimeout(() => {
      IncallManager.startRingtone('_BUNDLE_')
      this.timeoutId = 0
    }, 300)
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = 0
    }
    IncallManager.stopRingtone()
  }

  render() {
    return null
  }
}

const IncomingList: FC<{
  ids: string[]
  resolve: Function
}> = p => (
  <>
    {p.ids.map(id => (
      <IncomingItem key={id} {...p.resolve(id)} />
    ))}
  </>
)

class OutgoingItem extends React.Component {
  componentDidMount() {
    IncallManager.startRingback('_BUNDLE_')
  }

  componentWillUnmount() {
    IncallManager.stopRingback()
  }

  render() {
    return null
  }
}

const OutgoingList: FC<{
  ids: string[]
  resolve: Function
}> = p => (
  <>
    {p.ids.map(id => (
      <OutgoingItem key={id} {...p.resolve(id)} />
    ))}
  </>
)

const CallVoicesUI: FC<{
  incomingCallIds: string[]
  outgoingCallIds: string[]
  answeredCallIds: string[]
  resolveCall: Function
}> = p => (
  <>
    {(Platform.OS !== 'android' || callStore.androidRingtone <= 0) && (
      <IncomingList
        ids={p.incomingCallIds.filter(i => i !== undefined)}
        resolve={p.resolveCall}
      />
    )}
    <OutgoingList
      ids={p.outgoingCallIds.filter(i => i !== undefined)}
      resolve={p.resolveCall}
    />
  </>
)

export default CallVoicesUI
