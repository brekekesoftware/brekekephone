import { Component } from 'react'
import { Platform } from 'react-native'
import IncallManager from 'react-native-incall-manager'

import { callStore } from '../stores/callStore'
import { BrekekeUtils } from '../utils/RnNativeModules'

export class IncomingItem extends Component {
  ringtonePlaying = false
  async componentDidMount() {
    if (Platform.OS === 'android' && (await BrekekeUtils.isSilent())) {
      return
    }
    IncallManager.startRingtone('_BUNDLE_')
    this.ringtonePlaying = true
    // TODO stop ringtone if user press hardware button
    // https://www.npmjs.com/package/react-native-keyevent
  }
  componentWillUnmount() {
    IncallManager.stopRingtone()
    this.ringtonePlaying = false
    if (Platform.OS === 'android') {
      // Bug speaker auto turn on after call stopRingtone/stopRingback
      IncallManager.setForceSpeakerphoneOn(callStore.isLoudSpeakerEnabled)
    }
  }
  render() {
    return null
  }
}

export class OutgoingItem extends Component {
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
export class OutgoingItemWithSDP extends Component<{
  earlyMedia: MediaStream | null
}> {
  render() {
    return null
  }
}
// polyfill for web
export const AnsweredItem = (p: { voiceStreamObject: MediaStream | null }) =>
  null
