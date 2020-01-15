import pickBy from 'lodash/pickBy';
import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import v from '../../variables';

const css = StyleSheet.create({
  RnText: {
    position: `relative`,
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
    color: v.color,
  },
  title: {
    fontSize: v.fontSizeTitle,
    lineHeight: v.lineHeightTitle,
    fontWeight: `bold`,
  },
  subTitle: {
    fontSize: v.fontSizeSubTitle,
    lineHeight: v.lineHeightSubTitle,
    fontWeight: `bold`,
  },
  small: {
    fontSize: v.fontSizeSmall,
    lineHeight: v.lineHeightSmall,
    fontWeight: `bold`,
  },
  black: {
    color: `black`,
  },
  white: {
    color: `white`,
  },
  primary: {
    color: v.colors.primary,
  },
  warning: {
    color: v.colors.warning,
  },
  danger: {
    color: v.colors.danger,
  },
  normal: {
    fontWeight: `normal`,
  },
  bold: {
    fontWeight: `bold`,
  },
  center: {
    textAlign: `center`,
  },
  right: {
    textAlign: `right`,
  },
});

const RnText = forwardRef(({ singleLine, style, ...props }, ref) => (
  <Text
    numberOfLines={singleLine ? 1 : 999}
    ref={ref}
    {...pickBy(props, (v, k) => !(k in css))}
    style={[
      css.RnText,
      ...Object.keys(props)
        .sort(k =>
          k === `title` || k === `subTitle` || k === `small` ? -1 : 1,
        )
        .map(k => props[k] && css[k]),
      style,
    ]}
  />
));

export default RnText;
