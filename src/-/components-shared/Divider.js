import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  container: {
    paddingTop: std.gap.lg,
    backgroundColor: std.color.shade0,
  },

  divider: {
    alignItems: `center`,
    padding: std.gap.lg,
    paddingTop: 2 * std.gap.lg,
    borderColor: std.color.shade4,
    borderBottomWidth: 1,
    backgroundColor: std.color.shade3,
  },

  title: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    color: std.color.shade5,
  },
});

const Divider = p => (
  <React.Fragment>
    <View style={st.divider}>
      <Text style={st.title}>{p.title}</Text>
    </View>
    <View style={st.container}>{p.children}</View>
  </React.Fragment>
);

export default Divider;
