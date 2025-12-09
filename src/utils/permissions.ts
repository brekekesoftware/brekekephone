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

import { isIos } from '#/config'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { BrekekeUtils } from '#/utils/BrekekeUtils'

const mergeMsg = (...msgs: unknown[]) => {
  let msg = msgs.filter(v => v).join('\n')
  if (msg) {
    msg = '\n' + msg
  }
  msg = msg + '\n'
  return msg
}

const showMessagePermForCallIos = async (
  rMicro: string,
  rCam: string,
  rNotify: boolean,
) => {
  const msgMicro = rMicro !== 'granted' && intl`- Microphone`
  const msgCam = rCam !== 'granted' && intl`- Camera`
  const msgNotify = !rNotify && intl`- Notifications`

  const msg = mergeMsg(msgMicro, msgCam, msgNotify)

  RnAlert.prompt({
    title: '',
    message: intl`You do not have permission as follows${msg}Please grant access permission in the app settings of the device.`,
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
  rBattery: boolean,
  rOverlay: boolean,
  rCallPhone: string,
  rReadPhone: string,
  rCam: string,
  rRecord: string,
  rBluetooth: string,
  rNotify: boolean,
  rAndroidLpc: boolean,
) => {
  const msgBattery = !rBattery && intl`- Disable Battery Optimization`
  const msgOverlay = !rOverlay && intl`- Display over other apps`
  const msgPermOther = !rAndroidLpc && intl`- Enable Android lpc permissions`
  const msgCallPhone =
    rCallPhone !== 'granted' && rReadPhone !== 'granted' && intl`- Phone`
  const msgCam = rCam !== 'granted' && intl`- Camera`
  const msgRecord = rRecord !== 'granted' && intl`- Microphone`
  const msgBluetooth = rBluetooth !== 'granted' && intl`- Nearby devices`
  const msgNotify = !rNotify && intl`- Notifications`

  const msg = mergeMsg(
    msgBattery,
    msgOverlay,
    msgPermOther,
    msgCallPhone,
    msgCam,
    msgRecord,
    msgBluetooth,
    msgNotify,
  )

  RnAlert.prompt({
    title: '',
    message: intl`You do not have permission as follows${msg}Please grant access permission in the app settings of the device.`,
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

  const rBattery = await BrekekeUtils.permCheckIgnoringBatteryOptimizations()
  const rOverlay = await BrekekeUtils.permCheckOverlay()
  const rAndroidLpc = await BrekekeUtils.permCheckAndroidLpc()

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
    rAndroidLpc,
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
    rAndroidLpc &&
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
    rAndroidLpc,
  )
  return false
}

export const checkPermForCall = async (
  isShowDialog = false,
  isNotifyPermNeeded = false,
) => {
  if (isIos) {
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
  if (await BrekekeUtils.permCheckIgnoringBatteryOptimizations()) {
    return true
  }
  console.log('Permission debug permDisableBatteryOptimization')
  return await new Promise<void | boolean>(resolve => {
    RnAlert.prompt({
      title: '',
      message: intl`To ensure the best user experience, we require the permission to unrestricted use Battery. Please enable the 'Disable Battery Optimization' in your device settings to proceed.`,
      onConfirm: async () => {
        const r = await BrekekeUtils.permRequestIgnoringBatteryOptimizations()
        resolve(r)
      },
      onDismiss: () => resolve(false),
      confirmText: intl`OK`,
      dismissText: intl`Cancel`,
    })
  })
}

const permAndroidLpcForIncomingCall = async () => {
  if (await BrekekeUtils.permCheckAndroidLpc()) {
    return true
  }
  console.log('Permission debug permDisableBatteryOptimization')
  return await new Promise<void | boolean>(resolve => {
    RnAlert.prompt({
      title: '',
      message: intl`To ensure the best user experience, the application requires the "Show on Lock screen" and "Display pop-up windows while running in the background" permissions. Please enable these two permissions in your device settings to proceed.`,
      onConfirm: async () => {
        const r = await BrekekeUtils.permRequestAndroidLpc()
        resolve(r)
      },
      onDismiss: () => resolve(false),
      confirmText: intl`OK`,
      dismissText: intl`Cancel`,
    })
  })
}

const permOverlayPermission = async () => {
  if (await BrekekeUtils.permCheckOverlay()) {
    return true
  }
  return await new Promise<void | boolean>(resolve => {
    console.log('Permission debug permOverlayPermission')
    RnAlert.prompt({
      title: '',
      message: intl`To ensure the best user experience, we require the permission to display content on top of other apps. Please enable the 'Overlay Permission' in your device settings to proceed.`,
      onConfirm: async () => {
        const r = await BrekekeUtils.permRequestOverlay()
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
  const rAndroidLpc = await permAndroidLpcForIncomingCall()

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
    rAndroidLpc,
  })
  if (
    rBluetooth === 'granted' &&
    rRecord === 'granted' &&
    rCam === 'granted' &&
    rReadPhone === 'granted' &&
    rCallPhone === 'granted' &&
    rBattery &&
    rOverlay &&
    rAndroidLpc &&
    rNotify
  ) {
    return true
  }

  if (!rBattery || !rOverlay || !rAndroidLpc) {
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
    rAndroidLpc,
  )

  return false
}

const permForCallIos = async (isNotifyPermNeeded = false) => {
  let rNotify = true
  if (isNotifyPermNeeded) {
    rNotify = await permNotifications()
  }
  const rMicro = await request(PERMISSIONS.IOS.MICROPHONE)
  const rCam = await request(PERMISSIONS.IOS.CAMERA)
  console.log('Permission debug permForCallIos ', { rMicro, rCam, rNotify })
  if (rMicro === 'granted' && rCam === 'granted' && rNotify) {
    return true
  }
  // requestNotifications always return 'denied' on ios. So, we will use checkPermForCallIos to make sure it's 'granted' or not.
  // https://forums.developer.apple.com/forums/thread/725619
  checkPermForCallIos(true, isNotifyPermNeeded)
  // showMessagePermForCallIos(rMicro, rCam, rNotify)
  return false
}

export const permForCall = async (isNotifyPermNeeded = false) => {
  if (isIos) {
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
