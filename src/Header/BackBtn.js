import { mdiKeyboardBackspace } from '@mdi/js';
import React from 'react';

import { Animated, StyleSheet, TouchableOpacity } from '../native/Rn';
import Icon from '../shared/Icon';
import { useAnimation } from '../utils/animation';

const css = StyleSheet.create({
  BackBtn: {
    position: `absolute`,
    top: 0,
    left: 0,
  },
  Inner: {
    width: 50,
    height: 70,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 0,
  },
});

const BackBtn = ({ compact, onPress }) => {
  const cssInnerA = useAnimation(compact, {
    height: [70, 40],
    paddingVertical: [20, 5],
  });
  return (
    <TouchableOpacity onPress={onPress} style={css.BackBtn}>
      <Animated.View style={[css.Inner, cssInnerA]}>
        <Icon path={mdiKeyboardBackspace} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BackBtn;
