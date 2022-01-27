import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { RnCheckBox } from './RnCheckbox'
import { RnText } from './RnText'

const css = StyleSheet.create({
  SelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  SelectionItem_Disabled: {
    opacity: 0.5,
  },
  SelectionItem_Title: {
    marginLeft: 12,
  },
})

export const SelectionItem: FC<
  ViewProps & {
    isSelected: boolean
    onPress(): void
    title: string
    disabled?: boolean
  }
> = ({ isSelected, title, onPress, disabled, style, ...p }) => (
  <View
    {...p}
    style={[css.SelectionItem, disabled && css.SelectionItem_Disabled, style]}
  >
    <RnCheckBox
      isSelected={isSelected}
      onPress={onPress}
      disabled={disabled || false}
    />
    <RnText style={css.SelectionItem_Title}>{title}</RnText>
  </View>
)
