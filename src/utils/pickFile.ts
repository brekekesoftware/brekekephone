import { Platform } from 'react-native'
import DocumentRnPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import ImagePicker from 'react-native-image-picker'
import { v4 as newUuid } from 'react-native-uuid'

import RnPicker from '../stores/RnPicker'
import { onPickFileNativeError, pickFileNativeOptions } from './pickFile.web'

const actionSheetHandlers = [
  () =>
    new Promise((resolve, reject) => {
      ImagePicker.launchCamera(
        {
          mediaType: 'photo',
          cameraType: 'back',
          storageOptions: {
            privateDirectory: true,
          },
        },
        res =>
          res.didCancel
            ? resolve(null)
            : res.error
            ? reject(res.error)
            : resolve(res),
      )
    }),
  () =>
    new Promise((resolve, reject) => {
      ImagePicker.launchCamera(
        {
          mediaType: 'video',
          cameraType: 'back',
        },
        res =>
          res.didCancel
            ? resolve(null)
            : res.error
            ? reject(res.error)
            : resolve(res),
      )
    }),
  () =>
    new Promise((resolve, reject) => {
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'mixed',
        },
        res =>
          res.didCancel
            ? resolve(null)
            : res.error
            ? reject(res.error)
            : resolve(res),
      )
    }),
  () =>
    DocumentRnPicker.pick({
      type: [DocumentRnPicker.types.allFiles],
    }),
]

const pickFile = (cb: Function) =>
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
    file = (await fn()) as File
  } catch (err) {
    if (!DocumentRnPicker.isCancel(err)) {
      onPickFileNativeError(err)
    }
  }
  if (!file?.uri) {
    return
  }

  const getName = (p: string) =>
    p && p.split(/[\\/]/g).pop()?.replace(/\?.+$/, '')
  let name = file.fileName || file.filename || file.name || getName(file.uri)
  let size: string | number = file.fileSize || file.filesize || file.size || 0
  if (!size) {
    try {
      const stat = await RNFS.stat(file.uri)
      name = getName(stat.originalFilepath || stat.path) || name
      size = stat.size
    } catch (err) {}
  }

  let ext = name?.split('.').pop()?.replace(/\?.+$/, '')
  if (Platform.OS === 'ios' && ext === name) {
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

export default pickFile
