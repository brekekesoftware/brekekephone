import { mdiPlus } from '@mdi/js'
import React from 'react'
import { StyleSheet } from 'react-native'

import { RnIcon, RnTouchableOpacity } from '../Rn'
import g from '../variables'

const css = StyleSheet.create({
  CreateBtn: {
    position: 'absolute',
    top: 11,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: g.colors.primary,
  },
  CreateBtn__white: {
    backgroundColor: g.bg,
  },
})

const CreateBtn = p => {
  const { onPress, white } = p
  return (
    <RnTouchableOpacity
      onPress={onPress}
      style={[css.CreateBtn, white && css.CreateBtn__white]}
    >
      <RnIcon color={white ? 'black' : 'white'} path={mdiPlus} />
    </RnTouchableOpacity>
  )
}
export default CreateBtn
