import type { FC, RefObject } from 'react'
import type {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native'
import { Keyboard, StyleSheet, View } from 'react-native'

import { intl } from '../stores/intl'
import { RnTextInput } from './Rn'

const css = StyleSheet.create({
  ShowNumbers: {
    flexDirection: 'row',
  },
  ShowNumbers_DisplayTxt: {
    fontSize: 24,
    padding: 15,
    width: '100%',
  },
  ShowNumbers_BtnCall: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 40,
  },
})

export const ShowNumber: FC<{
  setTarget(v: string): void
  selectionChange?(
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ): void
  refInput: RefObject<TextInput | null>
  value: string
}> = p => (
  <View style={css.ShowNumbers}>
    <RnTextInput
      blurOnSubmit
      keyboardType='default'
      multiline
      onChangeText={p.setTarget}
      onEndEditing={() => {
        Keyboard.dismiss()
      }}
      onSelectionChange={p.selectionChange}
      placeholder={intl`Enter your number`}
      ref={p.refInput}
      style={css.ShowNumbers_DisplayTxt}
      value={p.value}
    />
  </View>
)
