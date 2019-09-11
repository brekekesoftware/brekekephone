import flow from 'lodash/flow';
import React, { forwardRef, useState } from 'react';
import * as Rn from 'react-native';

import v from '../variables';

const s = Rn.StyleSheet.create({
  Text: {
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
  },
  TextInput__focusing: {
    backgroundColor: v.fn.transparentize(0.9, v.brekekeGreen),
  },
});

const RnText = Rn.Text;
Rn.Text = forwardRef((p, ref) => (
  <RnText ref={ref} {...p} style={[s.Text, p.style]} />
));
Object.assign(Rn.Text, RnText);

const RnTextInput = Rn.TextInput;
Rn.TextInput = forwardRef((p, ref) => {
  const [focusing, setFocusing] = useState(false);
  return (
    <RnTextInput
      {...p}
      style={[p.style, focusing && s.TextInput__focusing]}
      onFocus={flow([() => setFocusing(true), p.onFocus].filter(f => f))}
      onBlur={flow([() => setFocusing(false), p.onBlur].filter(f => f))}
    />
  );
});
Object.assign(Rn.TextInput, RnTextInput);
