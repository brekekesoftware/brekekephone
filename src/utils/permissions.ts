import { PermissionsAndroid, Platform } from 'react-native'
import {
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  requestNotifications,
} from 'react-native-permissions'

import { intl } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'

export const permNotifications = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true
  }
  const { status: r } = await requestNotifications([])
  if (r === 'granted') {
    return true
  }
  if (r !== 'blocked') {
    return false
  }
  RnAlert.prompt({
    title: 'POST_NOTIFICATIONS',
    message: intl`Please provide the required permissions from settings`,
    onConfirm: openSettings,
    confirmText: intl`OK`,
    dismissText: intl`Cancel`,
  })
  return true
}

export const permReadPhoneNumber = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 30) {
    return true
  }
  const r = await request(PERMISSIONS.ANDROID.READ_PHONE_NUMBERS)
  if (r === 'granted') {
    return true
  }
  if (r !== 'blocked') {
    return false
  }
  RnAlert.prompt({
    title: 'READ_PHONE_NUMBERS',
    message: intl`Please provide the required permissions from settings`,
    onConfirm: openSettings,
    confirmText: intl`OK`,
    dismissText: intl`Cancel`,
  })
  return false
}

export const permForCall = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 23) {
    return true
  }
  const call = await PermissionsAndroid.request('android.permission.CALL_PHONE')
  if (call !== 'granted') {
    if (call !== 'never_ask_again') {
      return false
    }
    RnAlert.prompt({
      title: 'CALL_PHONE',
      message: intl`Please provide the required permissions from settings`,
      onConfirm: openSettings,
      confirmText: intl`OK`,
      dismissText: intl`Cancel`,
    })
    return false
  }
  if (Platform.Version < 31) {
    return true
  }
  const r = await requestMultiple([
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.CAMERA,
  ])
  const bluetooth = r[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
  const record = r[PERMISSIONS.ANDROID.RECORD_AUDIO]
  const cam = r[PERMISSIONS.ANDROID.CAMERA]
  if (bluetooth === 'granted' && record === 'granted' && cam === 'granted') {
    return true
  }
  if (bluetooth !== 'blocked' && record !== 'blocked' && cam !== 'blocked') {
    return false
  }
  RnAlert.prompt({
    title: 'RECORD_AUDIO, BLUETOOTH_CONNECT, CAMERA',
    message: intl`Please provide the required permissions from settings`,
    onConfirm: openSettings,
    confirmText: intl`OK`,
    dismissText: intl`Cancel`,
  })
  return false
}
