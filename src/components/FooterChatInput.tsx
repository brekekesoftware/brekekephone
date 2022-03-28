import { FC } from 'react'
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native'

import { mdiEmoticon, mdiPaperclip, mdiSend } from '../assets/icons'
import { RnIcon, RnTextInput, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  ChatInput: {
    flex: 1,
    flexDirection: 'row',
  },
  Btn: {
    width: 50,
    paddingVertical: 8,
  },
  Btn__file: {
    backgroundColor: v.hoverBg,
    borderRightWidth: 1,
    borderColor: v.borderBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  Btn__emoji: {
    backgroundColor: v.hoverBg,
    borderRightWidth: 1,
    borderColor: v.borderBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  Btn__send: {
    backgroundColor: v.colors.primary,
    paddingLeft: 8,
  },
  Input: {
    flex: 1,
    // lineHeight: g.iconSize,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: v.borderBg,
  },
})

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
    <View style={css.ChatInput}>
      <RnTouchableOpacity
        onPress={openFileRnPicker}
        style={[css.Btn, css.Btn__file]}
      >
        <RnIcon path={mdiPaperclip} size={20} />
      </RnTouchableOpacity>
      <RnTouchableOpacity
        onPress={onEmojiTurnOn}
        style={[css.Btn, css.Btn__emoji]}
      >
        <RnIcon color='gray' path={mdiEmoticon} />
      </RnTouchableOpacity>
      <RnTextInput
        blurOnSubmit={false}
        onChangeText={onTextChange}
        onSelectionChange={onSelectionChange}
        onSubmitEditing={onTextSubmit}
        style={css.Input}
        value={text}
      />
      <RnTouchableOpacity
        onPress={onTextSubmit}
        style={[css.Btn, css.Btn__send]}
      >
        <RnIcon color='white' path={mdiSend} />
      </RnTouchableOpacity>
    </View>
  )
}
