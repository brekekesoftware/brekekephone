import { observer } from 'mobx-react'
import type { ReactComponentLike } from 'prop-types'
import type { FC } from 'react'
import { Animated, Dimensions } from 'react-native'

import { View } from '@/rn/core/components/view'
import { v } from '#/components/variables'
import { RnStacker } from '#/stores/rn-stacker'
import { useAnimationOnDidMount } from '#/utils/animation'

const Stack: FC<{
  Component: ReactComponentLike
  isRoot?: boolean
  isBackgroundStack: boolean
}> = ({ Component, ...p }) => {
  const x = useAnimationOnDidMount({
    translateX: [Dimensions.get('screen').width, 0],
  })
  if (p.isRoot) {
    return (
      <View
        className={['absolute inset-0', p.isBackgroundStack && 'opacity-0']}
        style={{ backgroundColor: v.bg }}
      >
        <Component {...p} />
      </View>
    )
  }
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: v.bg,
        opacity: p.isBackgroundStack ? 0 : 1,
        transform: [x],
      }}
    >
      <Component {...p} />
    </Animated.View>
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
