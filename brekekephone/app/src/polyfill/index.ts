import '@rntwsc/rn/core/polyfill/react-native-web'
import '@rntwsc/rn/core/polyfill/react-native-web-client'
import '#/polyfill/dev'
import '#/polyfill/shared'

// window.navigator.getUserMedia is not a function
// @ts-ignore
window.navigator.getUserMedia =
  // @ts-ignore
  window.navigator.getUserMedia ||
  window.navigator.mediaDevices.getUserMedia ||
  // @ts-ignore
  navigator.mozGetUserMedia
