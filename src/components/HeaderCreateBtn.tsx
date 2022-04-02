import { FC } from 'react'
import { StyleSheet } from 'react-native'

import { mdiPlus } from '../assets/icons'
import { RnIcon, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  CreateBtn: {
    position: 'absolute',
    top: 11,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: v.colors.primary,
  },
  CreateBtn__white: {
    backgroundColor: v.bg,
  },
})

export const CreateBtn: FC<{
  white: boolean
  onPress(): void
}> = p => {
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
