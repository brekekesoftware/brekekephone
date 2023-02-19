import { Component, useEffect, useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import IncallManager from 'react-native-incall-manager'
import Video from 'react-native-video'

import { sip } from '../api/sip'
import { getCallStore } from '../stores/callStore'
import { BrekekeUtils } from '../utils/RnNativeModules'

const css = StyleSheet.create({
  video: {
    width: 0,
    height: 0,
  },
})
export class IncomingItem extends Component {
  async componentDidMount() {
    if (Platform.OS === 'android') {
      BrekekeUtils.startRingtone()
    } else {
      IncallManager.startRingtone('_BUNDLE_')
    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BrekekeUtils.stopRingtone()
    } else {
      IncallManager.stopRingtone()
    }
  }
  render() {
    return null
  }
}

export class OutgoingItem extends Component {
  componentDidMount = () => {
    const currentCall = getCallStore().getCurrentCall()
    if (currentCall) {
      sip.disableMedia(currentCall.id)
    }
    if (Platform.OS === 'android') {
      IncallManager.startRingback('_BUNDLE_')
    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'android') {
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
    const currentCall = getCallStore().getCurrentCall()
    if (currentCall) {
      sip.enableMedia(currentCall.id)
    }
  }
  render() {
    return null
  }
}
export class AnsweredItem extends Component<{
  voiceStreamObject: MediaStream | null
}> {
  componentDidMount = () => {
    const currentCall = getCallStore().getCurrentCall()
    if (currentCall) {
      sip.enableMedia(currentCall.id)
    }
  }
  render() {
    return null
  }
}

// fix for web: Can't resolve 'react-native/Libraries/Image/resolveAssetSource'
export const VideoRBT = (p: { isPaused: boolean; isLoudSpeaker: boolean }) => {
  const [paused, setPaused] = useState(true)
  useEffect(() => {
    if (!p.isPaused) {
      if (p.isLoudSpeaker) {
        BrekekeUtils.stopRBT()
        setPaused(false)
      } else {
        setPaused(true)
        BrekekeUtils.playRBT()
      }
    } else {
      if (p.isLoudSpeaker) {
        setPaused(true)
      } else {
        BrekekeUtils.stopRBT()
        setPaused(false)
      }
    }
    return () => {
      BrekekeUtils.stopRBT()
    }
  }, [p.isLoudSpeaker, p.isPaused])
  return (
    <Video
      source={require('../assets/incallmanager_ringback.mp3')}
      style={css.video}
      paused={paused}
      repeat={true}
      ignoreSilentSwitch={'ignore'}
      playInBackground={true}
      audioOnly
    />
  )
}
