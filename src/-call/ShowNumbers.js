import React from 'react';

import { StyleSheet, TextInput, View } from '../native/Rn';

const s = StyleSheet.create({
  ShowNumbers: {
    flexDirection: `row`,
  },
  ShowNumbers_DisplayTxt: {
    fontSize: 24,
    padding: 15,
    width: `100%`,
  },
  ShowNumbers_BtnCall: {
    position: `absolute`,
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 40,
  },
});

const ShowNumber = p => (
  <View style={s.ShowNumbers}>
    {p.isShowKeyboard && (
      <TextInput
        keyboardType="default"
        multiline={true}
        onChangeText={p.setTarget}
        onEndEditing={p.showKeyboradNumpad}
        onSelectionChange={event => p.selectionChange(event)}
        placeholder="Enter your number"
        ref={p.refInput}
        // selection={p.selection}
        style={s.ShowNumbers_DisplayTxt}
        value={p.value}
      />
    )}
    {!p.isShowKeyboard && (
      <TextInput
        keyboardType="phone-pad"
        multiline={true}
        onChangeText={p.setTarget}
        onSelectionChange={event => p.selectionChange(event)}
        placeholder="Enter your number"
        ref={p.refInput}
        // selection={p.selection}
        style={s.ShowNumbers_DisplayTxt}
        value={p.value}
      />
    )}
  </View>
);

export default ShowNumber;
