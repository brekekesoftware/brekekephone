import { mdiBackspace, mdiKeyboard, mdiPhone } from '@mdi/js';
import React from 'react';

import g from '../global';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Icon from '../shared/Icon';

const css = StyleSheet.create({
  KeyPad_Number: {
    flexDirection: `row`,
  },
  KeyPad_NumberTxt: {
    fontSize: g.fontSizeTitle,
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
    backgroundColor: g.colors.primary,
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
  <React.Fragment>
    {keys.map((row, i) => (
      <View key={i} style={css.KeyPad_Number}>
        {row.map(key => (
          <TouchableOpacity
            key={key}
            onPress={() => p.onPressNumber(key)}
            style={css.KeyPad_NumberBtn}
          >
            <Text style={css.KeyPad_NumberTxt}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ))}
    <View style={css.KeyPad_Btn}>
      <TouchableOpacity onPress={p.showKeyboard} style={css.KeyPad_NumberBtn}>
        <Icon
          color={Platform.OS === `web` ? `white` : null}
          path={mdiKeyboard}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={p.callVoice}
        style={[css.KeyPad_NumberBtn, css.KeyPad_Btn__call]}
        success
      >
        <Icon path={mdiPhone} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => p.onPressNumber(``)}
        style={css.KeyPad_NumberBtn}
      >
        <Icon path={mdiBackspace} />
      </TouchableOpacity>
    </View>
  </React.Fragment>
);

export default KeyPad;
