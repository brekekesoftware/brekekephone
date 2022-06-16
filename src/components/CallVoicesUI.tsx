import { Component } from 'react'
import { Platform, StyleSheet } from 'react-native'
import IncallManager from 'react-native-incall-manager'
import Video from 'react-native-video'

import { sip } from '../api/sip'
import { callStore } from '../stores/callStore'
import { BrekekeUtils } from '../utils/RnNativeModules'

const css = StyleSheet.create({
  video: {
    width: 0,
    height: 0,
    backgroundColor: 'blue',
  },
})
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
    } else {
      this.setState({ isPause: false })
    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'android') {
      IncallManager.stopRingback()
      IncallManager.setForceSpeakerphoneOn(callStore.isLoudSpeakerEnabled)
    }
  }
  render() {
    return Platform.OS === 'android' ? null : (
      <Video
        source={require('../assets/incallmanager_ringback.mp3')}
        style={css.video}
        paused={this.state.isPause}
        repeat={true}
        playInBackground={true}
      />
    )
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
