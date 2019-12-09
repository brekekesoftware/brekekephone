import { mdiBackspace, mdiKeyboard, mdiPhone } from '@mdi/js';
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Icon from '../shared/Icon';
import v from '../variables';

const s = StyleSheet.create({
  KeyPad: {
    top: 120,
  },
  KeyPad_Number: {
    flexDirection: `row`,
  },
  KeyPad_NumberTxt: {
    fontSize: v.fontSizeTitle,
    fontWeight: `600`,
    textAlign: `center`,
    paddingVertical: 20,
  },
  KeyPad_NumberBtn: {
    width: `33.3%`,
  },
  KeyPad_Btn: {
    flexDirection: `row`,
    justifyContent: `space-between`,
  },

  KeyPad_Btn__call: {
    backgroundColor: v.mainDarkBg,
    width: 64,
    borderRadius: 40,
    paddingVertical: 20,
  },
});

const keys = [
  [`1`, `2`, `3`],
  [`4`, `5`, `6`],
  [`7`, `8`, `9`],
  [`*`, `0`, `#`],
];

const KeyPad = p => (
  <View style={s.KeyPad}>
    {keys.map((row, i) => (
      <View key={i} style={s.KeyPad_Number}>
        {row.map(key => (
          <TouchableOpacity
            key={key}
            onPress={() => p.onPressNumber(key)}
            style={s.KeyPad_NumberBtn}
          >
            <Text style={s.KeyPad_NumberTxt}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ))}
    <View style={s.KeyPad_Btn}>
      <TouchableOpacity onPress={p.showKeyboard} style={s.KeyPad_NumberBtn}>
        <Icon path={mdiKeyboard} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={p.callVoice}
        style={[s.KeyPad_NumberBtn, s.KeyPad_Btn__call]}
        success
      >
        <Icon path={mdiPhone} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => p.onPressNumber(`delete`)}
        style={s.KeyPad_NumberBtn}
      >
        <Icon path={mdiBackspace} />
      </TouchableOpacity>
    </View>
  </View>
);

export default KeyPad;
