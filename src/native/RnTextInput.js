import flow from 'lodash/flow';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import v from '../variables';

const s = StyleSheet.create({
  RnTextInput: {
    position: 'relative',
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
  },
  RnTextInput__focusing: {
    backgroundColor: v.mainTranBg,
  },
});

const RnTextInput = forwardRef((p, ref) => {
  const [focusing, setFocusing] = useState(false);
  return (
    <TextInput
      {...p}
      style={[s.RnTextInput, p.style, focusing && s.RnTextInput__focusing]}
      onFocus={flow([() => setFocusing(true), p.onFocus].filter(f => f))}
      onBlur={flow([() => setFocusing(false), p.onBlur].filter(f => f))}
    />
  );
});

export default RnTextInput;
