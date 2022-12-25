import { Platform } from 'react-native'
import WifiManager from 'react-native-wifi-reborn'

import { Account, accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
// @ts-ignore
import { PushNotification } from '../utils/PushNotification'
import { toBoolean } from '../utils/string'
import { PBX } from './pbx'
import { setSyncPnTokenModule } from './syncPnToken'
import { updatePhoneIndex } from './updatePhoneIndex'

const syncPnTokenWithoutCatch = async (
  p: Account,
  { noUpsert }: Pick<SyncPnTokenOption, 'noUpsert'>,
) => {
  console.log('PN sync debug: syncPnTokenWithoutCatch')

  if (Platform.OS === 'web') {
    // TODO should be implemented by now
    console.log('PN sync debug: not implemented yet on web browser')
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

  const pnEnabled = p.pushNotificationEnabled
  console.log(
    `PN sync debug: trying to turn ${pnEnabled ? 'on' : 'off'} PN for account ${
      p.pbxUsername
    }`,
  )

  const pbx = new PBX()
  pbx.isMainInstance = false
  const disconnectPbx = (success?: boolean) => {
    console.log('PBX PN debug: disconnect by syncPnToken')
    pbx.disconnect()
    if (success && !noUpsert) {
      accountStore.upsertAccount({
        id: p.id,
        pushNotificationEnabledSynced: true,
      })
    }
    accountStore.pnSyncLoadingMap[p.id] = false
  }

  try {
    await pbx.connect(p)

    const webPhone = await updatePhoneIndex(p, pbx)
    if (!webPhone) {
      console.log('PN sync debug: can not find webphone')
      disconnectPbx()
      return
    }

    const username = webPhone.id
    const device_id = await PushNotification.getToken()
    if (!device_id) {
      throw new Error('PN sync debug: Empty PN token')
    }

    const params = {
      username,
      device_id,
      voip: false,
    }
    const promises: Promise<unknown>[] = []

    if (Platform.OS === 'android') {
      const fn = pnEnabled ? pbx.setFcmPnToken : pbx.removeFcmPnToken
      promises.push(fn(params))
      promises.push(fn({ ...params, voip: true }))
    }

    if (Platform.OS === 'ios') {
      const tvoip = await PushNotification.getVoipToken()
      if (!tvoip) {
        throw new Error('PN sync debug: Empty ios voip PN token')
      }
      let shouldSetApns = pnEnabled
      const config = await pbx.getConfig()
      const lpcPort = parseInt(config?.['webphone.lpc.port'] || '0', 10)
      if (lpcPort) {
        shouldSetApns = toBoolean(config?.['webphone.lpc.pn'])
        const localSsid = (await WifiManager.getCurrentWifiSSID()) || ''
        const remoteSsids =
          config?.['webphone.lpc.wifi']
            ?.split(',')
            .map(w => w.trim())
            .filter(w => w) || []
        const tlsKeyHash = config?.['webphone.lpc.keyhash'] || ''
        console.log('PN sync debug: lpc data', {
          shouldSetApns,
          lpcPort,
          localSsid,
          remoteSsids,
          tlsKeyHash,
        })
        const fn = pnEnabled ? pbx.setLPCToken : pbx.removeLPCToken
        const lpcParams = {
          ...params,
          host: p.pbxHostname,
          port: lpcPort,
          localSsid,
          remoteSsids,
          tlsKeyHash,
        }
        promises.push(fn(lpcParams))
        promises.push(fn({ ...lpcParams, device_id: tvoip, voip: true }))
      }
      const fn = shouldSetApns ? pbx.setApnsToken : pbx.removeApnsToken
      promises.push(fn(params))
      promises.push(fn({ ...params, device_id: tvoip, voip: true }))
    }

    await Promise.all(promises)
    disconnectPbx(true)
  } catch (err) {
    console.error(err)
    disconnectPbx()
    return
  }
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
