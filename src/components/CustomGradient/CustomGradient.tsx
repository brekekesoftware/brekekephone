import React, { FC } from 'react'
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient'

import CustomColors from '../../utils/CustomColors'
import styles from './Styles'

const CustomGradient: FC<Omit<LinearGradientProps, 'colors'>> = props => (
  <LinearGradient
    {...props}
    colors={[CustomColors.White, CustomColors.AliceBlue]}
    locations={[0, 0.3, 0.9]}
    style={[styles.CustomGradient, props.style]}
  />
)

export default CustomGradient
