import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, getUserMedia } from 'react-native-webrtc'

window.RTCPeerConnection = window.RTCPeerConnection || RTCPeerConnection
navigator.getUserMedia = navigator.getUserMedia || getUserMedia
window.RTCSessionDescription = window.RTCSessionDescription || RTCSessionDescription
window.RTCIceCandidate = window.RTCIceCandidate || RTCIceCandidate
