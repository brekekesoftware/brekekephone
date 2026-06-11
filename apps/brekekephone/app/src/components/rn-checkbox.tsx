import type { FC } from 'react'
import type { ViewProps } from 'react-native'

import type { ClassName } from '@/rn/core/tw/class-name'
import { mdiCheck } from '#/assets/icons'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'

export const RnCheckBox: FC<
  Omit<ViewProps, 'style'> & {
    isSelected: boolean
    onPress(): void
    disabled: boolean
    className?: ClassName
  }
> = ({ isSelected, onPress, disabled, className, ...p }) => (
  <RnTouchableOpacity
    {...p}
    onPress={onPress}
    className={[
      'border-foreground h-5.5 w-5.5 rounded-sm border-2',
      isSelected && 'border-foreground',
      className,
    ]}
    disabled={disabled}
  >
    {isSelected && (
      <RnIcon
        path={mdiCheck}
        className='text-foreground h-5.5 w-5.5 self-center pb-1'
      />
    )}
  </RnTouchableOpacity>
)
