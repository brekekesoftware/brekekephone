import { observer } from 'mobx-react'
import React from 'react'

import g from '../global'
import { Animated, Dimensions, StyleSheet, View } from '../Rn'
import { useAnimationOnDidMount } from '../utils/animation'

const css = StyleSheet.create({
  Stack: {
    backgroundColor: g.bg,
  },
  Stack__hidden: {
    opacity: 0,
  },
})

const Stack = ({ Component, ...p }) => {
  const x = useAnimationOnDidMount({
    translateX: [Dimensions.get('screen').width, 0],
  })
  const OuterComponent = p.isRoot ? View : Animated.View
  return (
    <OuterComponent
      style={[
        StyleSheet.absoluteFill,
        css.Stack,
        p.isBackgroundStack && css.Stack__hidden,
        !p.isRoot && { transform: [x] },
      ]}
    >
      <Component {...p} />
    </OuterComponent>
  )
}

const RootStacks = observer(() =>
  g.stacks.map((s, i) => (
    <Stack
      isBackgroundStack={
        !(i + 1 === g.stacks.length) &&
        !(i + 2 === g.stacks.length && g.stackAnimating)
      }
      key={i}
      {...s}
    />
  )),
)

export default RootStacks
