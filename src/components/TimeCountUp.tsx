import {
  mdiClose,
  mdiPhoneIncoming,
  mdiPhoneMissed,
  mdiPhoneOutgoing,
} from '@mdi/js'
import moment from 'moment'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { Conference } from '../api/brekekejs'
import uc, { Constants } from '../api/uc'
import intl from '../stores/intl'
import webchatStore from '../stores/webchatStore'
import Avatar from './Avatar'
import { RnIcon, RnImage, RnText, RnTouchableOpacity } from './Rn'

const css = StyleSheet.create({
  Text: {
    paddingLeft: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    textAlign: 'left',
    minWidth: 80,
    // maxHeight: 100
  },
})

const secondsToTime = (secs: number) => {
  let hours = Math.floor(secs / (60 * 60))
  let minutes = Math.floor(secs / 60)
  let divisor_for_seconds = secs % 60
  let seconds = Math.ceil(divisor_for_seconds)
  let obj = {
    h: hours,
    m: minutes < 10 ? '0' + minutes : '' + minutes,
    s: seconds < 10 ? '0' + seconds : '' + seconds,
  }
  return obj
}

const TimeCountUp: FC<{
  created_time: string
}> = ({ created_time }) => {
  const [timeCount, setTimer] = useState('')
  useEffect(() => {
    let start = moment(created_time, 'YYYY-MM-DD HH:mm:ss')
    let diff = moment().diff(start, 'seconds') // return seconds
    const idInterval = setInterval(() => {
      diff++
      const result = secondsToTime(diff)
      const timeString = result.m + ':' + result.s
      setTimer(timeString)
    }, 100)
    return () => {
      clearInterval(idInterval)
    }
  }, [created_time])
  return (
    <RnText normal singleLine small style={css.Text}>
      {timeCount}
    </RnText>
  )
}
export default TimeCountUp
