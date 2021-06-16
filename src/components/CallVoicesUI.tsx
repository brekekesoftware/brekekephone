import React, { FC } from 'react'
import IncallManager from 'react-native-incall-manager'

import { getAuthStore } from '../stores/authStore'

class IncomingItem extends React.Component {
  needToStopRingtone = false
  componentDidMount() {
    // For incoming call we already have callkit PN
    // We dont need to play ringtone here, it may the casue of the issue no voice in ios
    if (!getAuthStore().currentProfile?.pushNotificationEnabled) {
      IncallManager.startRingtone('_BUNDLE_')
      this.needToStopRingtone = true
      // TODO stop ringtone if user press hardware button
      // https://www.npmjs.com/package/react-native-keyevent
    }
  }
  componentWillUnmount() {
    if (this.needToStopRingtone) {
      IncallManager.stopRingtone()
    }
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
