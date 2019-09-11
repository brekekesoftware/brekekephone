import { mdiKeyboardBackspace, mdiPlus } from '@mdi/js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import SvgIcon from '../shared/SvgIcon';
import v from '../variables';
import StatusBar from './StatusBar';

const s = StyleSheet.create({
  LayoutHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    padding: 15,
    backgroundColor: 'white',
  },
  LayoutHeader__transparent: {
    backgroundColor: 'transparent',
  },
  LayoutHeader__hasBackBtn: {
    paddingLeft: 55,
  },
  LayoutHeader_Title: {
    fontWeight: 'bold',
    fontSize: 2 * v.fontSize,
  },
  LayoutHeader_Description: {
    fontSize: 0.9 * v.fontSize,
    color: v.brekekeShade8,
  },
  LayoutHeader_PlusBtn: {
    position: 'absolute',
    top: 11,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: v.brekekeDarkGreen,
  },
  LayoutHeader_PlusBtn__white: {
    backgroundColor: 'white',
  },
  LayoutHeader_BackBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 70,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 0,
  },
});

const Header = p => (
  <View
    style={[
      s.LayoutHeader,
      p.transparent && s.LayoutHeader__transparent,
      !!p.onBackBtnPress && s.LayoutHeader__hasBackBtn,
    ]}
  >
    <StatusBar transparent={p.transparent} />
    <Text style={s.LayoutHeader_Title}>{p.title}</Text>
    <Text style={s.LayoutHeader_Description}>{p.description || '\u200a'}</Text>
    {p.onPlusBtnPress && (
      <TouchableOpacity
        style={[
          s.LayoutHeader_PlusBtn,
          p.transparent && s.LayoutHeader_PlusBtn__white,
        ]}
        onPress={p.onPlusBtnPress}
      >
        <SvgIcon path={mdiPlus} color={p.transparent ? 'black' : 'white'} />
      </TouchableOpacity>
    )}
    {p.onBackBtnPress && (
      <TouchableOpacity style={s.Header_BackBtn} onPress={p.onBackBtnPress}>
        <SvgIcon path={mdiKeyboardBackspace} />
      </TouchableOpacity>
    )}
  </View>
);

export default Header;
