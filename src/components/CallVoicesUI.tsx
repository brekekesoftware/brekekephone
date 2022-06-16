import { Component } from 'react'
import { Platform } from 'react-native'
import IncallManager from 'react-native-incall-manager'

import { sip } from '../api/sip'
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

export class OutgoingItem extends Component<{}, { isPause: boolean }> {
  state = {
    isPause: true,
  }
  componentDidMount = () => {
    const currentCall = callStore.getCurrentCall()
    currentCall && sip.disableMedia(currentCall.id)

    if (Platform.OS === 'android') {
      IncallManager.startRingback('_BUNDLE_')
    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'android') {
      IncallManager.stopRingback()
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
  componentDidMount = () => {
    const currentCall = callStore.getCurrentCall()
    currentCall && sip.enableMedia(currentCall.id)
  }
  render() {
    return null
  }
}
export class AnsweredItem extends Component<{
  voiceStreamObject: MediaStream | null
}> {
  componentDidMount = () => {
    const currentCall = callStore.getCurrentCall()
    currentCall && sip.enableMedia(currentCall.id)
  }
  render() {
    return null
  }
}
