import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: std.gap.md,
    backgroundColor: std.color.shade0,
    borderColor: std.color.shade4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  btnContainer: {
    width: '100%',
    alignItems: 'center',
    padding: std.gap.md,
  },

  textTitle: {
    padding: std.gap.lg,
    fontSize: std.textSize.sm,
    fontWeight: '700',
  },
});

const ButtonNewField = p => (
  <View style={st.container}>
    <Button style={st.btnContainer}>
      <Text style={st.textTitle}>{p.title}</Text>
    </Button>
  </View>
);

export default ButtonNewField;
