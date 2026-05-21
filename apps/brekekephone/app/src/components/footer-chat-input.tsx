import type { FC } from 'react'
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native'

import { View } from '@/rn/core/components/view'
import { mdiEmoticon, mdiPaperclip, mdiSend } from '#/assets/icons'
import { RnIcon, RnTextInput, RnTouchableOpacity } from '#/components/rn'

export const ChatInput: FC<{
  onEmojiTurnOn?(): void
  onSelectionChange?(
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ): void
  onTextChange(txt: string): void
  onTextSubmit(): void
  openFileRnPicker(): void
  text: string
}> = p => {
  const {
    onEmojiTurnOn,
    onSelectionChange,
    onTextChange,
    onTextSubmit,
    openFileRnPicker,
    text,
  } = p
  return (
    <View className='flex-1 flex-row'>
      <RnTouchableOpacity
        onPress={openFileRnPicker}
        className='bg-muted border-border w-12.5 border-t border-r border-b py-2'
      >
        <RnIcon path={mdiPaperclip} size={20} />
      </RnTouchableOpacity>
      <RnTouchableOpacity
        onPress={onEmojiTurnOn}
        className='bg-muted border-border w-12.5 border-t border-r border-b py-2'
      >
        <RnIcon color='gray' path={mdiEmoticon} />
      </RnTouchableOpacity>
      <RnTextInput
        blurOnSubmit={false}
        onChangeText={onTextChange}
        onSelectionChange={onSelectionChange}
        onSubmitEditing={onTextSubmit}
        className='border-border flex-1 border-t border-b px-3 py-2'
        value={text}
      />
      <RnTouchableOpacity
        onPress={onTextSubmit}
        className='bg-primary w-12.5 py-2 pl-2'
      >
        <RnIcon color='white' path={mdiSend} />
      </RnTouchableOpacity>
    </View>
  )
}
