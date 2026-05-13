import DeviceInfo from 'react-native-device-info'

import { isIos } from '#/config'

export const devicePlatform = () => (isIos ? 'iOS' : 'Android')
export const deviceDetail = () => {
  const os = devicePlatform()
  const osv = DeviceInfo.getSystemVersion()
  const phone = isIos
    ? DeviceInfo.getModel()
    : `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`
  return `${os} ${osv}; ${phone}`
}
