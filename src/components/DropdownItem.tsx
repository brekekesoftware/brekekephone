import React, { FC } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export type DropdownItemProps = {
  title?: string
  onPress?: () => void
}

const css = StyleSheet.create({
  container: {
    paddingVertical: 5,
  },
})

export const DropdownItem: FC<DropdownItemProps> = ({
  title,
  onPress,
}: DropdownItemProps) => {
  return (
    <TouchableOpacity onPressIn={onPress} style={css.container}>
      <Text>{title}</Text>
    </TouchableOpacity>
  )
}
