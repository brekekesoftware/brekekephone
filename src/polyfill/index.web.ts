import './dev'
import './shared'

import PropTypes from 'prop-types'
import * as Rn from 'react-native'

// @ts-ignore
const Rn0 = Rn as { [k: string]: { [k: string]: unknown } }

// Fix error in react-native-keyboard-spacer
Rn0.ViewPropTypes = Rn0.ViewPropTypes || {}
// Fix error in react-native-hyperlink
Rn0.Text.propTypes = Rn0.Text.propTypes || { style: PropTypes.any }

// window.navigator.getUserMedia is not a function
// @ts-ignore
window.navigator.getUserMedia =
  // @ts-ignore
  window.navigator.getUserMedia ||
  window.navigator.mediaDevices.getUserMedia ||
  // @ts-ignore
  navigator.mozGetUserMedia
