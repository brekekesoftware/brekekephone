import { mdiDotsHorizontal } from '#/assets/icons'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'

// Shared (non-platform) module so the intl strings get bundled by the web build
// AND pick-file.native.ts can import these. Importing them from
// '#/utils/pick-file' inside pick-file.native.ts resolves back to that same
// native file (.native has priority) -> self-import -> undefined.
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
