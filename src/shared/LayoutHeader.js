import { mdiKeyboardBackspace, mdiPlus } from '@mdi/js';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Icon from '../shared/Icon';
import v from '../variables';
import StatusBar from './StatusBar';

const s = StyleSheet.create({
  LayoutHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  LayoutHeader__hasBackBtn: {
    paddingLeft: 55,
  },
  LayoutHeader__compact: {
    paddingVertical: 10,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  LayoutHeader__transparent: {
    backgroundColor: 'transparent',
  },
  LayoutHeader_Title: {
    fontWeight: 'bold',
    fontSize: 2.1 * v.fontSize,
  },
  LayoutHeader_Title__compact: {
    fontSize: 1.5 * v.fontSize,
    lineHeight: 20,
  },
  LayoutHeader_Description: {
    color: v.brekekeShade7,
  },
  LayoutHeader_Description__compact: {
    display: 'none',
  },
  LayoutHeader_CreateBtn: {
    position: 'absolute',
    top: 11,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: v.brekekeGreenBtn,
  },
  LayoutHeader_CreateBtn__white: {
    backgroundColor: 'white',
  },
  LayoutHeader_CreateBtn__compact: {
    top: 0,
    height: 40,
    borderRadius: 0,
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
  LayoutHeader_BackBtn__compact: {
    height: 40,
    paddingVertical: 5,
  },
});

const Header = p => (
  <View
    style={[
      s.LayoutHeader,
      !!p.onBackBtnPress && s.LayoutHeader__hasBackBtn,
      p.compact && s.LayoutHeader__compact,
      p.transparent && s.LayoutHeader__transparent,
    ]}
  >
    <StatusBar transparent={p.transparent} />
    <Text
      style={[s.LayoutHeader_Title, p.compact && s.LayoutHeader_Title__compact]}
    >
      {p.title}
    </Text>
    <Text
      style={[
        s.LayoutHeader_Description,
        p.compact && s.LayoutHeader_Description__compact,
      ]}
    >
      {p.description || '\u200a'}
    </Text>
    {p.onCreateBtnPress && (
      <TouchableOpacity
        style={[
          s.LayoutHeader_CreateBtn,
          p.transparent && s.LayoutHeader_CreateBtn__white,
          p.compact && s.LayoutHeader_CreateBtn__compact,
        ]}
        onPress={p.onCreateBtnPress}
      >
        <Icon path={mdiPlus} color={p.transparent ? 'black' : 'white'} />
      </TouchableOpacity>
    )}
    {p.onBackBtnPress && (
      <TouchableOpacity
        style={[
          s.LayoutHeader_BackBtn,
          p.compact && s.LayoutHeader_BackBtn__compact,
        ]}
        onPress={p.onBackBtnPress}
      >
        <Icon path={mdiKeyboardBackspace} />
      </TouchableOpacity>
    )}
  </View>
);

export default Header;
