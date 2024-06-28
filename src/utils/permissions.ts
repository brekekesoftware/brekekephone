import { Platform } from 'react-native'
import {
  checkMultiple,
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  requestNotifications,
} from 'react-native-permissions'

import { intl } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { BrekekeUtils } from './RnNativeModules'

export const checkPermForCallIos = async (isShowDialog = false) => {
  const rIos = await checkMultiple([
    PERMISSIONS.IOS.CAMERA,
    PERMISSIONS.IOS.MICROPHONE,
  ])
  const micro = rIos[PERMISSIONS.IOS.MICROPHONE]
  const cam = rIos[PERMISSIONS.IOS.CAMERA]
  console.log('Permission debug checkPermForCallIos ', {
    micro,
    cam,
    isShowDialog,
  })
  if (micro === 'granted' && cam === 'granted') {
    return true
  }
  if (!isShowDialog) {
    return false
  }
  RnAlert.prompt({
    title: intl`Allow access permissions`,
    message: intl`You do not have permission as follows
${micro !== 'granted' ? '- Microphone \n' : ''}${cam !== 'granted' ? '- Camera\n' : ''}Please grant access permission in the app settings of the device.
    `,
    onConfirm: openSettings,
    confirmText: intl`Settings`,
    dismissText: intl`Cancel`,
  })
  return false
}
export const checkPermForCallAndroid = async (isShowDialog = false) => {
  if (Platform.OS !== 'android' || Platform.Version < 23) {
    return true
  }
  const r = await checkMultiple([
    PERMISSIONS.ANDROID.CALL_PHONE,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
  ])
  const bluetooth =
    Platform.Version < 31 ? 'granted' : r[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
  const record = r[PERMISSIONS.ANDROID.RECORD_AUDIO]
  const cam = r[PERMISSIONS.ANDROID.CAMERA]
  const readPhone = r[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS]
  const callPhone = r[PERMISSIONS.ANDROID.CALL_PHONE]
  console.log('Permission debug checkPermForCallAndroid ', {
    readPhone,
    callPhone,
    bluetooth,
    record,
    cam,
    isShowDialog,
  })
  //
  if (
    bluetooth === 'granted' &&
    record === 'granted' &&
    cam === 'granted' &&
    readPhone === 'granted' &&
    callPhone === 'granted'
  ) {
    return true
  }
  if (!isShowDialog) {
    return false
  }
  RnAlert.prompt({
    title: intl`Allow access permissions`,
    message: intl`You do not have permission as follows
${callPhone !== 'granted' && readPhone !== 'granted' ? '- Phone \n' : ''}${cam !== 'granted' ? '- Camera \n' : ''}${record !== 'granted' ? '- Microphone \n' : ''}${bluetooth !== 'granted' ? '- Bluetooth\n' : ''}Please grant access permission in the app settings of the device.
    `,
    onConfirm: openSettings,
    confirmText: intl`Settings`,
    dismissText: intl`Cancel`,
  })
  return false
}
export const checkPermForCall = async (isShowDialog = false) => {
  if (Platform.OS === 'ios') {
    return await checkPermForCallIos(isShowDialog)
  }
  return await checkPermForCallAndroid(isShowDialog)
}
export const permNotifications = async () => {
  if (Platform.OS === 'android' && Platform.Version < 33) {
    return true
  }
  const { status: r } = await requestNotifications([])
  console.log('Permission debug permNotifications ', r)
  if (r === 'granted') {
    return true
  }
  if (r !== 'blocked') {
    return false
  }
  RnAlert.prompt({
    title: 'Allow access Notifications',
    message: intl`Please provide the required permissions from settings`,
    onConfirm: openSettings,
    confirmText: intl`OK`,
    dismissText: intl`Cancel`,
  })
  return false
}

export const permDisableBatteryOptimization = async () => {
  if (!BrekekeUtils.isDisableBatteryOptimizationGranted()) {
    console.log('Permission debug permDisableBatteryOptimization')
    await BrekekeUtils.perDisableBatteryOptimization()
  }
}
export const permOverlayPermission = async () => {
  if (!(await BrekekeUtils.isOverlayPermissionGranted())) {
    return await new Promise<void>(resolve => {
      console.log('Permission debug permOverlayPermission')
      RnAlert.prompt({
        title: intl`Overlay Permission`,
        message: intl`To ensure the best user experience, we require the permission to display content on top of other apps. Please enable the 'Overlay Permission' in your device settings to proceed.`,
        onConfirm: () => {
          resolve()
          BrekekeUtils.perOverlay()
        },
        onDismiss: resolve,
        confirmText: intl`OK`,
        dismissText: intl`Cancel`,
      })
    })
  }
}

export const permForCallAndroid = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 23) {
    return true
  }
  const r = await requestMultiple([
    PERMISSIONS.ANDROID.CALL_PHONE,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
  ])
  const bluetooth =
    Platform.Version < 31 ? 'granted' : r[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
  const record = r[PERMISSIONS.ANDROID.RECORD_AUDIO]
  const cam = r[PERMISSIONS.ANDROID.CAMERA]
  const readPhone = r[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS]
  const callPhone = r[PERMISSIONS.ANDROID.CALL_PHONE]
  console.log('Permission debug permForCallAndroid', {
    record,
    cam,
    readPhone,
    callPhone,
    bluetooth,
  })
  if (
    bluetooth === 'granted' &&
    record === 'granted' &&
    cam === 'granted' &&
    readPhone === 'granted' &&
    callPhone === 'granted'
  ) {
    return true
  }
  if (
    bluetooth === 'blocked' ||
    record === 'blocked' ||
    cam === 'blocked' ||
    readPhone === 'blocked' ||
    callPhone === 'blocked'
  ) {
    await checkPermForCall(true)
  }
  return false
}
export const permForCallIos = async () => {
  const micro = await request(PERMISSIONS.IOS.MICROPHONE)
  const cam = await request(PERMISSIONS.IOS.CAMERA)
  console.log('Permission debug permForCallIos ', { micro, cam })
  if (micro === 'granted' && cam === 'granted') {
    return true
  }
  if (micro === 'blocked' || cam === 'blocked') {
    await checkPermForCall(true)
  }
  return false
}
export const permForCall = async () => {
  if (Platform.OS === 'ios') {
    return await permForCallIos()
  }
  return await permForCallAndroid()
}

export const permForCallLog = async () => {
  const r = await requestMultiple([
    PERMISSIONS.ANDROID.WRITE_CALL_LOG,
    PERMISSIONS.ANDROID.PROCESS_OUTGOING_CALLS,
  ])
  const writeCallLog = r[PERMISSIONS.ANDROID.WRITE_CALL_LOG]
  const processOutgoingCall = r[PERMISSIONS.ANDROID.PROCESS_OUTGOING_CALLS]
  if (writeCallLog === 'granted' && processOutgoingCall === 'granted') {
    return true
  }
  if (writeCallLog !== 'blocked' && processOutgoingCall !== 'blocked') {
    return false
  }
  RnAlert.prompt({
    title: 'WRITE_CALL_LOG, PROCESS_OUTGOING_CALLS',
    message: intl`Please provide the required permissions from settings`,
    onConfirm: openSettings,
    confirmText: intl`OK`,
    dismissText: intl`Cancel`,
  })
  return false
}
