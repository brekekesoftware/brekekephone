import { observer } from 'mobx-react'
import { ReactComponentLike } from 'prop-types'
import React, { FC } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import g from '../components/variables'
import { useAnimationOnDidMount } from '../utils/animation'
import RnStacker from './RnStacker'

const css = StyleSheet.create({
  Stack: {
    backgroundColor: g.bg,
  },
  Stack__hidden: {
    opacity: 0,
  },
})

const Stack: FC<{
  Component: ReactComponentLike
  isRoot?: boolean
  isBackgroundStack: boolean
}> = ({ Component, ...p }) => {
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

const RnStackerRoot = observer(() => (
  <>
    {RnStacker.stacks.map((s, i) => (
      <Stack
        isBackgroundStack={
          !(i + 1 === RnStacker.stacks.length) &&
          !(i + 2 === RnStacker.stacks.length && RnStacker.stackAnimating)
        }
        key={i}
        {...s}
      />
    ))}
  </>
))

export default RnStackerRoot
