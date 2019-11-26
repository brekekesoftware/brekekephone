import { mdiPhone } from '@mdi/js';
import React from 'react';

import { StyleSheet, TextInput, TouchableOpacity, View } from '../native/Rn';
import Icon from '../shared/Icon';

const s = StyleSheet.create({
  ShowNumbers: {
    flexDirection: `row`,
  },
  ShowNumbers_DisplayTxt: {
    fontSize: 24,
    padding: 15,
    width: `80%`,
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
    <TextInput
      keyboardType="number-pad"
      onChangeText={p.setTarget}
      placeholder="Enter your number"
      style={s.ShowNumbers_DisplayTxt}
    />
    {p.value !== `` && (
      <TouchableOpacity onPress={p.callVoice} style={s.ShowNumbers_BtnCall}>
        <Icon path={mdiPhone} size={30} />
      </TouchableOpacity>
    )}
  </View>
);

export default ShowNumber;
