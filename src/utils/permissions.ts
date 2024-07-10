import { Platform } from 'react-native'
import {
  checkMultiple,
  checkNotifications,
  openSettings,
  PERMISSIONS,
  request,
  requestMultiple,
  requestNotifications,
} from 'react-native-permissions'

import { intl } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { BrekekeUtils } from './RnNativeModules'

const showMessagePermForCallIos = async (rMicro, rCam, rNotify) => {
  RnAlert.prompt({
    title: '',
    message: intl`You do not have permission as follows
${rMicro !== 'granted' ? intl`- Microphone` + '\n' : ''}${rCam !== 'granted' ? intl`- Camera` + '\n' : ''}${!rNotify ? intl`- Notifications` + '\n' : ''}Please grant access permission in the app settings of the device.`,
    onConfirm: openSettings,
    confirmText: intl`Settings`,
    dismissText: intl`Cancel`,
  })
}

const checkPermForCallIos = async (
  isShowDialog = false,
  isNotifyPermNeeded = false,
) => {
  const rIos = await checkMultiple([
    PERMISSIONS.IOS.CAMERA,
    PERMISSIONS.IOS.MICROPHONE,
  ])
  let rNotify = true
  if (isNotifyPermNeeded) {
    rNotify = await isNotifications()
  }
  const rMicro = rIos[PERMISSIONS.IOS.MICROPHONE]
  const rCam = rIos[PERMISSIONS.IOS.CAMERA]
  console.log('Permission debug checkPermForCallIos ', {
    rMicro,
    rCam,
    rNotify,
    isShowDialog,
    isNotifyPermNeeded,
  })
  if (rMicro === 'granted' && rCam === 'granted' && rNotify) {
    return true
  }
  if (!isShowDialog) {
    return false
  }
  showMessagePermForCallIos(rMicro, rCam, rNotify)
  return false
}

