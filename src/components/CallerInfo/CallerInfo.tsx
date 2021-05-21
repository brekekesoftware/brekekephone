import React, { FC } from 'react'
import { Image, View } from 'react-native'
import UserAvatar from 'react-native-user-avatar'

import CustomColors from '../../utils/CustomColors'
import CustomImages from '../../utils/CustomImages'
import { RnText } from '../Rn'
import styles from './Styles'

const CallerInfo: FC<{
  isUserCalling: boolean
  callerName: string
  callerNumber: string
}> = p => (
  <View style={styles.notifyInfo}>
    {!!p.callerName && (
      <>
        <UserAvatar
          size={66}
          name={p.callerName}
          bgColor={CustomColors.DodgerBlue}
        />
        <RnText style={styles.callerName}>{p.callerName}</RnText>
      </>
    )}

    {!p.isUserCalling && !!p.callerNumber && (
      <View style={styles.notifyContainer}>
        <Image source={CustomImages.CountryFlagLogo} style={styles.flagLogo} />
        <RnText style={styles.mobileNumber}>{p.callerNumber}</RnText>
      </View>
    )}

    {!!p.isUserCalling && (
      <RnText style={styles.userNumber}>{p.callerNumber}</RnText>
    )}
    {/* Commented for future use */}
    {/* <RnText>
            {c.remoteVideoEnabled
              ? intl`Incoming video call`
              : intl`Incoming audio call`}
          </RnText> */}
  </View>
)

export default CallerInfo
