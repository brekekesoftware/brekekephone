import { mdiEmoticon, mdiPaperclip, mdiSend } from '@mdi/js';
import React from 'react';

import g from '../../global';
import { Icon, StyleSheet, TextInput, TouchableOpacity, View } from '../Rn';

const css = StyleSheet.create({
  ChatInput: {
    flex: 1,
    flexDirection: `row`,
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
});

const ChatInput = ({
  onEmojiTurnOn,
  onSelectionChange,
  onTextChange,
  onTextSubmit,
  openFilePicker,
  text,
}) => (
  <View style={css.ChatInput}>
    <TouchableOpacity onPress={openFilePicker} style={[css.Btn, css.Btn__file]}>
      <Icon path={mdiPaperclip} size={20} />
    </TouchableOpacity>
    <TouchableOpacity onPress={onEmojiTurnOn} style={[css.Btn, css.Btn__emoji]}>
      <Icon color="gray" path={mdiEmoticon} />
    </TouchableOpacity>
    <TextInput
      blurOnSubmit={false}
      onChangeText={onTextChange}
      onSelectionChange={onSelectionChange}
      onSubmitEditing={onTextSubmit}
      style={css.Input}
      value={text}
    />
    <TouchableOpacity onPress={onTextSubmit} style={[css.Btn, css.Btn__send]}>
      <Icon color="white" path={mdiSend} />
    </TouchableOpacity>
  </View>
);

export default ChatInput;
