import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { RnSwitch } from '#/components/RnSwitch'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'

const css = StyleSheet.create({
  RowContents: {
    flexDirection: 'row',
    height: '12%',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  Title: {
    color: v.grayBg,
    fontSize: 13,
  },
  TitleView: {
    width: '40%',
    position: 'relative',
  },
})

interface FieldSignInMFAInterface {
  title: string
  onChangeValue?: (e: boolean) => void
  value: boolean
}

export const FieldSwitchMFA = ({
  onChangeValue,
  title,
  value,
}: FieldSignInMFAInterface) => {
  const onChange = () => {
    onChangeValue?.(!value)
  }
  return (
    <RnTouchableOpacity onPress={onChange} style={css.RowContents}>
      <View style={css.TitleView}>
        <RnText style={css.Title}>{title}</RnText>
      </View>
      <RnSwitch enabled={value} />
    </RnTouchableOpacity>
  )
}
