import React, { useState } from 'react'

import { Animated, StyleSheet, View } from '../Rn'
import { useAnimationOnDidMount } from '../utils/animation'

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

// The style and innerStyle prop should only be used for positioning and theming
// We should not use them for sizing like height/border/padding... -> use the children instead
const AnimatedSize = p => {
  const [size, setSize] = useState(0)
  const Component = size ? Animation : Getter
  return <Component {...p} setSize={setSize} size={size} />
}

const Getter = ({ animateWidth, children, setSize }) => (
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
const Animation = ({ animateWidth, children, innerStyle, size, style }) => {
  const cssAnimation = useAnimationOnDidMount({
    [animateWidth ? 'width' : 'height']: [0, size],
  })
  return (
    <Animated.View style={[style, cssAnimation]}>
      <View style={[css.Inner, innerStyle]}>{children}</View>
    </Animated.View>
  )
}

export default AnimatedSize
