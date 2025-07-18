import type { FC } from 'react'
import type { ViewProps } from 'react-native'
import { StyleSheet } from 'react-native'

import { RnCheckBox } from '#/components/RnCheckbox'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'

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
> = ({ isSelected, title, onPress, disabled = false, style, ...p }) => (
  <RnTouchableOpacity
    {...p}
    style={[css.SelectionItem, disabled && css.SelectionItem_Disabled, style]}
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
    <RnText style={css.SelectionItem_Title}>{title}</RnText>
  </RnTouchableOpacity>
)
