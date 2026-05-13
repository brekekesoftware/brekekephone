import DeviceInfo from 'react-native-device-info'

import { isIos } from '#/config'

export const devicePlatform = () => {
  const name = DeviceInfo.getSystemName()
  return name === 'iPadOS' ? 'iOS' : name
}
export const deviceDetail = () => {
  const os = devicePlatform()
  const osv = DeviceInfo.getSystemVersion()
  const phone = isIos
    ? DeviceInfo.getDeviceId()
    : `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`
  return `${os} ${osv}; ${phone}`
}
