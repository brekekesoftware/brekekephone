import { isAndroid } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { BrekekeUtils } from '#/utils/RnNativeModules'

export type RingtoneOptionsType = { key: string; label: string; uri?: string }[]

export const getRingtoneOptions = async (): Promise<RingtoneOptionsType> => {
  const ringtone = await BrekekeUtils.getRingtoneOptions()
  if (!!ringtone) {
    return [
      {
        key: 'default',
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

export const getIdToPlayRingtone = () => {
  const account = ctx.auth.getCurrentAccount()
  const { pbxTenant, pbxUsername, pbxHostname } = account ?? {
    pbxTenant: '',
    pbxUsername: '',
  }
  return pbxUsername + pbxTenant + pbxHostname
}
