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
      result === 'blocked' &&
        RnAlert.prompt({
          title: intl`READ_PHONE_NUMBERS`,
          message: intl`Please provide the require permission from settings. Press Ok to continue`,
          onConfirm: () => {
            openSettings()
          },
          confirmText: intl`Ok`,
          dismissText: intl`Cancel`,
        })
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
          title: intl`BLUETOOTH_CONNECT`,
          message: intl`Please provide the require permission from settings. Press Ok to continue`,
          onConfirm: () => {
            openSettings()
          },
          confirmText: intl`Ok`,
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
          title: intl`POST_NOTIFICATIONS`,
          message: intl`Please provide the require permission from settings. Press Ok to continue`,
          onConfirm: () => {
            openSettings()
          },
          confirmText: intl`Ok`,
          dismissText: intl`Cancel`,
        })
      return false
    }
    return true
  }
  return true
}
