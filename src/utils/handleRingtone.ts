import { intl } from '#/stores/intl'
import { BrekekeUtils, defaultRingtone } from '#/utils/RnNativeModules'

export type RingtoneOption = {
  key: string
  label: string
  uri: string
}

export const getRingtoneOptions = async (): Promise<RingtoneOption[]> => {
  const arr = await BrekekeUtils.getRingtoneOptions()
  return [
    {
      key: defaultRingtone,
      label: intl`Use default`,
      uri: '',
    },
    ...arr.map(r => ({
      key: r.title,
      label: r.title,
      uri: r.uri || '',
    })),
  ]
}
