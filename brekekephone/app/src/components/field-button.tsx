import { View } from '@rntwsc/rn/core/components/view'
import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import { tw } from '@rntwsc/rn/core/tw/tw'
import type { FC } from 'react'

import { mdiKeyboardBackspace } from '#/assets/icons'
import { Field } from '#/components/field'
import { RnTouchableOpacity } from '#/components/rn'

const innerClassName = tw`android:top-0.25 -top-1.25`
const createBtnClassName = tw`android:top-2 top-3.75`

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
        'rounded-card mt-3.75 max-w-90 min-w-76.25 self-center overflow-hidden px-2.5',
        p.disabled ? 'bg-muted' : 'bg-background',
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
