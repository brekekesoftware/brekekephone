import { mdiKeyboardBackspace, mdiPlus } from '@mdi/js';
import React from 'react';

import g from '../global';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Icon from './Icon';

const s = StyleSheet.create({
  LayoutHeader: {
    position: `absolute`,
    top: 0,
    left: 0,
    right: 0,
  },
  LayoutHeader_Inner: {
    padding: 15,
    backgroundColor: g.bg,
  },
  LayoutHeader_Inner__hasBackBtn: {
    paddingLeft: 55,
  },
  LayoutHeader_Inner__compact: {
    paddingVertical: 10,
    ...g.boxShadow,
  },
  LayoutHeader_Inner__transparent: {
    backgroundColor: `transparent`,
  },
  LayoutHeader_Title__compact: {
    fontSize: g.fontSizeSubTitle,
    lineHeight: 20,
  },
  LayoutHeader_Description: {
    color: g.subColor,
  },
  LayoutHeader_Description__compact: {
    display: `none`,
  },
  LayoutHeader_CreateBtn: {
    position: `absolute`,
    top: 11,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: g.mainDarkBg,
  },
  LayoutHeader_CreateBtn__white: {
    backgroundColor: g.bg,
  },
  LayoutHeader_CreateBtn__compact: {
    top: 0,
    height: 40,
    borderRadius: 0,
  },
  LayoutHeader_BackBtn: {
    position: `absolute`,
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

const Header = props => (
  <View style={s.LayoutHeader}>
    <StatusBar transparent={props.transparent} />
    <View
      style={[
        s.LayoutHeader_Inner,
        !!props.onBackBtnPress && s.LayoutHeader_Inner__hasBackBtn,
        props.compact && s.LayoutHeader_Inner__compact,
        props.transparent && s.LayoutHeader_Inner__transparent,
      ]}
    >
      <Text title style={props.compact && s.LayoutHeader_Title__compact}>
        {props.title}
      </Text>
      <Text
        style={[
          s.LayoutHeader_Description,
          props.compact && s.LayoutHeader_Description__compact,
        ]}
      >
        {props.description || `\u200a`}
      </Text>
      {props.onCreateBtnPress && (
        <TouchableOpacity
          style={[
            s.LayoutHeader_CreateBtn,
            props.transparent && s.LayoutHeader_CreateBtn__white,
            props.compact && s.LayoutHeader_CreateBtn__compact,
          ]}
          onPress={props.onCreateBtnPress}
        >
          <Icon path={mdiPlus} color={props.transparent ? `black` : `white`} />
        </TouchableOpacity>
      )}
      {props.onBackBtnPress && (
        <TouchableOpacity
          style={[
            s.LayoutHeader_BackBtn,
            props.compact && s.LayoutHeader_BackBtn__compact,
          ]}
          onPress={props.onBackBtnPress}
        >
          <Icon path={mdiKeyboardBackspace} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default Header;
