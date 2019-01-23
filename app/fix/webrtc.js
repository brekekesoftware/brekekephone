import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, getUserMedia } from 'react-native-webrtc'

window.RTCPeerConnection = window.RTCPeerConnection || RTCPeerConnection
window.navigator.getUserMedia = window.navigator.getUserMedia || getUserMedia
window.navigator.mediaDevices = window.navigator.mediaDevices || {
  getUserMedia,
}
window.RTCSessionDescription = window.RTCSessionDescription || RTCSessionDescription
window.RTCIceCandidate = window.RTCIceCandidate || RTCIceCandidate
