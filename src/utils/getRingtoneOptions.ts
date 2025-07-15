import { intl } from '#/stores/intl'
import { BrekekeUtils, defaultRingtone } from '#/utils/BrekekeUtils'

export type RingtoneOption = {
  key: string
  label: string
}

export const getRingtoneOptions = async (): Promise<RingtoneOption[]> => {
  const arr = await BrekekeUtils.getRingtoneOptions()
  return [
    {
      key: defaultRingtone,
      label: intl`Use default`,
    },
    ...arr.map(r => ({
      key: r,
      label: r,
    })),
  ]
}
