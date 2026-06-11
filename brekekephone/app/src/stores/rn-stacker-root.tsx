import { View } from '@rntwsc/rn/core/components/view'
import { observer } from 'mobx-react'
import type { ReactComponentLike } from 'prop-types'
import type { FC } from 'react'

import { AnimatedView } from '#/components/rn-class-name-components'
import { RnStacker } from '#/stores/rn-stacker'
import { useAnimationOnDidMount } from '#/utils/animation'
import { useWindowDimensions } from '#/utils/rn-core-hooks'

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
      style={{
        transform: [x],
      }}
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
