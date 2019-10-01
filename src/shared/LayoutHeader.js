import { mdiKeyboardBackspace, mdiPlus } from '@mdi/js';
import React, { useEffect, useState } from 'react';

import g from '../global';
import {
  Animated,
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
  LayoutHeader_CreateBtn__compact: {
    top: 0,
    height: 40,
    borderRadius: 0,
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
  LayoutHeader_BackBtn__compact: {
    height: 40,
    paddingVertical: 5,
  },
});

const Header = props => {
  const [paddingVertical] = useState(new Animated.Value(15));
  useEffect(() => {
    Animated.timing(paddingVertical, {
      toValue: props.compact ? 10 : 15,
      duration: 150,
    }).start();
    return () => Animated.timing(paddingVertical).stop();
  }, [paddingVertical, props.compact]);

  const [titleFontSize] = useState(new Animated.Value(g.fontSizeTitle));
  useEffect(() => {
    Animated.timing(titleFontSize, {
      toValue: props.compact ? g.fontSizeSubTitle : g.fontSizeTitle,
      duration: 150,
    }).start();
    return () => Animated.timing(titleFontSize).stop();
  }, [titleFontSize, props.compact]);

  const [titleLineHeight] = useState(new Animated.Value(g.lineHeightTitle));
  useEffect(() => {
    Animated.timing(titleLineHeight, {
      toValue: props.compact ? 20 : g.lineHeightTitle,
      duration: 150,
    }).start();
    return () => Animated.timing(titleLineHeight).stop();
  }, [titleLineHeight, props.compact]);

  const [backBtnHeight] = useState(new Animated.Value(70));
  useEffect(() => {
    Animated.timing(backBtnHeight, {
      toValue: props.compact ? 40 : 70,
      duration: 150,
    }).start();
    return () => Animated.timing(backBtnHeight).stop();
  }, [backBtnHeight, props.compact]);

  const [backBtnPadding] = useState(new Animated.Value(20));
  useEffect(() => {
    Animated.timing(backBtnPadding, {
      toValue: props.compact ? 5 : 20,
      duration: 150,
    }).start();
    return () => Animated.timing(backBtnPadding).stop();
  }, [backBtnPadding, props.compact]);

  const [createBtnOuterTop] = useState(new Animated.Value(11));
  useEffect(() => {
    Animated.timing(createBtnOuterTop, {
      toValue: props.compact ? 0 : 11,
      duration: 150,
    }).start();
    return () => Animated.timing(createBtnOuterTop).stop();
  }, [createBtnOuterTop, props.compact]);
  const [createBtnOuterHeight] = useState(new Animated.Value(50));
  useEffect(() => {
    Animated.timing(createBtnOuterHeight, {
      toValue: props.compact ? 40 : 50,
      duration: 150,
    }).start();
    return () => Animated.timing(createBtnOuterHeight).stop();
  }, [createBtnOuterHeight, props.compact]);
  const [createBtnInnerTop] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(createBtnInnerTop, {
      toValue: props.compact ? -5 : 0,
      duration: 150,
    }).start();
    return () => Animated.timing(createBtnInnerTop).stop();
  }, [createBtnInnerTop, props.compact]);

  return (
    <View style={s.LayoutHeader}>
      <StatusBar transparent={props.transparent} />
      <Animated.View
        style={[
          s.LayoutHeader_Inner,
          !!props.onBackBtnPress && s.LayoutHeader_Inner__hasBackBtn,
          props.compact && s.LayoutHeader_Inner__compact,
          props.transparent && s.LayoutHeader_Inner__transparent,
          {
            paddingVertical,
          },
        ]}
      >
        <Animated.Text
          style={[
            s.LayoutHeader_Title,
            props.compact && s.LayoutHeader_Title__compact,
            {
              fontSize: titleFontSize,
              lineHeight: titleLineHeight,
            },
          ]}
        >
          {props.title}
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
            style={s.LayoutHeader_CreateBtn}
            onPress={props.onCreateBtnPress}
          >
            <Animated.View
              style={[
                s.LayoutHeader_CreateBtnOuter,
                {
                  top: createBtnOuterTop,
                  height: createBtnOuterHeight,
                },
              ]}
            >
              <Animated.View
                style={[
                  s.LayoutHeader_CreateBtnInner,
                  props.transparent && s.LayoutHeader_CreateBtn__white,
                  {
                    top: createBtnInnerTop,
                  },
                ]}
              >
                <Icon
                  path={mdiPlus}
                  color={props.transparent ? `black` : `white`}
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        )}
        {props.onBackBtnPress && (
          <TouchableOpacity
            style={s.LayoutHeader_BackBtn}
            onPress={props.onBackBtnPress}
          >
            <Animated.View
              style={[
                s.LayoutHeader_BackBtnInner,
                {
                  height: backBtnHeight,
                  paddingVertical: backBtnPadding,
                },
              ]}
            >
              <Icon path={mdiKeyboardBackspace} />
            </Animated.View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default Header;
