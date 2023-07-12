import { Platform } from 'react-native'
import {
  openSettings,
  PERMISSIONS,
  request,
  requestNotifications,
} from 'react-native-permissions'

import { intl } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'

export const permissionReadPhoneNumber = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 30) {
    const result = await request(PERMISSIONS.ANDROID.READ_PHONE_NUMBERS)
    if (result !== 'granted') {
      if (result === 'blocked') {
        RnAlert.prompt({
          title: 'READ_PHONE_NUMBERS',
          message: intl`Please provide the required permission from settings`,
          onConfirm: () => {
            openSettings()
          },
          confirmText: intl`OK`,
          dismissText: intl`Cancel`,
        })
      }
      return false
    }
    return true
  }
  return true
}
export const permissionBluetoothConnect = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    const result = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT)
    if (result !== 'granted') {
      result === 'blocked' &&
        RnAlert.prompt({
          title: 'BLUETOOTH_CONNECT',
          message: intl`Please provide the required permission from settings`,
          onConfirm: () => {
            openSettings()
          },
          confirmText: intl`OK`,
          dismissText: intl`Cancel`,
        })
      return false
    }
    return true
  }
  return true
}
export const permissionNotification = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const { status } = await requestNotifications([])
    if (status !== 'granted') {
      status === 'blocked' &&
        RnAlert.prompt({
          title: 'POST_NOTIFICATIONS',
          message: intl`Please provide the required permission from settings`,
          onConfirm: () => {
            openSettings()
          },
          confirmText: intl`OK`,
          dismissText: intl`Cancel`,
        })
      return false
    }
    return true
  }
  return true
}
