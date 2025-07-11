import { isAndroid } from '#/config'
import { intl } from '#/stores/intl'
import { BrekekeUtils, defaultRingtone } from '#/utils/RnNativeModules'

export type RingtoneOptionsType = { key: string; label: string; uri?: string }[]

export const getRingtoneOptions = async (): Promise<RingtoneOptionsType> => {
  const ringtone = await BrekekeUtils.getRingtoneOptions()
  if (!!ringtone) {
    return [
      {
        key: defaultRingtone,
        label: intl`Use default`,
        uri: '',
      },
      ...ringtone.map(file => ({
        key: file.title,
        label: file.title,
        uri: isAndroid ? file.uri : '',
      })),
    ]
  }
  return []
}
