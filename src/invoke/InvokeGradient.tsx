import { FC } from 'react'
import { StyleSheet } from 'react-native'
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient'

const css = StyleSheet.create({
  BrekekeGradient: {
    height: '100%',
    minHeight: 550,
  },
})

export type InvokeGradientProps = Omit<LinearGradientProps, 'colors'> & {
  white?: boolean
}
export const InvokeGradient: FC<InvokeGradientProps> = props => (
  <LinearGradient
    {...props}
    colors={[
      'rgb(0,13,56)',
      'rgb(0,50,99)',
      'rgb(0,100,154)',
      'rgb(0,126,182)',
    ]}
    style={[css.BrekekeGradient, props.style]}
  />
)
