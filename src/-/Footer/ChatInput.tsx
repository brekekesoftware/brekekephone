import { mdiEmoticon, mdiPaperclip, mdiSend } from '@mdi/js'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import g from '../global'
import { RnIcon, RnTextInput, RnTouchableOpacity } from '../Rn'

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
    backgroundColor: g.hoverBg,
    borderRightWidth: 1,
    borderColor: g.borderBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  Btn__emoji: {
    backgroundColor: g.hoverBg,
    borderRightWidth: 1,
    borderColor: g.borderBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  Btn__send: {
    backgroundColor: g.colors.primary,
    paddingLeft: 8,
  },
  Input: {
    flex: 1,
    lineHeight: g.iconSize,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: g.borderBg,
  },
})

const ChatInput = p => {
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
        RnIconress={openFileRnPicker}
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
        RnIconelectionChange={onSelectionChange}
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
export default ChatInput
