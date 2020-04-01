import './shared';

import PropTypes from 'prop-types';
import * as Rn from 'react-native';

Rn.ViewPropTypes = Rn.ViewPropTypes || {}; // Fix error in react-native-keyboard-spacer
Rn.Text.propTypes = Rn.Text.propTypes || { style: PropTypes.any }; // Fix error in react-native-hyperlink