const showMessagePermForCallAndroid = async (
  rBattery,
  rOverlay,
  rCallPhone,
  rReadPhone,
  rCam,
  rRecord,
  rBluetooth,
  rNotify,
) => {
  RnAlert.prompt({
    title: '',
    message: intl`You do not have permission as follows
${!rBattery ? intl`- Disable Battery Optimization` + '\n' : ''}${!rOverlay ? intl`- Display over other apps` + '\n' : ''}${rCallPhone !== 'granted' && rReadPhone !== 'granted' ? intl`- Phone` + '\n' : ''}${rCam !== 'granted' ? intl`- Camera` + '\n' : ''}${rRecord !== 'granted' ? intl`- Microphone` + '\n' : ''}${rBluetooth !== 'granted' ? intl`- Nearby devices` + '\n' : ''}${!rNotify ? intl`- Notifications` + '\n' : ''}Please grant access permission in the app settings of the device.`,
    onConfirm: openSettings,
    confirmText: intl`Settings`,
    dismissText: intl`Cancel`,
  })
}
const checkPermForCallAndroid = async (
  isShowDialog = false,
  isNotifyPermNeeded = false,
) => {
  if (Platform.OS !== 'android' || Platform.Version < 23) {
    return true
  }

  const rBattery = await BrekekeUtils.isDisableBatteryOptimizationGranted()
  const rOverlay = await BrekekeUtils.isOverlayPermissionGranted()

  let rNotify = true
  if (isNotifyPermNeeded) {
    rNotify = await isNotifications()
  }
  const r = await checkMultiple([
    PERMISSIONS.ANDROID.CALL_PHONE,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
  ])
  const rBluetooth =
    Platform.Version < 31 ? 'granted' : r[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
  const rRecord = r[PERMISSIONS.ANDROID.RECORD_AUDIO]
  const rCam = r[PERMISSIONS.ANDROID.CAMERA]
  const rReadPhone = r[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS]
  const rCallPhone = r[PERMISSIONS.ANDROID.CALL_PHONE]
  console.log('Permission debug checkPermForCallAndroid ', {
    rReadPhone,
    rCallPhone,
    rBluetooth,
    rRecord,
    rCam,
    isShowDialog,
    rNotify,
  })
  //
  if (
    rBluetooth === 'granted' &&
    rRecord === 'granted' &&
    rCam === 'granted' &&
    rReadPhone === 'granted' &&
    rCallPhone === 'granted' &&
    rBattery &&
    rOverlay &&
    rNotify
  ) {
    return true
  }
  if (!isShowDialog) {
    return false
  }
  showMessagePermForCallAndroid(
    rBattery,
    rOverlay,
    rCallPhone,
    rReadPhone,
    rCam,
    rRecord,
    rBluetooth,
    rNotify,
  )
  return false
}
export const checkPermForCall = async (
  isShowDialog = false,
  isNotifyPermNeeded = false,
) => {
  if (Platform.OS === 'ios') {
    return await checkPermForCallIos(isShowDialog, isNotifyPermNeeded)
  }
  return await checkPermForCallAndroid(isShowDialog, isNotifyPermNeeded)
}

const isNotifications = async () => {
  const { status: r } = await checkNotifications()
  console.log('Permission debug checkNotifications ', r)
  if (r === 'granted') {
    return true
  }
  return false
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
  return false
}

const permDisableBatteryOptimization = async () => {
  if (await BrekekeUtils.isDisableBatteryOptimizationGranted()) {
    return true
  }
  console.log('Permission debug permDisableBatteryOptimization')
  return await new Promise<void | boolean>(resolve => {
    RnAlert.prompt({
      title: '',
      message: intl`To ensure the best user experience, we require the permission to unrestricted use Battery. Please enable the 'Disable Battery Optimization' in your device settings to proceed.`,
      onConfirm: async () => {
        const r = await BrekekeUtils.perDisableBatteryOptimization()
        resolve(r)
      },
      onDismiss: () => resolve(false),
      confirmText: intl`OK`,
      dismissText: intl`Cancel`,
    })
  })
}
const permOverlayPermission = async () => {
  if (await BrekekeUtils.isOverlayPermissionGranted()) {
    return true
  }
  return await new Promise<void | boolean>(resolve => {
    console.log('Permission debug permOverlayPermission')
    RnAlert.prompt({
      title: '',
      message: intl`To ensure the best user experience, we require the permission to display content on top of other apps. Please enable the 'Overlay Permission' in your device settings to proceed.`,
      onConfirm: async () => {
        const r = await BrekekeUtils.perOverlay()
        resolve(r)
      },
      onDismiss: () => resolve(false),
      confirmText: intl`OK`,
      dismissText: intl`Cancel`,
    })
  })
}

const permForCallAndroid = async (isNotifyPermNeeded = false) => {
  if (Platform.OS !== 'android' || Platform.Version < 23) {
    return true
  }

  const rBattery = await permDisableBatteryOptimization()

  const rOverlay = await permOverlayPermission()

  let rNotify = true
  if (isNotifyPermNeeded) {
    rNotify = await permNotifications()
  }

  const r = await requestMultiple([
    PERMISSIONS.ANDROID.CALL_PHONE,
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
  ])

  const rBluetooth =
    Platform.Version < 31 ? 'granted' : r[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
  const rRecord = r[PERMISSIONS.ANDROID.RECORD_AUDIO]
  const rCam = r[PERMISSIONS.ANDROID.CAMERA]
  const rReadPhone = r[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS]
  const rCallPhone = r[PERMISSIONS.ANDROID.CALL_PHONE]
  console.log('Permission debug permForCallAndroid', {
    rRecord,
    rCam,
    rReadPhone,
    rCallPhone,
    rBluetooth,
    rBattery,
    rOverlay,
    rNotify,
  })
  if (
    rBluetooth === 'granted' &&
    rRecord === 'granted' &&
    rCam === 'granted' &&
    rReadPhone === 'granted' &&
    rCallPhone === 'granted' &&
    rBattery &&
    rOverlay &&
    rNotify
  ) {
    return true
  }

  showMessagePermForCallAndroid(
    rBattery,
    rOverlay,
    rCallPhone,
    rReadPhone,
    rCam,
    rRecord,
    rBluetooth,
    rNotify,
  )

  return false
}
const permForCallIos = async (isNotifyPermNeeded = false) => {
  const rMicro = await request(PERMISSIONS.IOS.MICROPHONE)
  const rCam = await request(PERMISSIONS.IOS.CAMERA)
  let rNotify = true
  if (isNotifyPermNeeded) {
    rNotify = await permNotifications()
  }
  console.log('Permission debug permForCallIos ', { rMicro, rCam, rNotify })
  if (rMicro === 'granted' && rCam === 'granted' && rNotify) {
    return true
  }
  // requestNotifications always return 'denied' on IOS. So, we will use checkPermForCallIos to make sure it's 'granted' or not.
  // https://forums.developer.apple.com/forums/thread/725619
  checkPermForCallIos(true, isNotifyPermNeeded)
  // showMessagePermForCallIos(rMicro, rCam, rNotify)
  return false
}
export const permForCall = async (isNotifyPermNeeded = false) => {
  if (Platform.OS === 'ios') {
    return await permForCallIos(isNotifyPermNeeded)
  }
  return await permForCallAndroid(isNotifyPermNeeded)
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
