import './shared'

import PropTypes from 'prop-types'
import * as Rn from 'react-native'

// @ts-ignore
// Fix error in react-native-keyboard-spacer
Rn.ViewPropTypes = Rn.ViewPropTypes || {}
// @ts-ignore
// Fix error in react-native-hyperlink
Rn.Text.propTypes = Rn.Text.propTypes || { style: PropTypes.any }

// window.navigator.getUserMedia is not a function
window.navigator.getUserMedia =
  window.navigator.getUserMedia ||
  window.navigator.mediaDevices.getUserMedia ||
  // @ts-ignore
  navigator.mozGetUserMedia
