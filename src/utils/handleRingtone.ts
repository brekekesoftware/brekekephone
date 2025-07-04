import { isAndroid } from '#/config'
import { ctx } from '#/stores/ctx'
import { BrekekeUtils } from '#/utils/RnNativeModules'

export const staticRingtones = [
  'incallmanager_ringtone',
  'ding',
  'incallmanager_ringback',
]

export type RingtoneOptionsType = { key: string; label: string; uri?: string }[]

export const getRingtoneOptions = async (): Promise<RingtoneOptionsType> => {
  const ringtone = await BrekekeUtils.getSystemRingtones()
  let options: RingtoneOptionsType = []
  if (!!ringtone) {
    options = ringtone.map(file => ({
      key: file.title,
      label: file.title,
      uri: isAndroid ? file.uri : '',
    }))
  }
  return [
    ...options,
    ...staticRingtones.map(v => ({
      key: v,
      label: v,
    })),
  ]
}

export const getIdToPlayRingtone = () => {
  const account = ctx.auth.getCurrentAccount()
  const { pbxTenant, pbxUsername, pbxHostname } = account ?? {
    pbxTenant: '',
    pbxUsername: '',
  }
  return pbxUsername + pbxTenant + pbxHostname
}
