import { keepLocalCopy, pick, types } from '@react-native-documents/picker'

import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

const MAX_ACCEPTABLE_SIZE = 1024 * 1024 // 1MB

export const pickRingtone = async () => {
  try {
    const res = await pick({
      mode: 'import',
      type: [types.audio],
      allowMultiSelection: false,
    })
    const { error, uri, size, name } = res[0]
    if (error || !name) {
      ctx.toast.warning(intl`This file cannot be selected`, 2000)
      return false
    }

    if (!name.endsWith('.mp3')) {
      ctx.toast.warning(intl`Only mp3 format supported`, 2000)
      return false
    }

    if ((size ?? 0) > MAX_ACCEPTABLE_SIZE) {
      ctx.toast.warning(intl`File size must not exceed 1MB`, 2000)
      return false
    }

    const s = await saveToCache(name, uri)
    if (s) {
      ctx.account.ringtonePicker[getFilenameWithoutExtension(name)] = true
      ctx.account.saveAccountsToLocalStorageDebounced()
      ctx.toast.success(intl`Select mp3 file successfully`, 2000)
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
    return r.localUri
  }
  return ''
}

const getFilenameWithoutExtension = (n: string) => {
  const l = n.lastIndexOf('.')
  return l != -1 ? n.substring(0, l) : n
}
