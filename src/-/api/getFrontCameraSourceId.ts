import Alert from '../global/Alert'
import { intlDebug } from '../intl/intl'

declare global {
  interface MediaDeviceInfo {
    id: string
    facing: string
  }
}
const getFrontCameraSourceId = () => {
  const mediaDevices = window.navigator.mediaDevices
  if (!mediaDevices) {
    Alert.error({
      unexpectedErr: new Error(
        'Can not access mediaDevices, check if your connection is https secured',
      ),
    })
    return null
  }
  return mediaDevices
    .enumerateDevices()
    .then(a => a.find(i => /video/i.test(i.kind) && /front/i.test(i.facing)))
    .then(i => i?.id)
    .catch(err => {
      Alert.error({
        message: intlDebug`Failed to get front camera information`,
        err,
      })
    })
}

export default getFrontCameraSourceId
