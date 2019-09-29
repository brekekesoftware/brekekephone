import React from 'react';

import { StyleSheet, Text, View } from '../native/Rn';
import v from '../variables';

const s = StyleSheet.create({
  FieldGroup: {
    paddingHorizontal: 15,
  },
  FieldGroup__hasMargin: {
    marginTop: 30,
  },
  FieldGroup_Title: {
    backgroundColor: v.borderBg,
    padding: 15,
  },
  FieldGroup_TitleText: {
    fontWeight: `bold`,
    fontSize: v.fontSizeSmall,
  },
});

const FieldGroup = p => (
  <View style={p.hasMargin && s.FieldGroup__hasMargin}>
    {p.title && (
      <View style={s.FieldGroup_Title}>
        <Text style={s.FieldGroup_TitleText}>{p.title}</Text>
      </View>
    )}
    <View style={s.FieldGroup}>{p.children}</View>
  </View>
);

export default FieldGroup;
