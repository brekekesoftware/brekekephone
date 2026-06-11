import { View } from '@rntwsc/rn/core/components/view'
import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import type { FC, PropsWithChildren } from 'react'
import { useState } from 'react'

import { AnimatedView } from '#/components/rn-class-name-components'
import { useAnimationOnDidMount } from '#/utils/animation'

// className: positioning + outer styling on the animated wrapper.
// innerClassName: theming/sizing on inner content wrapper.
export const AnimatedSize: FC<
  PropsWithChildren<{
    animateWidth?: boolean
    innerClassName?: ClassName
    className?: ClassName
  }>
> = p => {
  const [size, setSize] = useState(0)
  const Component = size ? Animation : Getter
  return <Component {...p} setSize={setSize} size={size} />
}

const Getter = (p: {
  animateWidth?: boolean
  children?: PropsWithChildren<{}>['children']
  setSize: Function
}) => {
  const { animateWidth, children, setSize } = p
  return (
    <View className='opacity-0'>
      <View
        onLayout={e =>
          setSize(e.nativeEvent.layout[animateWidth ? 'width' : 'height'])
        }
        className='absolute'
      >
        {children}
      </View>
    </View>
  )
}
const Animation = (p: {
  animateWidth?: boolean
  children?: PropsWithChildren<{}>['children']
  innerClassName?: ClassName
  size: number
  className?: ClassName
}) => {
  const { animateWidth, children, className, innerClassName, size } = p
  const cssAnimation = useAnimationOnDidMount({
    [animateWidth ? 'width' : 'height']: [0, size],
  })
  return (
    <AnimatedView className={className} style={cssAnimation}>
      <View className={['flex-1 overflow-hidden', innerClassName]}>
        {children}
      </View>
    </AnimatedView>
  )
}
