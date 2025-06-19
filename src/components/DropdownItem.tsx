import type { FC } from 'react'
import { StyleSheet } from 'react-native'

import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'

export type DropdownItemProps = {
  title?: string
  onPress?: () => void
  disabled?: boolean
}

const css = StyleSheet.create({
  container: {
    paddingVertical: 5,
  },
  disableText: {
    color: v.colors.greyTextChat,
  },
})

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
    <RnText style={disabled && css.disableText}>{title}</RnText>
  </RnTouchableOpacity>
)
