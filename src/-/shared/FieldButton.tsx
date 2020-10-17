import { mdiKeyboardBackspace } from '@mdi/js'
import React from 'react'

import g from '../global'
import { Platform, StyleSheet, TouchableOpacity, View } from '../Rn'
import Field from './Field'

const css = StyleSheet.create({
  FieldButton: {
    alignSelf: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
    width: 305,
    backgroundColor: 'white',
    borderRadius: g.borderRadius,
    overflow: 'hidden',
  },
  Inner: {
    ...Platform.select({
      android: {
        top: 1,
      },
      default: {
        top: -5,
      },
    }),
  },
  CreateBtn: {
    ...Platform.select({
      android: {
        top: 8,
      },
      default: {
        top: 15,
      },
    }),
  },
  CreateBtnIcon: {
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
})

const FieldButton = p0 => {
  const { style, ...p } = p0
  return (
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
  )
}

export default FieldButton
