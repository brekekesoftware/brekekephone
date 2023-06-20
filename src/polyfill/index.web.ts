import './dev'
import './shared'

import PropTypes from 'prop-types'
import * as Rn from 'react-native'

// @ts-ignore
const R = Rn as { [k: string]: { [k: string]: unknown } }

// Fix error in react-native-keyboard-spacer
R.ViewPropTypes = R.ViewPropTypes || {}
// Fix error in react-native-hyperlink
R.Text.propTypes = R.Text.propTypes || { style: PropTypes.any }

// window.navigator.getUserMedia is not a function
// @ts-ignore
window.navigator.getUserMedia =
  // @ts-ignore
  window.navigator.getUserMedia ||
  window.navigator.mediaDevices.getUserMedia ||
  // @ts-ignore
  navigator.mozGetUserMedia
