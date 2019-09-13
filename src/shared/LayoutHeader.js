import { mdiKeyboardBackspace, mdiPlus } from '@mdi/js';
import React from 'react';

import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Icon from '../shared/Icon';
import v from '../variables';

const s = StyleSheet.create({
  LayoutHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  LayoutHeader_Inner: {
    padding: 15,
    backgroundColor: v.bg,
  },
  LayoutHeader_Inner__hasBackBtn: {
    paddingLeft: 55,
  },
  LayoutHeader_Inner__compact: {
    paddingVertical: 10,
    ...v.boxShadow,
  },
  LayoutHeader_Inner__transparent: {
    backgroundColor: 'transparent',
  },
  LayoutHeader_Title: {
    fontWeight: 'bold',
    fontSize: v.fontSizeTitle,
  },
  LayoutHeader_Title__compact: {
    fontSize: v.fontSizeSubTitle,
    lineHeight: 20,
  },
  LayoutHeader_Description: {
    color: v.subColor,
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
    backgroundColor: v.mainDarkBg,
  },
  LayoutHeader_CreateBtn__white: {
    backgroundColor: v.bg,
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
  <View style={s.LayoutHeader}>
    <StatusBar transparent={p.transparent} />
    <View
      style={[
        s.LayoutHeader_Inner,
        !!p.onBackBtnPress && s.LayoutHeader_Inner__hasBackBtn,
        p.compact && s.LayoutHeader_Inner__compact,
        p.transparent && s.LayoutHeader_Inner__transparent,
      ]}
    >
      <Text
        style={[
          s.LayoutHeader_Title,
          p.compact && s.LayoutHeader_Title__compact,
        ]}
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
  </View>
);

export default Header;
