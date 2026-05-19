import type { FC } from 'react'
import { RnText } from '#/components/rn-text'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'

export type DropdownItemProps = {
  title?: string
  onPress?: () => void
  disabled?: boolean
}

const css = {
  container: {
    paddingVertical: 5,
  },
}

export const DropdownItem: FC<DropdownItemProps> = ({
  title,
  onPress,
  disabled = false,
}: DropdownItemProps) => (
  <RnTouchableOpacity
    onPress={onPress}
    style={css.container}
    disabled={disabled}
  >
    <RnText className={disabled ? 'text-[#9e9e9e]' : undefined}>{title}</RnText>
  </RnTouchableOpacity>
)
