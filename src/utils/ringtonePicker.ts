import { keepLocalCopy, pick, types } from '@react-native-documents/picker'
import RNFS from 'react-native-fs'

import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import type { RingtoneOption } from '#/utils/getRingtoneOptions'
import { getRingtoneOptions } from '#/utils/getRingtoneOptions'

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
    return {
      name,
      uri,
    }
  } catch (err) {}
  return false
}

const saveToCache = async (f: string, uri: string) => {
  try {
    const [r] = await keepLocalCopy({
      files: [
        {
          uri,
          fileName: f,
        },
      ],
      destination: 'documentDirectory',
      folderName: 'Ringtones',
    })
    if (r.status === 'success') {
      ctx.account.ringtonePicker[getFilenameWithoutExtension(f)] = true
      await ctx.account.saveAccountsToLocalStorageWithoutDebounced()
      ctx.toast.success(intl`Select mp3 file successfully`, 2000)
      return true
    }
  } catch (error) {
    console.log('[RingtonePicker]: error saving ringtone to cache: ', error)
  }
  return false
}

const getFilenameWithoutExtension = (n: string) => {
  const l = n.lastIndexOf('.')
  return l != -1 ? n.substring(0, l) : n
}

const validateRingtoneFile = (f: string, ro: RingtoneOption[]) =>
  ro.findIndex(r => r.key === f) !== -1

const removeRingtoneFile = async (f: string) => {
  const path = `${RNFS.DocumentDirectoryPath}/Ringtones/${f}`
  try {
    const exists = await RNFS.exists(path)
    if (!exists) {
      console.log('[RingtonePicker]: Not found ', path)
      return
    }
    await RNFS.unlink(path)
    return true
  } catch (error) {}
  return
}

const promptReplaceRingtone = async (
  callback: () => Promise<void>,
  name: string,
) => {
  RnAlert.prompt({
    title: intl`Replace ringtone`,
    message: intl`Do you want to replace this file?`,
    onConfirm: async () => {
      const removed = await removeRingtoneFile(name)
      if (removed) {
        await callback()
      }
    },
    confirmText: intl`REPLACE`,
  })
}

export const handleUploadRingtone = async (
  ringtoneOptions: RingtoneOption[],
  updateRingtoneOptions: (options: RingtoneOption[]) => Promise<void> | void,
) => {
  const picked = await pickRingtone()
  if (!picked) {
    return
  }
  const { name, uri } = picked
  const saveAndRefresh = async () => {
    const saved = await saveToCache(name, uri)
    if (!saved) {
      return
    }
    const options = await getRingtoneOptions()
    await updateRingtoneOptions(options)
  }
  const isDuplicated = validateRingtoneFile(
    getFilenameWithoutExtension(name),
    ringtoneOptions,
  )
  if (isDuplicated) {
    await promptReplaceRingtone(saveAndRefresh, name)
    return
  }

  await saveAndRefresh()
}
