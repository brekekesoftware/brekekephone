import type { FC, PropsWithChildren } from 'react'
import { useState } from 'react'
import type { ViewProps } from 'react-native'

import { AnimatedView } from '@/rn/core/components/animated'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { useAnimationOnDidMount } from '#/utils/animation'

// the style and innerStyle prop should only be used for positioning and theming
// we should not use them for sizing like height/border/padding... -> use the children instead
export const AnimatedSize: FC<
  ViewProps & {
    animateWidth?: boolean
    innerStyle?: ViewProps['style']
    className?: ClassName
  }
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
  innerStyle?: ViewProps['style']
  size: number
  style?: ViewProps['style']
  className?: ClassName
}) => {
  const { animateWidth, children, className, innerStyle, size, style } = p
  const cssAnimation = useAnimationOnDidMount({
    [animateWidth ? 'width' : 'height']: [0, size],
  })
  return (
    <AnimatedView className={className} style={[style, cssAnimation]}>
      <View className='flex-1 overflow-hidden' style={innerStyle}>
        {children}
      </View>
    </AnimatedView>
  )
}
