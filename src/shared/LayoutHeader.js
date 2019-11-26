import {
  mdiKeyboardBackspace,
  mdiPhone,
  mdiPlus,
  mdiVideoOutline,
} from '@mdi/js';
import React from 'react';

import g from '../global';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import { useAnimation } from '../utils/animation';
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
    paddingLeft: 50,
  },
  LayoutHeader_Inner__compact: {
    ...g.boxShadow,
  },
  LayoutHeader_Inner__transparent: {
    backgroundColor: `transparent`,
  },
  LayoutHeader_Title: {
    fontSize: g.fontSizeTitle,
    lineHeight: g.lineHeightTitle,
    fontWeight: `bold`,
  },
  LayoutHeader_Description: {
    color: g.subColor,
  },
  LayoutHeader_Description__compact: {
    display: `none`,
  },
  LayoutHeader_VideoCallBtn: {
    position: `absolute`,
    top: 0,
    right: 60,
  },
  LayoutHeader_VideoCallBtnInner: {
    position: `absolute`,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: g.mainDarkBg,
  },
  LayoutHeader_VoiceCallBtn: {
    position: `absolute`,
    top: 0,
    right: 115,
  },
  LayoutHeader_VoiceCallBtnInner: {
    position: `absolute`,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: g.mainDarkBg,
  },
  LayoutHeader_CreateBtn: {
    position: `absolute`,
    top: 0,
    right: 5,
  },
  LayoutHeader_CreateBtnOuter: {
    position: `absolute`,
    top: 11,
    right: 0,
    width: 50,
    height: 50,
    overflow: `hidden`,
  },
  LayoutHeader_CreateBtnInner: {
    position: `absolute`,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: g.mainDarkBg,
  },
  LayoutHeader_CreateBtn__white: {
    backgroundColor: g.bg,
  },
  LayoutHeader_BackBtn: {
    position: `absolute`,
    top: 0,
    left: 0,
  },
  LayoutHeader_BackBtnInner: {
    position: `absolute`,
    top: 0,
    left: 0,
    width: 50,
    height: 70,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 0,
  },
});

const Header = props => {
  const a = useAnimation(props.compact, {
    headerInnerPaddingVertical: [15, 10],
    titleFontSize: [g.fontSizeTitle, g.fontSizeSubTitle],
    titleLineHeight: [g.lineHeightTitle, 20],
    createBtnOuterTop: [11, 0],
    createBtnOuterHeight: [50, 40],
    createBtnInnerTop: [0, -5],
    backBtnHeight: [70, 40],
    backBtnPadding: [20, 5],
  });
  return (
    <View
      style={[s.LayoutHeader, props.compact && s.LayoutHeader_Inner__compact]}
    >
      <StatusBar transparent={props.transparent} />
      <Animated.View
        style={[
          s.LayoutHeader_Inner,
          !!props.onBackBtnPress && s.LayoutHeader_Inner__hasBackBtn,
          props.transparent && s.LayoutHeader_Inner__transparent,
          {
            paddingVertical: a.headerInnerPaddingVertical,
          },
        ]}
      >
        <Animated.Text
          style={[
            s.LayoutHeader_Title,
            {
              fontSize: a.titleFontSize,
              lineHeight: a.titleLineHeight,
              color: props.titleColor,
            },
          ]}
        >
          {props.compact ? props.titleCompact || props.title : props.title}
        </Animated.Text>
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
            onPress={props.onCreateBtnPress}
            style={s.LayoutHeader_CreateBtn}
          >
            <Animated.View
              style={[
                s.LayoutHeader_CreateBtnOuter,
                {
                  top: a.createBtnOuterTop,
                  height: a.createBtnOuterHeight,
                },
              ]}
            >
              <Animated.View
                style={[
                  s.LayoutHeader_CreateBtnInner,
                  props.transparent && s.LayoutHeader_CreateBtn__white,
                  {
                    top: a.createBtnInnerTop,
                  },
                ]}
              >
                <Icon
                  color={props.transparent ? `black` : `white`}
                  path={mdiPlus}
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        )}
        {props.onParkBtnPress && (
          <TouchableOpacity
            onPress={props.onParkBtnPress}
            style={s.LayoutHeader_CreateBtn}
          >
            <Animated.View
              style={[
                s.LayoutHeader_CreateBtnOuter,
                {
                  top: a.createBtnOuterTop,
                  height: a.createBtnOuterHeight,
                },
              ]}
            >
              <Animated.View
                style={[
                  s.LayoutHeader_CreateBtnInner,
                  props.transparent && s.LayoutHeader_CreateBtn__white,
                  {
                    top: a.createBtnInnerTop,
                  },
                ]}
              >
                <Icon
                  color={props.transparent ? `black` : `white`}
                  path={mdiPhone}
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        )}
        {props.onVoiceCallBtnPress && (
          <TouchableOpacity
            onPress={props.onVoiceCallBtnPress}
            style={s.LayoutHeader_VoiceCallBtn}
          >
            <Animated.View
              style={[
                s.LayoutHeader_CreateBtnOuter,
                {
                  top: a.createBtnOuterTop,
                  height: a.createBtnOuterHeight,
                },
              ]}
            >
              <Animated.View
                style={[
                  s.LayoutHeader_CreateBtnInner,
                  props.transparent && s.LayoutHeader_CreateBtn__white,
                  {
                    top: a.createBtnInnerTop,
                  },
                ]}
              >
                <Icon
                  color={props.transparent ? `black` : `white`}
                  path={mdiPhone}
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        )}
        {props.onVideoCallBtnPress && (
          <TouchableOpacity
            onPress={props.onVideoCallBtnPress}
            style={s.LayoutHeader_VideoCallBtn}
          >
            <Animated.View
              style={[
                s.LayoutHeader_CreateBtnOuter,
                {
                  top: a.createBtnOuterTop,
                  height: a.createBtnOuterHeight,
                },
              ]}
            >
              <Animated.View
                style={[
                  s.LayoutHeader_CreateBtnInner,
                  props.transparent && s.LayoutHeader_CreateBtn__white,
                  {
                    top: a.createBtnInnerTop,
                  },
                ]}
              >
                <Icon
                  color={props.transparent ? `black` : `white`}
                  path={mdiVideoOutline}
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        )}
        {props.onBackBtnPress && (
          <TouchableOpacity
            onPress={props.onBackBtnPress}
            style={s.LayoutHeader_BackBtn}
          >
            <Animated.View
              style={[
                s.LayoutHeader_BackBtnInner,
                {
                  height: a.backBtnHeight,
                  paddingVertical: a.backBtnPadding,
                },
              ]}
            >
              <Icon color={props.backBtnColor} path={mdiKeyboardBackspace} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default Header;
