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
});

const RnText = forwardRef(
  ({ title, subTitle, small, style, ...props }, ref) => (
    <Text
      ref={ref}
      {...props}
      style={[
        s.RnText,
        title && s.RnText__title,
        subTitle && s.RnText__subTitle,
        small && s.RnText__small,
        style,
      ]}
      numberOfLines={999} // TODO remove native-base
    />
  ),
);

export default RnText;
