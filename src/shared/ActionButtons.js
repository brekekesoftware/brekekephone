import { mdiCached, mdiKeyboardBackspace } from '@mdi/js';
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import v from '../variables';
import Icon from './Icon';

const s = StyleSheet.create({
  ActionButtons: {
    width: `100%`,
    flexDirection: `row`,
    borderRadius: v.borderRadius,
    overflow: `hidden`,
  },
  ActionButtons_Btn: {
    borderRadius: 0,
    width: `25%`,
    paddingVertical: 8,
  },
  ActionButtons_Btn__back: {
    backgroundColor: v.redTranBg,
  },
  ActionButtons_Btn__refresh: {
    backgroundColor: v.hoverBg,
  },
  ActionButtons_Btn__save: {
    width: `50%`,
    backgroundColor: v.mainDarkBg,
  },
  ActionButtons_Btn__33: {
    width: `33%`,
  },
  ActionButtons_Btn__67: {
    width: `67%`,
  },
  ActionButtons_Btn__100: {
    width: `100%`,
  },
  ActionButtons_BtnTxt: {
    flex: 1,
    fontWeight: `bold`,
    textAlign: `center`,
    color: v.revColor,
    fontSize: v.fontSizeSmall,
    lineHeight: 24, // Icon height
  },
});

const ActionButtons = p => (
  <View style={s.ActionButtons}>
    {p.onBackBtnPress && (
      <TouchableOpacity
        style={[
          s.ActionButtons_Btn,
          s.ActionButtons_Btn__back,
          !p.onRefreshBtnPress && s.ActionButtons_Btn__33,
        ]}
        onPress={p.onBackBtnPress}
      >
        <Icon path={p.backIcon || mdiKeyboardBackspace} color={v.redBg} />
      </TouchableOpacity>
    )}
    {p.onRefreshBtnPress && (
      <TouchableOpacity
        style={[
          s.ActionButtons_Btn,
          s.ActionButtons_Btn__refresh,
          !p.onBackBtnPress && s.ActionButtons_Btn__33,
        ]}
        onPress={p.onRefreshBtnPress}
      >
        <Icon path={p.refreshIcon || mdiCached} />
      </TouchableOpacity>
    )}
    <TouchableOpacity
      style={[
        s.ActionButtons_Btn,
        s.ActionButtons_Btn__save,
        (!p.onBackBtnPress || !p.onRefreshBtnPress) && s.ActionButtons_Btn__67,
        !p.onBackBtnPress && !p.onRefreshBtnPress && s.ActionButtons_Btn__100,
      ]}
      onPress={p.onSaveBtnPress}
    >
      <Text style={s.ActionButtons_BtnTxt}>{p.saveText || `SAVE`}</Text>
    </TouchableOpacity>
  </View>
);

export default ActionButtons;
