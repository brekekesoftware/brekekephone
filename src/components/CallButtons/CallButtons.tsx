import React, { FC } from 'react'
import {
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  View,
} from 'react-native'

import { RnText } from '../Rn'
import styles from './Styles'

const CallButtons: FC<{
  onPress(): void
  image: ImageSourcePropType
  lable: string
}> = p => (
  <View style={styles.actionBtnContainer}>
    <TouchableOpacity onPress={p.onPress}>
      <Image source={p.image} style={styles.actionBtn}></Image>
    </TouchableOpacity>
    <RnText style={styles.actionBtnText}>{p.lable}</RnText>
  </View>
)

export default CallButtons
