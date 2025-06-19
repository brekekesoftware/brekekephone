import { observer } from 'mobx-react'
import type { ReactComponentLike } from 'prop-types'
import type { FC } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import { v } from '#/components/variables'
import { RnStacker } from '#/stores/RnStacker'
import { useAnimationOnDidMount } from '#/utils/animation'

const css = StyleSheet.create({
  Stack: {
    backgroundColor: v.bg,
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

export const RnStackerRoot = observer(() => (
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
