import { mdiBackspace, mdiPhone } from '@mdi/js';
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
    // justifyContent: 'space-around',
  },
  KeyPad_NumberTxt: {
    fontSize: v.fontSizeTitle,
    fontWeight: `600`,
  },
  KeyPad_NumberBtn: {
    textAlign: `center`,
    width: `33.3%`,
    paddingVertical: 20,
  },
  KeyPad_Btn: {
    flexDirection: `row`,
    justifyContent: `space-between`,
  },

  KeyPad_Btn__call: {
    backgroundColor: v.mainDarkBg,
    width: 64,
    borderRadius: 30,
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
    <View>
      {keys.map((row, i) => (
        <View style={s.KeyPad_Number} key={i}>
          {row.map(key => (
            <TouchableOpacity
              style={s.KeyPad_NumberBtn}
              onPress={() => p.onPress(key)}
            >
              <Text style={s.KeyPad_NumberTxt}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
    <View style={s.KeyPad_Btn}>
      <View style={s.KeyPad_NumberBtn}></View>
      <TouchableOpacity
        style={[s.KeyPad_NumberBtn, s.KeyPad_Btn__call]}
        success
        onPress={p.callVoice}
      >
        <Icon path={mdiPhone} />
      </TouchableOpacity>
      <TouchableOpacity
        style={s.KeyPad_NumberBtn}
        onPress={() => p.onPress(`delete`)}
      >
        <Icon path={mdiBackspace} />
      </TouchableOpacity>
    </View>
  </View>
);

export default KeyPad;
