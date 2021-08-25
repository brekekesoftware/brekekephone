import { intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'

declare global {
  interface MediaDeviceInfo {
    id: string
    facing: string
  }
}
export const getFrontCameraSourceId = async () => {
  const mediaDevices = window.navigator.mediaDevices
  if (!mediaDevices) {
    RnAlert.error({
      unexpectedErr: new Error(
        'Can not access mediaDevices, check if your connection is https secured',
      ),
    })
    return undefined
  }
  return mediaDevices
    .enumerateDevices()
    .then(a => a.find(i => /video/i.test(i.kind) && /front/i.test(i.facing)))
    .then(i => i?.id || undefined)
    .catch((err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to get front camera information`,
        err,
      })
      return undefined
    })
}
