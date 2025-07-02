import { isErrorWithCode, pick } from '@react-native-documents/picker'
import RNFS from 'react-native-fs'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { v4 as newUuid } from 'uuid'

import { isIos } from '#/config'
import { RnPicker } from '#/stores/RnPicker'
import {
  onPickFileNativeError,
  pickFileNativeOptions,
} from '#/utils/pickFile.web'

const actionSheetHandlers = [
  () =>
    new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: 'photo',
          cameraType: 'back',
          saveToPhotos: false,
        },
        r =>
          r.didCancel
            ? resolve(null)
            : r.errorMessage
              ? reject(r.errorMessage)
              : resolve(r.assets?.[0]),
      )
    }),
  () =>
    new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: 'video',
          cameraType: 'back',
        },
        r =>
          r.didCancel
            ? resolve(null)
            : r.errorMessage
              ? reject(r.errorMessage)
              : resolve(r.assets?.[0]),
      )
    }),
  () =>
    new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'mixed',
          assetRepresentationMode: 'auto',
          quality: 1,
        },
        r =>
          r.didCancel
            ? resolve(null)
            : r.errorMessage
              ? reject(r.errorMessage)
              : resolve(r.assets?.[0]),
      )
    }),
  () => pick(),
]

export const pickFile = (cb: Function) =>
  RnPicker.open({
    options: pickFileNativeOptions(),
    onSelect: (i: number) => pickFileOnSelect(i, cb),
  })

const pickFileOnSelect = async (i: number, cb: Function) => {
  const fn = actionSheetHandlers[i]
  if (!fn) {
    return
  }

  type File = {
    uri: string
    fileName: string
    filename: string
    name: string
    fileSize: number
    filesize: number
    size: number
    type: string
  }
  let file: File | null = null
  try {
    if (i === 3) {
      file = (await fn())?.[0] as File
    } else {
      file = (await fn()) as File
    }
  } catch (err) {
    // https://react-native-documents.github.io/docs/sponsor-only/errors#error-codes
    if (i === 3 && isErrorWithCode(err) && err.code === 'OPERATION_CANCELED') {
      console.warn('pickFile cancelled by user')
      return
    }
    if (
      !(
        err &&
        typeof err === 'object' &&
        'message' in err &&
        (err as any).message === 'User canceled document picker'
      )
    ) {
      onPickFileNativeError(err as Error)
    }
  }
  if (!file?.uri) {
    return
  }

  const getName = (p?: string) =>
    p?.split(/[\\/]/g).pop()?.replace(/\?.+$/, '') || 'untitled.bin'
  let name = file.fileName || file.filename || file.name || getName(file.uri)
  let size: string | number = file.fileSize || file.filesize || file.size || 0
  if (!size) {
    try {
      const stat = await RNFS.stat(file.uri)
      name = getName(stat.originalFilepath || stat.path) || name
      size = stat.size
    } catch (err) {
      console.error('pickFile RNFS.stat error:', err)
    }
  }

  let ext = name?.split('.').pop()?.replace(/\?.+$/, '')
  if (isIos && ext === name) {
    name = newUuid()
    switch (file.type) {
      case 'image':
        ext = 'jpg'
        break
      case 'video':
        ext = 'mp4'
        break
      case 'audio':
        ext = 'mp3'
        break
      default:
        break
    }
  }
  if (!ext) {
    ext = 'unknown'
  }
  if (!name?.toLowerCase().endsWith(ext.toLowerCase())) {
    name = name + '.' + ext
  }

  cb({ uri: file.uri, name, size })
}
