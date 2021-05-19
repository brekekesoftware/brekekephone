import React, { FC } from 'react'
import { StyleSheet } from 'react-native'
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient'

const css = StyleSheet.create({
  CustomGradient: {
    zIndex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
})

const CustomGradient: FC<Omit<LinearGradientProps, 'colors'>> = props => (
  <LinearGradient
    {...props}
    colors={['#FFFFFF', '#E7F3FF']}
    locations={[0, 0.3, 0.9]}
    style={[css.CustomGradient, props.style]}
  />
)

export default CustomGradient
