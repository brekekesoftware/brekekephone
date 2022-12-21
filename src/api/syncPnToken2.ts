import { Platform } from 'react-native'
import WifiManager from 'react-native-wifi-reborn'

import { Account, accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
// @ts-ignore
import { PushNotification } from '../utils/PushNotification'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { PBX } from './pbx'
import { setSyncPnTokenModule } from './syncPnToken'
import { updatePhoneIndex } from './updatePhoneIndex'

const syncPnTokenWithoutCatch = async (
  p: Account,
  { noUpsert }: Pick<SyncPnTokenOption, 'noUpsert'>,
) => {
  console.log('PN sync debug: syncPnTokenWithoutCatch')
  if (Platform.OS === 'web') {
    console.log('PN sync debug: invalid platform')
    return
  }

  if (!p.id || !p.pbxUsername) {
    console.log('PN sync debug: invalid data')
    return
  }

  if (accountStore.pnSyncLoadingMap[p.id]) {
    console.log('PN sync debug: sync is loading')
    return
  }
  accountStore.pnSyncLoadingMap[p.id] = true

  const pbx = new PBX()
  pbx.needToWait = false
  await pbx.connect(p)

  const webPhone = await updatePhoneIndex(p, pbx)
  if (!webPhone) {
    console.log('PN sync debug: can not find webphone')
    return
  }

  let t = await PushNotification.getToken()
  let tvoip = t
  if (Platform.OS === 'ios') {
    tvoip = await PushNotification.getVoipToken()
    if (!t) {
      t = tvoip
    }
  }
  const config = getAuthStore()?.pbxConfig
  const localSsid = (await WifiManager.getCurrentWifiSSID()) || ''
  const port = config?.['webphone.lpc.port']
    ? parseInt(config?.['webphone.lpc.port'])
    : 3000
  const remoteSsids = config?.['webphone.lpc.wifi.name']?.split(',') || []
  const tlsKey = config?.['webphone.lpc.hashkey'] || ''

  console.log('dev:::', {
    pushNotificationEnabled: p.pushNotificationEnabled,
    localSsid,
    port: config?.['webphone.lpc.port'],
    remoteSsids,
    tlsKey,
  })

  const fn =
    Platform.OS === 'ios'
      ? p.pushNotificationEnabled
        ? config?.['webphone.lpc.port']
          ? pbx.setLPCToken
          : pbx.setApnsToken
        : config?.['webphone.lpc.port']
        ? pbx.removeLPCToken
        : pbx.removeApnsToken
      : Platform.OS === 'android'
      ? p.pushNotificationEnabled
        ? pbx.setFcmPnToken
        : pbx.removeFcmPnToken
      : null
  if (!fn) {
    console.log('PN sync debug: invalid platform')
    return
  }

  console.log(
    `PN sync debug: trying to turn ${
      p.pushNotificationEnabled ? 'on' : 'off'
    } PN for account ${p.pbxUsername}`,
  )
  const arr: Promise<unknown>[] = []
  console.log('dev:::tvoip::', {
    t,
    tvoip,
  })
  if (t) {
    arr.push(
      fn({
        username: webPhone.id,
        device_id: t,
        voip: false,
        host: p.pbxHostname,
        localSsid,
        remoteSsids,
        tlsKey,
        port,
      }),
    )
  }
  if (tvoip) {
    arr.push(
      fn({
        username: webPhone.id,
        device_id: tvoip,
        voip: true,
        host: p.pbxHostname,
        localSsid,
        remoteSsids,
        tlsKey,
        port,
      }),
    )
  }
  await Promise.all(arr)

  console.log('PBX PN debug: disconnect by syncPnToken')
  pbx.disconnect()

  if (!noUpsert) {
    accountStore.upsertAccount({
      id: p.id,
      pushNotificationEnabledSynced: true,
    })
  }

  accountStore.pnSyncLoadingMap[p.id] = false
}

export interface SyncPnTokenOption {
  noUpsert?: boolean
  onError?: (err: Error) => void
}

const syncPnToken = (p: Account, o: SyncPnTokenOption = {}) => {
  return syncPnTokenWithoutCatch(p, o).catch((err: Error) => {
    accountStore.pnSyncLoadingMap[p.id] = false
    if (o.onError) {
      o.onError(err)
      return
    }
    console.error(
      `Failed to sync Push Notification settings for ${p.pbxUsername}`,
      err,
    )
  })
}

const syncPnTokenForAllAccounts = () => {
  accountStore.accounts.forEach(p => {
    if (p.pushNotificationEnabledSynced) {
      return
    }
    syncPnToken(p)
  })
}

const m = {
  sync: syncPnToken,
  syncForAllAccounts: syncPnTokenForAllAccounts,
}
setSyncPnTokenModule(m)

export type TSyncPnToken = typeof m
