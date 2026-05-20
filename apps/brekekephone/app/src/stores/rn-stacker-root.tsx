import { observer } from 'mobx-react'
import type { ReactComponentLike } from 'prop-types'
import type { FC } from 'react'
import { useEffect, useState } from 'react'

import { View } from '@/rn/core/components/view'
import { AnimatedView } from '#/components/rn-animated'
import { RnStacker } from '#/stores/rn-stacker'

const Stack: FC<{
  Component: ReactComponentLike
  isRoot?: boolean
  isBackgroundStack: boolean
}> = ({ Component, ...p }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (p.isRoot) {
    return (
      <View
        className={[
          'absolute inset-0 bg-background',
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
        'absolute inset-0 bg-background transition-transform duration-150',
        p.isBackgroundStack && 'opacity-0',
        mounted ? 'translate-x-0' : 'translate-x-full',
      ]}
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
