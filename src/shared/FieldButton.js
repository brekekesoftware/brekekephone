import { mdiKeyboardBackspace } from '@mdi/js';
import React from 'react';

import { Platform, StyleSheet, TouchableOpacity, View } from '../-/Rn';
import g from '../global';
import Field from './Field';

const css = StyleSheet.create({
  FieldButton: {
    alignSelf: `center`,
    marginTop: 15,
    paddingHorizontal: 10,
    width: 305,
    backgroundColor: `white`,
    borderRadius: g.borderRadius,
    overflow: `hidden`,
  },
  Inner: {
    top: -5,
    ...Platform.select({
      android: {
        top: 1,
      },
    }),
  },
  CreateBtn: {
    top: 15,
    ...Platform.select({
      android: {
        top: 8,
      },
    }),
  },
  CreateBtnIcon: {
    transform: [
      {
        rotate: `180deg`,
      },
    ],
  },
});

const FieldButton = ({ style, ...p }) => (
  <TouchableOpacity
    onPress={p.onCreateBtnPress}
    style={[css.FieldButton, style]}
  >
    <View style={css.Inner}>
      <Field
        {...p}
        createBtnIcon={mdiKeyboardBackspace}
        createBtnIconStyle={css.CreateBtnIcon}
        createBtnStyle={css.CreateBtn}
        transparent
      />
    </View>
  </TouchableOpacity>
);

export default FieldButton;
