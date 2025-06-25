import 'react-native-get-random-values'
import '#/polyfill/shared'

import { View } from 'react-native'
import BgTimer from 'react-native-background-timer'
import {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc'

// fix error viewPropTypes for keyboard-spacer
if (
  !View.hasOwnProperty('propTypes') &&
  !('ViewPropTypes' in require('react-native'))
) {
  require('react-native').ViewPropTypes = {}
}

window.URL = window.URL || {}
// @ts-ignore
window.URL.createObjectURL = (stream: MediaStream) => stream.toURL()

window.RTCPeerConnection = window.RTCPeerConnection || RTCPeerConnection
window.RTCIceCandidate = window.RTCIceCandidate || RTCIceCandidate
window.RTCSessionDescription =
  window.RTCSessionDescription || RTCSessionDescription
window.MediaStream = window.MediaStream || MediaStream
window.MediaStreamTrack = window.MediaStreamTrack || MediaStreamTrack
// @ts-ignore
window.navigator = window.navigator || {}
// @ts-ignore
window.navigator.mediaDevices = window.navigator.mediaDevices || mediaDevices
// @ts-ignore
window.navigator.getUserMedia =
  // @ts-ignore
  window.navigator.getUserMedia || mediaDevices.getUserMedia

// @ts-ignore
window.setTimeout = (f, t) => BgTimer.setTimeout(f, Math.floor(t) || 0)
window.clearTimeout = id => BgTimer.clearTimeout(id)
// @ts-ignore
window.setInterval = (f, t) => BgTimer.setInterval(f, Math.floor(t) || 0)
window.clearInterval = id => BgTimer.clearInterval(id)
