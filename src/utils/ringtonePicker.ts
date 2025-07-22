import { keepLocalCopy, pick, types } from '@react-native-documents/picker'

import { ctx } from '#/stores/ctx'

const MAX_ACCEPTABLE_SIZE = 1024 * 1024 // 1MB

export const pickRingtone = async () => {
  try {
    const res = await pick({
      mode: 'open',
      type: [types.audio],
      allowMultiSelection: false,
    })
    console.log(`Hoang: res ${res} `)
    const { error, uri, size, name } = res[0]
    if (error || !name) {
      // show toast
      return false
    }

    if (!name.endsWith('.mp3')) {
      // show toast
      ctx.toast.warning('Only support mp3', 2000)
      return false
    }

    if ((size ?? 0) > MAX_ACCEPTABLE_SIZE) {
      // show toast
      ctx.toast.warning('File size too large', 2000)
      return false
    }

    const s = await saveToCache(name, uri)
    if (s) {
      ctx.account.ringtonePicker[getFilenameWithoutExtension(name)] = {
        uri: s,
      }
      ctx.account.saveAccountsToLocalStorageDebounced()
      ctx.toast.success('Pick file ' + getFilenameWithoutExtension(name), 2000)
      return true
    }
  } catch (err) {}
  return false
}

const saveToCache = async (f: string, uri: string) => {
  const [r] = await keepLocalCopy({
    files: [
      {
        uri,
        fileName: f,
      },
    ],
    destination: 'documentDirectory',
  })
  if (r.status === 'success') {
    // do something with the local copy:
    console.log('Hoang: r.localUri ', r.localUri)
    return r.localUri
  }
  return ''
}

const getFilenameWithoutExtension = (n: string) => {
  const l = n.lastIndexOf('.')
  return l != -1 ? n.substring(0, l) : n
}
