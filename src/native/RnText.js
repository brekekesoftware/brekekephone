import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import v from '../variables';

const css = StyleSheet.create({
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
  RnText__primary: {
    color: v.colors.primary,
  },
  RnText__warning: {
    color: v.colors.warning,
  },
  RnText__danger: {
    color: v.colors.danger,
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
      danger,
      normal,
      primary,
      right,
      small,
      subTitle,
      title,
      warning,
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
        css.RnText,
        title && css.RnText__title,
        subTitle && css.RnText__subTitle,
        small && css.RnText__small,
        black && css.RnText__black,
        white && css.RnText__white,
        primary && css.RnText__primary,
        warning && css.RnText__warning,
        danger && css.RnText__danger,
        normal && css.RnText__normal,
        bold && css.RnText__bold,
        center && css.RnText__center,
        right && css.RnText__right,
        props.style,
      ]}
    />
  ),
);

export default RnText;
