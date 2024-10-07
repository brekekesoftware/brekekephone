import { Platform } from 'react-native'

import { intl, intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'

declare global {
  interface MediaDeviceInfo {
    id: string
    facing: string
  }
}
export const getCameraSourceId = async (isFront: boolean) => {
  const mediaDevices = window.navigator.mediaDevices
  if (!mediaDevices) {
    RnAlert.error({
      unexpectedErr: new Error(
        intl`Can not access media devices, check if your connection is https secured`,
      ),
    })
    return undefined
  }
  return mediaDevices
    .enumerateDevices()
    .then(a => {
      const value = a.find(i =>
        /videoinput/i.test(i.kind) && isFront
          ? /front/i.test(i.facing)
          : /environment/i.test(i.facing),
      )
      return value
    })
    .then(i => i?.deviceId || undefined)
    .catch((err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to get front camera information`,
        err,
      })
      return undefined
    })
}
export const getCameraSourceIds = async () => {
  const mediaDevices = window.navigator.mediaDevices
  if (!mediaDevices) {
    RnAlert.error({
      unexpectedErr: new Error(
        intl`Can not access media devices, check if your connection is https secured`,
      ),
    })
    return []
  }

  return mediaDevices
    .enumerateDevices()
    .then(a => {
      const videoInputs = a.filter(i => /videoinput/i.test(i.kind))
      if (videoInputs.length === 1) {
        return [...videoInputs, ...videoInputs]
      }
      const frontCamera = videoInputs.find(i =>
        Platform.OS === 'web'
          ? i.label.includes('Front')
          : i.facing.includes('front'),
      )
      const backCamera = videoInputs.find(i =>
        Platform.OS === 'web'
          ? i.label.includes('Back')
          : i.facing.includes('environment'),
      )
      const result: MediaDeviceInfo[] = []
      if (frontCamera) {
        result.push(frontCamera)
      }
      if (backCamera) {
        result.push(backCamera)
      }
      return result
    })
    .catch((err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to get front camera information`,
        err,
      })
      return []
    })
}
