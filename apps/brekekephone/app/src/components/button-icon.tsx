import type { FC } from 'react'
import { useState } from 'react'
import Svg, { Path } from 'react-native-svg'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { v } from '#/components/variables'
import { BackgroundTimer } from '#/utils/background-timer'

// Map theme hex values caller passes back to tw class names
const bgClass: { [k: string]: string } = {
  [v.colors.primary]: 'bg-primary',
  [v.colors.danger]: 'bg-error',
  [v.colors.warning]: 'bg-warning',
  [v.subColor]: 'bg-foreground-muted',
  [v.borderBg]: 'bg-border',
  white: 'bg-background',
  black: 'bg-foreground',
}
const bdClass: { [k: string]: string } = {
  [v.colors.primary]: 'border-primary',
  [v.colors.danger]: 'border-error',
  [v.colors.warning]: 'border-warning',
  [v.borderBg]: 'border-border',
}

export const ButtonIcon: FC<{
  color: string
  path: string
  size?: number
  disabled?: boolean
  onPress?(): void
  className?: ClassName
  bgcolor?: string
  noborder?: boolean
  bdcolor?: string
  name?: string
  textcolor?: string
  containerClassName?: ClassName
  msLoading?: number
  loading?: boolean
}> = p => {
  const [isLoading, setLoading] = useState(false)
  const onBtnPress = () => {
    if (p.msLoading) {
      setLoading(true)
      BackgroundTimer.setTimeout(() => {
        // TODO: possible react warning memory leak set state after unmount
        setLoading(false)
      }, p.msLoading)
    }
    p.onPress?.()
  }
  const size = p.size || 15
  const spinnerSizeCls = `w-[${size}px] h-[${size}px]`
  const bg = p?.disabled ? v.subColor : p.bgcolor
  return (
    <View className={['mx-1.25 items-center', p.containerClassName]}>
      <RnTouchableOpacity
        disabled={isLoading || p.loading || p.disabled}
        onPress={onBtnPress}
        className={[
          'rounded-full border p-3',
          p.noborder && 'border-0',
          bg && bgClass[bg],
          p.bdcolor && bdClass[p.bdcolor],
          p.className,
        ]}
      >
        {isLoading || p.loading ? (
          <RnActivityIndicator className={spinnerSizeCls} />
        ) : (
          <Svg height={size} viewBox='0 0 24 24' width={size}>
            <Path d={p.path} fill={p.color || 'black'} />
          </Svg>
        )}
      </RnTouchableOpacity>
      {p.name && (
        <RnText
          small
          center
          white={p.textcolor === 'white'}
          black={p.textcolor === 'black'}
          className='ios:min-w-17.5 min-w-20 pt-1.25'
        >
          {p.name}
        </RnText>
      )}
    </View>
  )
}
