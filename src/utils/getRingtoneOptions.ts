import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { BrekekeUtils, defaultRingtone } from '#/utils/BrekekeUtils'

export type RingtoneOption = {
  key: string
  label: string
}

export const getRingtoneOptions = async (): Promise<RingtoneOption[]> => {
  const arr = await BrekekeUtils.getRingtoneOptions()
  return handleRingtoneOptions(arr)
}

export const handleRingtoneOptions = (options: string[]): RingtoneOption[] => [
  {
    key: defaultRingtone,
    label: intl`Use default`,
  },
  ...options.map(r => ({
    key: r,
    label: r,
  })),
]

export const handleRingtoneOptionsInSetting = async (): Promise<{
  ro: RingtoneOption[]
  r: string
}> => {
  const r = await BrekekeUtils.getRingtoneOptions()
  if (!r || !r.length) {
    return {
      ro: handleRingtoneOptions(r),
      r: getCurrentRingtone(),
    }
  }
  const rp = Object.keys(ctx.account.ringtonePicker)
  const s = new Set(r)
  let hasChange = false
  const ca = ctx.auth.getCurrentAccount()
  rp.forEach(v => {
    if (!s.has(v)) {
      delete ctx.account.ringtonePicker[v]
      if (ca && ca.ringtoneFromLocal === v) {
        ca.ringtoneFromLocal = defaultRingtone
      }
      hasChange = true
    }
  })
  if (hasChange) {
    ctx.account.saveAccountsToLocalStorageDebounced()
  }

  return {
    ro: handleRingtoneOptions(r),
    r: ca?.ringtoneFromLocal ?? defaultRingtone,
  }
}

export const getCurrentRingtone = (): string => {
  const ca = ctx.auth.getCurrentAccount()
  return ca?.ringtoneFromLocal || defaultRingtone
}
