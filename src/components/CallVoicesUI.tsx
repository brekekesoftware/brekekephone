import { Component } from 'react'
import { Platform, StyleSheet } from 'react-native'
import IncallManager from 'react-native-incall-manager'
import Video from 'react-native-video'

import { callStore } from '../stores/callStore'
import { BrekekeUtils } from '../utils/RnNativeModules'

const css = StyleSheet.create({
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
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

export class OutgoingItem extends Component {
  render() {
    return (
      <Video
        source={require('../assets/incallmanager_ringback.mp3')}
        style={css.video}
        repeat={true}
        playInBackground={true}
      />
    )
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
