import { mdiDotsHorizontal } from '@mdi/js'

import { intl, intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'

// Need to declare native intl here
// So it will get bundled when build intl via web
export const pickFileNativeOptions = () => [
  {
    key: 0,
    label: intl`Take a new photo`,
    icon: mdiDotsHorizontal,
  },
  {
    key: 1,
    label: intl`Take a new video`,
    icon: mdiDotsHorizontal,
  },
  {
    key: 2,
    label: intl`Select from photo library`,
    icon: mdiDotsHorizontal,
  },
  {
    key: 3,
    label: intl`More...`,
    icon: mdiDotsHorizontal,
  },
]
export const onPickFileNativeError = (err: Error) => {
  RnAlert.error({
    message: intlDebug`Failed to pick file from system`,
    err,
  })
}

export const pickFile = (cb: Function) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = function () {
    cb(input.files?.[0])
  }
  input.click()
}
