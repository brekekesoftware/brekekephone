import React from 'react';

import { StyleSheet, Text, View } from '../native/Rn';
import v from '../variables';

const s = StyleSheet.create({
  FieldGroupHeader: {
    backgroundColor: v.brekekeShade1,
    padding: 15,
    marginHorizontal: -15,
  },
  FieldGroupHeader__hasMargin: {
    marginTop: 30,
  },
  FieldGroupHeader_Text: {
    fontWeight: 'bold',
    fontSize: v.fontSizeSmall,
  },
});

const FieldGroupHeader = p => (
  <View
    style={[s.FieldGroupHeader, p.hasMargin && s.FieldGroupHeader__hasMargin]}
  >
    <Text style={s.FieldGroupHeader_Text}>{p.title}</Text>
  </View>
);

export default FieldGroupHeader;
