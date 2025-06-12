import { isWeb } from '../config'
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

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()

    const videoInputs = devices.filter(i => /videoinput/i.test(i.kind))

    const front = videoInputs.find(i =>
      isWeb ? /front|facetime|face/i.test(i.label) : i.facing === 'front',
    )
    const back = videoInputs.find(i =>
      isWeb ? /back|rear/i.test(i.label) : i.facing === 'environment',
    )
    const result: MediaDeviceInfo[] = []
    if (front) {
      result.push(front)
    }
    if (back) {
      result.push(back)
    }

    if (result.length === 0 && videoInputs.length > 0) {
      return videoInputs
    }

    return result
  } catch (err) {
    RnAlert.error({
      message: intlDebug`Failed to get front camera information`,
      err: err as Error,
    })
    return []
  }
}
