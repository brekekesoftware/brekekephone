import React from 'react'
import { Image, View } from 'react-native'

import CustomImages from '../../utils/CustomImages'
import { RnText } from '../Rn'
import styles from './Styles'

const PoweredBy = () => (
  <View style={styles.poweredBy}>
    <RnText style={styles.poweredByText}>{'powered by'}</RnText>
    <Image source={CustomImages.QooqieLogo} style={styles.qooqieLogo}></Image>
  </View>
)

export default PoweredBy
