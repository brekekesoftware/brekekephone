import type { FC } from 'react'
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native'

import { View } from '@/rn/core/components/view'
import { mdiEmoticon, mdiPaperclip, mdiSend } from '#/assets/icons'
import { RnIcon, RnTextInput, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'

const inputStyle = {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: v.borderBg,
}

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
        className='w-12.5 py-2 bg-muted border-r border-t border-b border-border'
      >
        <RnIcon path={mdiPaperclip} size={20} />
      </RnTouchableOpacity>
      <RnTouchableOpacity
        onPress={onEmojiTurnOn}
        className='w-12.5 py-2 bg-muted border-r border-t border-b border-border'
      >
        <RnIcon color='gray' path={mdiEmoticon} />
      </RnTouchableOpacity>
      <RnTextInput
        blurOnSubmit={false}
        onChangeText={onTextChange}
        onSelectionChange={onSelectionChange}
        onSubmitEditing={onTextSubmit}
        style={inputStyle}
        value={text}
      />
      <RnTouchableOpacity
        onPress={onTextSubmit}
        className='w-12.5 py-2 pl-2 bg-primary'
      >
        <RnIcon color='white' path={mdiSend} />
      </RnTouchableOpacity>
    </View>
  )
}
