import type { FC } from 'react'
import type { ViewProps } from 'react-native'
import { StyleSheet } from 'react-native'

import { mdiCheck } from '#/assets/icons'
import { RnIcon } from '#/components/RnIcon'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'

const css = StyleSheet.create({
  CheckBoxBtn: {
    height: 22,
    width: 22,
    borderWidth: 2,
    borderRadius: 2,
  },
  CheckBox__selected: {
    backgroundColor: '#333',
    borderWidth: 0,
  },
})

export const RnCheckBox: FC<
  ViewProps & {
    isSelected: boolean
    onPress(): void
    disabled: boolean
  }
> = ({ isSelected, onPress, disabled, style, ...p }) => (
  <RnTouchableOpacity
    {...p}
    onPress={onPress}
    style={[css.CheckBoxBtn, isSelected && css.CheckBox__selected, style]}
    disabled={disabled}
  >
    {isSelected && <RnIcon path={mdiCheck} color='white' />}
  </RnTouchableOpacity>
)
