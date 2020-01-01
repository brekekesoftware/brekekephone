import React from 'react';

import g from '../global';
import { Animated, StyleSheet, Text } from '../native/Rn';
import { useAnimation } from '../utils/animation';

const css = StyleSheet.create({
  Title: {
    fontSize: g.fontSizeTitle,
    lineHeight: g.lineHeightTitle,
    fontWeight: `bold`,
    color: `black`,
  },
  Description: {
    color: g.subColor,
  },
});

const Title = ({ compact, description, title }) => {
  const cssTitleA = useAnimation(compact, {
    fontSize: [g.fontSizeTitle, g.fontSizeSubTitle],
    lineHeight: [g.lineHeightTitle, 20],
  });
  return (
    <React.Fragment>
      <Animated.Text style={[css.Title, cssTitleA]}>{title}</Animated.Text>
      {!compact && (
        <Text style={css.Description}>{description || `\u200a`}</Text>
      )}
    </React.Fragment>
  );
};

export default Title;
