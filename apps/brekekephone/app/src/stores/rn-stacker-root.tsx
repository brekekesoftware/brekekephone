import { observer } from 'mobx-react'
import type { ReactComponentLike } from 'prop-types'
import type { FC } from 'react'
import { useEffect, useState } from 'react'

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
  // slide-in only animates on web (native anim disabled). translate-x-full
  // ('100%') is only picked on the web branch, so it never reaches the native
  // transform (Android crashes casting String '100%' to double).
  return (
    <AnimatedView
      className={[
        'absolute inset-0 bg-background transition-transform duration-500',
        p.isBackgroundStack && 'opacity-0',
        isWeb && !mounted ? 'translate-x-full' : 'translate-x-0',
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
