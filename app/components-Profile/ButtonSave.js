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
  },
  btnContainer: {
    width: '100%',
    backgroundColor: std.color.shade10,
    alignItems: 'center',
    padding: std.gap.md,
  },
  textTitle: {
    padding: std.gap.lg,
    color: std.color.shade0,
    fontSize: std.textSize.md,
  },
});

const ButtonSave = p => (
  <View style={st.container}>
    <Button style={st.btnContainer}>
      <Text style={st.textTitle}>{p.title}</Text>
    </Button>
  </View>
);

export default ButtonSave;
