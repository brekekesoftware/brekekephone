import React, { forwardRef } from 'react';
import * as Rn from 'react-native';

import v from './variables';

const s = Rn.StyleSheet.create({
  Text: {
    fontSize: v.fontSize,
    fontWeight: v.fontWeight,
    fontFamily: v.fontFamily,
  },
});

const RnText = Rn.Text;
Rn.Text = forwardRef((p, ref) => (
  <RnText ref={ref} {...p} style={[s.Text, p.style]} />
));
Object.assign(Rn.Text, RnText);
