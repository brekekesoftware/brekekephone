import { mdiCached, mdiKeyboardBackspace } from '@mdi/js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import v from '../variables';
import SvgIcon from './SvgIcon';

const s = StyleSheet.create({
  ActionButtons: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: v.borderRadius,
    overflow: 'hidden',
  },
  ActionButtons_Btn: {
    borderRadius: 0,
    width: '25%',
  },
  ActionButtons_Btn__back: {
    backgroundColor: v.fn.transparentize(0.9, v.brekekeRed),
  },
  ActionButtons_Btn__reset: {
    backgroundColor: v.brekekeShade1,
  },
  ActionButtons_Btn__save: {
    width: '50%',
    backgroundColor: v.brekekeGreenBtn,
  },
  ActionButtons_BtnTxt: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
});

const ActionButtons = p => (
  <View style={s.ActionButtons}>
    <TouchableOpacity
      style={[s.ActionButtons_Btn, s.ActionButtons_Btn__back]}
      onPress={p.onBackBtnPress}
    >
      <SvgIcon path={p.backIcon || mdiKeyboardBackspace} color={v.brekekeRed} />
    </TouchableOpacity>
    <TouchableOpacity
      style={[s.ActionButtons_Btn, s.ActionButtons_Btn__reset]}
      onPress={p.onResetBtnPress}
    >
      <SvgIcon path={p.resetIcon || mdiCached} />
    </TouchableOpacity>
    <TouchableOpacity
      style={[s.ActionButtons_Btn, s.ActionButtons_Btn__save]}
      onPress={p.onSaveBtnPress}
    >
      <Text style={s.ActionButtons_BtnTxt}>{p.saveText || 'SAVE'}</Text>
    </TouchableOpacity>
  </View>
);

export default ActionButtons;
