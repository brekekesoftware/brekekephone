import type { FC } from 'react'
import { RnCheckBox } from '#/components/rn-checkbox'
import { RnText } from '#/components/rn-text'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'

export const SelectionItem: FC<{
  isSelected: boolean
  onPress(): void
  title: string
  disabled?: boolean
}> = ({ isSelected, title, onPress, disabled = false }) => (
  <RnTouchableOpacity
    className={['flex-row items-center my-1.25', disabled && 'opacity-50']}
    onPress={() => {
      if (!disabled) {
        onPress()
      }
    }}
  >
    <RnCheckBox
      isSelected={isSelected}
      onPress={() => {
        if (!disabled) {
          onPress()
        }
      }}
      disabled={disabled}
    />
    <RnText className='ml-3'>{title}</RnText>
  </RnTouchableOpacity>
)
