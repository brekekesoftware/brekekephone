import type { FC, PropsWithChildren } from 'react'
import { useState } from 'react'
import type { ViewProps } from 'react-native'
import { Animated, StyleSheet, View } from 'react-native'

import { useAnimationOnDidMount } from '#/utils/animation'

const css = StyleSheet.create({
  Getter: {
    opacity: 0,
  },
  GetterInner: {
    position: 'absolute',
  },
  Inner: {
    flex: 1,
    overflow: 'hidden',
  },
})

// the style and innerStyle prop should only be used for positioning and theming
// we should not use them for sizing like height/border/padding... -> use the children instead
export const AnimatedSize: FC<
  ViewProps & {
    animateWidth?: boolean
    innerStyle?: ViewProps['style']
  }
> = p => {
  const [size, setSize] = useState(0)
  const Component = size ? Animation : Getter
  return <Component {...p} setSize={setSize} size={size} />
}

const Getter = (p: {
  animateWidth?: boolean
  children?: PropsWithChildren<{}>['children']
  setSize: Function
}) => {
  const { animateWidth, children, setSize } = p
  return (
    <View style={css.Getter}>
      <View
        onLayout={e =>
          setSize(e.nativeEvent.layout[animateWidth ? 'width' : 'height'])
        }
        style={css.GetterInner}
      >
        {children}
      </View>
    </View>
  )
}
const Animation = (p: {
  animateWidth?: boolean
  children?: PropsWithChildren<{}>['children']
  innerStyle?: ViewProps['style']
  size: number
  style?: ViewProps['style']
}) => {
  const { animateWidth, children, innerStyle, size, style } = p
  const cssAnimation = useAnimationOnDidMount({
    [animateWidth ? 'width' : 'height']: [0, size],
  })
  return (
    <Animated.View style={[style, cssAnimation]}>
      <View style={[css.Inner, innerStyle]}>{children}</View>
    </Animated.View>
  )
}
