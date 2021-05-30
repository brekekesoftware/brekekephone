import React, { FC } from 'react'
import IncallManager from 'react-native-incall-manager'

class IncomingItem extends React.Component {
  componentDidMount() {
    // For incoming call we already have callkit PN
    // We dont need to play ringtone here, it may the casue of the issue no voice in ios
    // IncallManager.startRingtone('_BUNDLE_')
  }
  componentWillUnmount() {
    // IncallManager.stopRingtone()
  }
  render() {
    return null
  }
}

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

const CallVoicesUI: FC<{
  incomingCallIds: string[]
  outgoingCallIds: string[]
  answeredCallIds: string[]
  resolveCall: Function
}> = p => (
  <>
    {p.incomingCallIds.filter(i => i).length ? <IncomingItem /> : null}
    {p.outgoingCallIds.filter(i => i).length ? <OutgoingItem /> : null}
  </>
)

export default CallVoicesUI
