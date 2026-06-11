import { isIos } from '@rntwsc/rn/core/utils/platform'
import DeviceInfo from 'react-native-device-info'

export const devicePlatform = () => (isIos ? 'iOS' : 'Android')
export const deviceDetail = () => {
  const os = devicePlatform()
  const osv = DeviceInfo.getSystemVersion()
  let phone = DeviceInfo.getModel()
  if (!isIos) {
    const brand = DeviceInfo.getBrand()
    phone = `${brand} ${phone}`
  }
  return `${os} ${osv}; ${phone}`
}
