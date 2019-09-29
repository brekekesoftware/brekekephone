import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import { StyleSheet, View } from '../native/Rn';

const s = StyleSheet.create({
  Stack: {
    backgroundColor: g.bg,
  },
});

const RootStacks = observer(() =>
  g.stacks.map(({ Component, ...p }, i) => (
    <View key={i} style={[StyleSheet.absoluteFill, s.Stack]}>
      <Component {...p} />
    </View>
  )),
);

export default RootStacks;
