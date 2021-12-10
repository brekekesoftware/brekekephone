import React, { FC } from 'react'
import {
  Platform,
  StyleSheet,
  TextInputProps,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { mdiKeyboardBackspace } from '../assets/icons'
import { Field } from './Field'
import { RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  FieldButton: {
    alignSelf: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
    minWidth: 305,
    backgroundColor: 'white',
    borderRadius: v.borderRadius,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        width: 350,
      },
    }),
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

export const FieldButton: FC<
  Partial<{
    style: TouchableOpacityProps['style']
    onCreateBtnPress(): void
    label: string
    value: string
    textInputStyle?: TextInputProps['style']
  }>
> = p0 => {
  const { style, ...p } = p0
  return (
    <RnTouchableOpacity
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
    </RnTouchableOpacity>
  )
}
