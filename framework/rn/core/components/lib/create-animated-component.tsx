import type { TextStyle, ViewStyle } from 'react-native'
import type { CSSTransitionProperties } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'

import { set } from '@/shared/lodash'

type Options = {
  passWrapperStyleToProps?: boolean
}

// reanimated only support some components
// we need a custom wrapper view where it doesnt support
export const createAnimatedComponent =
  (Component: any, options?: Options) =>
  ({ style, reanimatedStyle, ...props }: any) => {
    const wrapperStyle: ViewStyle & CSSTransitionProperties = {
      overflow: 'hidden',
    }
    const innerStyle: TextStyle = {
      width: '100%',
      borderWidth: 0,
      backgroundColor: 'transparent',
    }

    // style should be guaranteed to present since we already checked isReanimated
    Object.keys(style).forEach(k => {
      if (
        supportedStyleSet.has(k) ||
        supportedPrefixes.some(p => k.startsWith(p))
      ) {
        set(wrapperStyle, k, style[k])
      } else {
        set(innerStyle, k, style[k])
      }
    })

    props.style = innerStyle
    if (options?.passWrapperStyleToProps) {
      props.wrapperStyle = wrapperStyle
    }

    return (
      <Animated.View style={[wrapperStyle, reanimatedStyle]}>
        <Component {...props} />
      </Animated.View>
    )
  }

const supportedPrefixes: string[] = [
  'margin',
  'border',
  'transform',
  'translate',
  'scale',
  'transition',
  'animation',
]
const supportedStyle: (keyof ViewStyle)[] = [
  'width',
  'height',
  'backgroundColor',
  'opacity',
  'rotation',
]
const supportedStyleSet = new Set<string>(supportedStyle)
