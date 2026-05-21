import { observer } from 'mobx-react'
import type { ReactComponentLike } from 'prop-types'
import type { FC } from 'react'
import { useWindowDimensions } from 'react-native'

import { View } from '@/rn/core/components/view'
import { AnimatedView } from '#/components/rn-animated'
import { RnStacker } from '#/stores/rn-stacker'
import { useAnimationOnDidMount } from '#/utils/animation'

const Stack: FC<{
  Component: ReactComponentLike
  isRoot?: boolean
  isBackgroundStack: boolean
}> = ({ Component, ...p }) => {
  const { width } = useWindowDimensions()
  const x = useAnimationOnDidMount({
    translateX: [width, 0],
  })
  if (p.isRoot) {
    return (
      <View
        className={[
          'bg-background absolute inset-0',
          p.isBackgroundStack && 'opacity-0',
        ]}
      >
        <Component {...p} />
      </View>
    )
  }
  return (
    <AnimatedView
      className={[
        'bg-background absolute inset-0',
        p.isBackgroundStack && 'opacity-0',
      ]}
      style={{ transform: [x] }}
    >
      <Component {...p} />
    </AnimatedView>
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
