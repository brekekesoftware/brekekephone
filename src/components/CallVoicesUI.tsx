import React, { FC } from 'react'
import { Platform } from 'react-native'
import IncallManager from 'react-native-incall-manager'

import { callStore } from '../stores/callStore'
import { DidMountTimer } from './CallNotify'

class IncomingItem extends React.Component {
  componentDidMount() {
    IncallManager.startRingtone('_BUNDLE_')
    // TODO stop ringtone if user press hardware button
    // https://www.npmjs.com/package/react-native-keyevent
  }
  componentWillUnmount() {
    IncallManager.stopRingtone()
    if (Platform.OS === 'android') {
      // Bug speaker auto turn on after call stopRingtone/stopRingback
      IncallManager.setForceSpeakerphoneOn(callStore.isLoudSpeakerEnabled)
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
    if (Platform.OS === 'android') {
      // Bug speaker auto turn on after call stopRingtone/stopRingback
      IncallManager.setForceSpeakerphoneOn(callStore.isLoudSpeakerEnabled)
    }
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
    {p.incomingCallIds.filter(i => i).length ? (
      <DidMountTimer>
        <IncomingItem />
      </DidMountTimer>
    ) : null}
    {p.outgoingCallIds.filter(i => i).length ? <OutgoingItem /> : null}
  </>
)

export default CallVoicesUI
