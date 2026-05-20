import { observer } from 'mobx-react'
import type { ReactComponentLike } from 'prop-types'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Dimensions } from 'react-native'

import { View } from '@/rn/core/components/view'
import { AnimatedView } from '#/components/rn-animated'
import { isWeb } from '#/config'
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
  // off-screen start = full screen width. Android native can't cast a
  // percentage translate string ('100%') to double, so use numeric px there;
  // web keeps the % utility (tailwind resolves it at build time).
  const offscreenX = isWeb
    ? 'translate-x-full'
    : `translate-x-[${Dimensions.get('screen').width}px]`
  return (
    <AnimatedView
      className={[
        'absolute inset-0 bg-background transition-transform duration-500',
        p.isBackgroundStack && 'opacity-0',
        mounted ? 'translate-x-0' : offscreenX,
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
