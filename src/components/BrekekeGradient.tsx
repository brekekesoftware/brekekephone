import { FC } from 'react'
import { StyleSheet } from 'react-native'
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient'

import { v } from './variables'

const css = StyleSheet.create({
  BrekekeGradient: {
    height: '100%',
    minHeight: 550,
  },
})

export type BrekekeGradientProps = Omit<LinearGradientProps, 'colors'> & {
  white?: boolean
}
export const BrekekeGradient: FC<BrekekeGradientProps> = props => (
  <LinearGradient
    {...props}
    colors={
      props.white ? ['white', 'white'] : [v.colors.primaryFn(0.2), v.revBg]
    }
    style={[css.BrekekeGradient, props.style]}
  />
)
