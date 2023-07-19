import { Component, useEffect } from 'react'
import { Platform, StyleSheet } from 'react-native'
import IncallManager from 'react-native-incall-manager'
import Video from 'react-native-video'

import { sip } from '../api/sip'
import { getCallStore } from '../stores/callStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
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
    const { ongoingCallId } = getCallStore()
    if (ongoingCallId) {
      sip.disableMedia(ongoingCallId)
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
    const { ongoingCallId } = getCallStore()
    if (ongoingCallId) {
      sip.enableMedia(ongoingCallId)
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
    // update status speaker, again
    // ref: https://stackoverflow.com/questions/41762392/what-happens-with-onaudiofocuschange-when-a-phone-call-ends
    // if (Platform.OS === 'android') {
    //   IncallManager.start()
    //   BackgroundTimer.setTimeout(() => {
    //     IncallManager.setForceSpeakerphoneOn(
    //       getCallStore().isLoudSpeakerEnabled,
    //     )
    //   }, 2000)
    // }
    const oc = getCallStore().getOngoingCall()
    if (oc) {
      sip.enableMedia(oc.id)
    }
  }
  render() {
    return null
  }
}

// fix for web: Can't resolve 'react-native/Libraries/Image/resolveAssetSource'
export const VideoRBT = (p: { withSDP: boolean; isLoudSpeaker: boolean }) => {
  useEffect(() => {
    if (!p.withSDP && !p.isLoudSpeaker) {
      BrekekeUtils.playRBT()
    }
    return () => BrekekeUtils.stopRBT()
  }, [p.isLoudSpeaker, p.withSDP])
  const paused =
    (!p.withSDP && !p.isLoudSpeaker) || (p.withSDP && p.isLoudSpeaker)
  return (
    <Video
      source={require('../assets/incallmanager_ringback.mp3')}
      style={css.video}
      paused={paused}
      repeat={true}
      ignoreSilentSwitch='ignore'
      playInBackground={true}
      audioOnly
    />
  )
}
