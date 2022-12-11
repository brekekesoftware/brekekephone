import 'react-native-get-random-values'
import './shared'

import {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc'

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
