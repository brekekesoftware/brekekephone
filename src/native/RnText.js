import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import v from '../variables';

const s = StyleSheet.create({
  RnText: {
    position: `relative`,
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  },
  RnText__title: {
    fontSize: v.fontSizeTitle,
    lineHeight: v.lineHeightTitle,
    fontWeight: `bold`,
  },
  RnText__subTitle: {
    fontSize: v.fontSizeSubTitle,
    lineHeight: v.lineHeightSubTitle,
    fontWeight: `bold`,
  },
  RnText__small: {
    fontSize: v.fontSizeSmall,
    lineHeight: v.lineHeightSmall,
    fontWeight: `bold`,
  },
  RnText__black: {
    color: `black`,
  },
  RnText__white: {
    color: `white`,
  },
  RnText__normal: {
    fontWeight: `normal`,
  },
  RnText__bold: {
    fontWeight: `bold`,
  },
  RnText__center: {
    textAlign: `center`,
  },
  RnText__right: {
    textAlign: `right`,
  },
});

const RnText = forwardRef(
  (
    {
      black,
      bold,
      center,
      normal,
      right,
      small,
      subTitle,
      title,
      white,
      ...props
    },
    ref,
  ) => (
    <Text
      numberOfLines={999}
      ref={ref}
      {...props}
      style={[
        s.RnText,
        title && s.RnText__title,
        subTitle && s.RnText__subTitle,
        small && s.RnText__small,
        black && s.RnText__black,
        white && s.RnText__white,
        normal && s.RnText__normal,
        bold && s.RnText__bold,
        center && s.RnText__center,
        right && s.RnText__right,
        props.style,
      ]}
    />
  ),
);

export default RnText;
