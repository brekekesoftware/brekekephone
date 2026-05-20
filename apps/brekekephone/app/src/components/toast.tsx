import type { FC } from 'react'
import { useEffect, useState } from 'react'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { RnText } from '#/components/rn'
import { AnimatedView } from '#/components/rn-animated'

type ToastProps = {
  title: string
  isVisible?: boolean
  duration?: number
  containerClassName?: ClassName
  containerMarginTop?: number
}

const MAX_LENGTH_TEXT = 50

export const Toast: FC<ToastProps> = ({
  title,
  isVisible,
  containerClassName,
  containerMarginTop,
}: ToastProps) => {
  const [phase, setPhase] = useState<'hidden' | 'shown' | 'fading'>('hidden')
  const validTitle =
    title.length > MAX_LENGTH_TEXT
      ? `${title.substring(0, MAX_LENGTH_TEXT)}...`
      : title

  useEffect(() => {
    if (!isVisible) {
      setPhase('hidden')
      return
    }
    setPhase('shown')
    const id = requestAnimationFrame(() => setPhase('fading'))
    return () => cancelAnimationFrame(id)
  }, [isVisible])

  const mtCls =
    containerMarginTop !== undefined ? `mt-[${containerMarginTop}px]` : ''

  return (
    <View
      className={[
        'absolute right-0 left-0 top-2.5 justify-center',
        mtCls,
        containerClassName,
      ]}
    >
      <AnimatedView
        className={[
          'px-1.25 pt-1 pb-1.25',
          phase === 'fading' && 'transition-opacity duration-3000',
          phase === 'shown' ? 'opacity-100' : 'opacity-0',
        ]}
      >
        <RnText normal white>
          {validTitle}
        </RnText>
      </AnimatedView>
    </View>
  )
}
