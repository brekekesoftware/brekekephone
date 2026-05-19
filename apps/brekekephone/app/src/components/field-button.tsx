import type { FC } from 'react'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { mdiKeyboardBackspace } from '#/assets/icons'
import { Field } from '#/components/field'
import { RnTouchableOpacity } from '#/components/rn'
import { isAndroid } from '#/config'

// Platform-conditional top offsets — runtime constants (Platform.OS fixed per build)
const innerClassName = isAndroid ? 'top-0.25' : '-top-1.25' // android top:1, default top:-5
const createBtnClassName = isAndroid ? 'top-2' : 'top-3.75' // android top:8, default top:15

export const FieldButton: FC<
  Partial<{
    className: ClassName
    onCreateBtnPress(): void
    label: string
    value: string
    textInputClassName?: ClassName
    disabled?: boolean
  }>
> = p0 => {
  const { className, ...p } = p0
  return (
    <RnTouchableOpacity
      onPress={p.onCreateBtnPress}
      className={[
        'self-center mt-3.75 px-2.5 min-w-76.25 max-w-90 rounded-[3px] overflow-hidden',
        p.disabled ? 'bg-[#f0f0f0]' : 'bg-background',
        className,
      ]}
      disabled={p.disabled}
    >
      <View className={innerClassName}>
        <Field
          {...p}
          createBtnIcon={mdiKeyboardBackspace}
          createBtnIconClassName='rotate-180'
          createBtnClassName={createBtnClassName}
          transparent
          disabled={p.disabled}
        />
      </View>
    </RnTouchableOpacity>
  )
}
