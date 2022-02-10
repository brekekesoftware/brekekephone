import React, { FC } from 'react'
import { StyleSheet } from 'react-native'

import { RnText } from './RnText'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

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
}: DropdownItemProps) => {
  return (
    <RnTouchableOpacity
      onPressIn={onPress}
      style={css.container}
      disabled={disabled}
    >
      <RnText style={disabled && css.disableText}>{title}</RnText>
    </RnTouchableOpacity>
  )
}
