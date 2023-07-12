import { Platform } from 'react-native'
import {
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
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
export const permissionForCall = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    const result = await requestMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.CAMERA,
    ])
    const statusBluetooth = result[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
    const statusRecord = result[PERMISSIONS.ANDROID.RECORD_AUDIO]
    const statusCamera = result[PERMISSIONS.ANDROID.CAMERA]
    if (
      statusBluetooth !== 'granted' ||
      statusRecord !== 'granted' ||
      statusCamera !== 'granted'
    ) {
      if (
        statusBluetooth === 'blocked' ||
        statusRecord === 'blocked' ||
        statusCamera === 'blocked'
      ) {
        RnAlert.prompt({
          title: 'RECORD_AUDIO, BLUETOOTH_CONNECT, CAMERA',
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
      if (result === 'blocked') {
        RnAlert.prompt({
          title: 'BLUETOOTH_CONNECT',
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
export const permissionNotification = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const { status } = await requestNotifications([])
    if (status !== 'granted') {
      if (status === 'blocked') {
        RnAlert.prompt({
          title: 'POST_NOTIFICATIONS',
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
