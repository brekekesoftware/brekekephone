import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { RnCheckBox } from './RnCheckbox'
import { RnText } from './RnText'

const css = StyleSheet.create({
  SelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  }
> = ({ isSelected, title, onPress, style, ...p }) => (
  <View {...p} style={[css.SelectionItem, style]}>
    <RnCheckBox isSelected={isSelected} onPress={onPress} />
    <RnText style={css.SelectionItem_Title}>{title}</RnText>
  </View>
)
