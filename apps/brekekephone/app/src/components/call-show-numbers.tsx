import type { FC, RefObject } from 'react'
import type {
  NativeSyntheticEvent,
  TextInput,
  TextInputSelectionChangeEventData,
} from 'react-native'
import { Keyboard } from 'react-native'

import { View } from '@/rn/core/components/view'
import { RnTextInput } from '#/components/rn'
import { intl } from '#/stores/intl'

export const ShowNumber: FC<{
  setTarget(v: string): void
  selectionChange?(
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ): void
  refInput: RefObject<TextInput | null>
  value: string
}> = p => (
  <View className='flex-row'>
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
      className='w-full p-3.75 text-2xl'
      value={p.value}
    />
  </View>
)
