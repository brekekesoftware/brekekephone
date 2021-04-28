import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import { RnText } from './Rn'

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
    }, 1000)
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
