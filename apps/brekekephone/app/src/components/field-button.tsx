import type { FC } from 'react'
import type { TextInputProps, TouchableOpacityProps } from 'react-native'
import { Platform } from 'react-native'

import { View } from '@/rn/core/components/view'
import { mdiKeyboardBackspace } from '#/assets/icons'
import { Field } from '#/components/field'
import { RnTouchableOpacity } from '#/components/rn'

const innerStyle = Platform.select({
  android: { top: 1 },
  default: { top: -5 },
})
const createBtnStyle = Platform.select({
  android: { top: 8 },
  default: { top: 15 },
})
const createBtnIconStyle = {
  transform: [{ rotate: '180deg' }],
}

export const FieldButton: FC<
  Partial<{
    style: TouchableOpacityProps['style']
    onCreateBtnPress(): void
    label: string
    value: string
    textInputStyle?: TextInputProps['style']
    disabled?: boolean
  }>
> = p0 => {
  const { style, ...p } = p0
  return (
    <RnTouchableOpacity
      onPress={p.onCreateBtnPress}
      className={[
        'self-center mt-3.75 px-2.5 min-w-76.25 max-w-90 rounded-[3px] overflow-hidden',
        p.disabled ? 'bg-[#f0f0f0]' : 'bg-background',
      ]}
      style={style}
      disabled={p.disabled}
    >
      <View style={innerStyle}>
        <Field
          {...p}
          createBtnIcon={mdiKeyboardBackspace}
          createBtnIconStyle={createBtnIconStyle}
          createBtnStyle={createBtnStyle}
          transparent
          disabled={p.disabled}
        />
      </View>
    </RnTouchableOpacity>
  )
}
