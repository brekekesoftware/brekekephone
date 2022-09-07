import { Component, useEffect, useState } from 'react'
import { NativeModules, Platform, StyleSheet } from 'react-native'
import IncallManager from 'react-native-incall-manager'
import Video from 'react-native-video'

import { sip } from '../api/sip'
import { callStore } from '../stores/callStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { BrekekeUtils } from '../utils/RnNativeModules'

const css = StyleSheet.create({
  video: {
    width: 0,
    height: 0,
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
    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'android') {
      IncallManager.stop()
    } else {
      IncallManager.stopRingback()
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
    // update status speaker, again
    // ref: https://stackoverflow.com/questions/41762392/what-happens-with-onaudiofocuschange-when-a-phone-call-ends
    if (Platform.OS === 'android') {
      IncallManager.start()
      BackgroundTimer.setTimeout(() => {
        IncallManager.setForceSpeakerphoneOn(callStore.isLoudSpeakerEnabled)
      }, 2000)
    }

    const currentCall = callStore.getCurrentCall()
    currentCall && sip.enableMedia(currentCall.id)
  }
  render() {
    return null
  }
}
// fix for web: Can't resolve 'react-native/Libraries/Image/resolveAssetSource'
export const VideoRBT = (p: { isPaused: boolean; isLoudSpeaker: boolean }) => {
  const [pauseVideo, setPauseVideo] = useState(true)

  useEffect(() => {
    if (!p.isPaused) {
      if (p.isLoudSpeaker) {
        NativeModules.PlayRBT.stop()
        setPauseVideo(false)
      } else {
        setPauseVideo(true)
        NativeModules.PlayRBT.play()
      }
    } else {
      if (p.isLoudSpeaker) {
        setPauseVideo(true)
      } else {
        NativeModules.PlayRBT.stop()
      }
    }
    return () => {
      NativeModules.PlayRBT.stop()
    }
  }, [p.isLoudSpeaker, p.isPaused])

  return (
    <Video
      source={require('../assets/incallmanager_ringback.mp3')}
      style={css.video}
      paused={pauseVideo}
      repeat={true}
      ignoreSilentSwitch={'ignore'}
      playInBackground={true}
      audioOnly
    />
  )
}
