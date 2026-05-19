import type { FC } from 'react'
import { useState } from 'react'
import type { TouchableOpacityProps, ViewProps } from 'react-native'
import { ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { View } from '@/rn/core/components/view'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { isIos } from '#/config'
import { BackgroundTimer } from '#/utils/background-timer'

export const ButtonIcon: FC<{
  color: string
  path: string
  size?: number
  disabled?: boolean
  onPress?(): void
  style?: TouchableOpacityProps['style']
  bgcolor?: string
  noborder?: boolean
  bdcolor?: string
  name?: string
  textcolor?: string
  styleContainer?: ViewProps['style']
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
  return (
    <View className='items-center mx-1.25' style={p.styleContainer}>
      <RnTouchableOpacity
        disabled={isLoading || p.loading || p.disabled}
        onPress={onBtnPress}
        className={['border p-3', p.noborder && 'border-0']}
        style={[
          p.style,
          { borderRadius: size * 1.5 },
          { backgroundColor: p?.disabled ? v.subColor : p.bgcolor },
          { borderColor: p.bdcolor },
        ]}
      >
        {isLoading || p.loading ? (
          <ActivityIndicator style={{ width: size, height: size }} />
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
          className={['pt-1.25', isIos ? 'min-w-17.5' : 'min-w-20']}
        >
          {p.name}
        </RnText>
      )}
    </View>
  )
}
