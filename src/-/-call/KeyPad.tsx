import { mdiBackspace, mdiKeyboard, mdiPhone } from '@mdi/js'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import g from '../global'
import { RnIcon, RnText, RnTouchableOpacity } from '../Rn'

const css = StyleSheet.create({
  KeyPad_Number: {
    flexDirection: 'row',
  },
  KeyPad_NumberTxt: {
    fontSize: g.fontSizeTitle,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
  },
  KeyPad_NumberBtn: {
    width: '33.3%',
  },
  KeyPad_Btn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  KeyPad_Btn__call: {
    backgroundColor: g.colors.primary,
    width: 64,
    borderRadius: 40,
    paddingVertical: 20,
  },
})

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
]

const KeyPad = p => (
  <React.Fragment>
    {keys.map((row, i) => (
      <View key={i} style={css.KeyPad_Number}>
        {row.map(key => (
          <RnTouchableOpacity
            key={key}
            onPress={() => p.onPressNumber(key)}
            style={css.KeyPad_NumberBtn}
          >
            <RnText style={css.KeyPad_NumberTxt}>{key}</RnText>
          </RnTouchableOpacity>
        ))}
      </View>
    ))}
    <View style={css.KeyPad_Btn}>
      <RnTouchableOpacity onPress={p.showKeyboard} style={css.KeyPad_NumberBtn}>
        <RnIcon
          color={Platform.OS === 'web' ? 'white' : undefined}
          path={mdiKeyboard}
        />
      </RnTouchableOpacity>
      <RnTouchableOpacity
        onPress={p.callVoice}
        style={[css.KeyPad_NumberBtn, css.KeyPad_Btn__call]}
      >
        <RnIcon path={mdiPhone} />
      </RnTouchableOpacity>
      <RnTouchableOpacity
        onPress={() => p.onPressNumber('')}
        style={css.KeyPad_NumberBtn}
      >
        <RnIcon path={mdiBackspace} />
      </RnTouchableOpacity>
    </View>
  </React.Fragment>
)

export default KeyPad
