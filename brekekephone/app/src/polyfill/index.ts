import 'rntwsc/tw/polyfill/react-native-web'
import 'rntwsc/tw/polyfill/react-native-web-enhancer'
import '@/polyfill/dev'
import '@/polyfill/shared'

// window.navigator.getUserMedia is not a function
// @ts-ignore
window.navigator.getUserMedia =
  // @ts-ignore
  window.navigator.getUserMedia ||
  window.navigator.mediaDevices.getUserMedia ||
  // @ts-ignore
  navigator.mozGetUserMedia
