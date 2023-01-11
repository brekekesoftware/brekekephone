import { Platform } from 'react-native'
import WifiManager from 'react-native-wifi-reborn'

import { Account, accountStore } from '../stores/accountStore'
import { compareSemVer } from '../stores/debugStore'
// @ts-ignore
import { PushNotification } from '../utils/PushNotification'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { toBoolean } from '../utils/string'
import { PBX } from './pbx'
import { PnCommand, PnServiceId } from './pnConfig'
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

  if (!p.pbxUsername) {
    console.log('PN sync debug: invalid data')
    return
  }

  const pnEnabled = p.pushNotificationEnabled
  console.log(
    `PN sync debug: trying to turn ${pnEnabled ? 'on' : 'off'} PN for account ${
      p.pbxUsername
    }`,
  )

  const pbx = new PBX()
  pbx.isMainInstance = false
  const disconnectPbx = (success?: boolean) => {
    console.log(
      `PBX PN debug: disconnect by syncPnToken success=${success} noUpsert=${noUpsert}`,
    )
    pbx.disconnect()
    if (success && !noUpsert && p.id) {
      accountStore.upsertAccount({
        id: p.id,
        pushNotificationEnabledSynced: true,
      })
    }
  }

  try {
    await pbx.connect(p)

    const webPhone = await updatePhoneIndex(p, pbx)
    if (!webPhone) {
      console.log('PN sync debug: can not find webphone')
      return disconnectPbx()
    }

    const username = webPhone.id
    let t = await PushNotification.getToken()
    let tvoip = t
    if (Platform.OS === 'ios') {
      tvoip = await PushNotification.getVoipToken()
      if (!tvoip) {
        throw new Error('PN sync debug: Empty ios voip PN token')
      }
      if (!t) {
        // TODO pn token empty when dev app refresh?
        t = tvoip
      }
    }
    if (!t) {
      throw new Error('PN sync debug: Empty PN token')
    }

    const c = await pbx.getConfig()
    const pnmanageNew = compareSemVer(c?.version, '3.14.5') >= 0
    console.log(
      `PN sync debug: pbx version=${c?.version} pnmanageNew=${pnmanageNew}`,
    )

    const params = {
      username,
      device_id: t,
    }
    const newParams = pnmanageNew
      ? {
          ...params,
          command: pnEnabled ? PnCommand.set : PnCommand.remove,
          service_id: [
            Platform.OS === 'android' ? PnServiceId.fcm : PnServiceId.apns,
          ],
          pnmanageNew: true,
          device_id_voip: tvoip,
        }
      : undefined

    if (Platform.OS === 'android') {
      if (newParams) {
        await pbx.pnmanage(newParams)
      } else {
        // backward compatibility
        const fn = pnEnabled ? pbx.setFcmPnToken : pbx.removeFcmPnToken
        await Promise.all([fn(params), fn({ ...params, voip: true })])
      }
      return disconnectPbx(true)
    }

    const lpcPort = parseInt(c?.['webphone.lpc.port'] || '0', 10)
    // if lpc is enabled pnmanageNew must be true
    // since lpc is only available in pbx 3.14.5 and above
    if (!lpcPort || !newParams) {
      BrekekeUtils.disableLPC()
      if (newParams) {
        await pbx.pnmanage(newParams)
      } else {
        // backward compatibility
        const fn = pnEnabled ? pbx.setApnsToken : pbx.removeApnsToken
        await Promise.all([
          fn(params),
          fn({ ...params, device_id: tvoip, voip: true }),
        ])
      }
      return disconnectPbx(true)
    }

    const remoteSsids =
      c?.['webphone.lpc.wifi']
        ?.split(',')
        .map(w => w.trim())
        .filter(w => w) || []
    const localSsid = remoteSsids.length ? '' : await getLocalSsid()
    const tlsKeyHash = c?.['webphone.lpc.keyhash'] || ''
    const lpcPn = toBoolean(c?.['webphone.lpc.pn'])
    console.log('PN sync debug: lpc data', {
      pnmanageNew,
      lpcPort,
      remoteSsids,
      localSsid,
      tlsKeyHash,
      lpcPn,
    })
    if (pnEnabled) {
      BrekekeUtils.enableLPC(
        t,
        tvoip,
        username,
        p.pbxHostname,
        lpcPort,
        remoteSsids,
        localSsid,
        tlsKeyHash,
      )
    } else {
      BrekekeUtils.disableLPC()
    }
    newParams.service_id = [PnServiceId.lpc]
    if (lpcPn) {
      newParams.service_id.push(PnServiceId.apns)
    }
    await pbx.pnmanage(newParams)
    return disconnectPbx(true)
  } catch (err) {
    console.error('PN sync debug: catch error:', err)
    return disconnectPbx()
  }
}

export interface SyncPnTokenOption {
  noUpsert?: boolean
  onError?: (err: Error) => void
}

const syncPnToken = async (p: Account, o: SyncPnTokenOption = {}) => {
  if (accountStore.pnSyncLoadingMap[p.id]) {
    console.log('PN sync debug: sync is loading')
    return
  }
  accountStore.pnSyncLoadingMap[p.id] = true
  await syncPnTokenWithoutCatch(p, o).catch((err: Error) => {
    if (o.onError) {
      o.onError(err)
      return
    }
    console.error(
      `Failed to sync Push Notification settings for ${p.pbxUsername}`,
      err,
    )
  })
  accountStore.pnSyncLoadingMap[p.id] = false
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

const getLocalSsid = () =>
  Promise.race([
    WifiManager.getCurrentWifiSSID(),
    new Promise<string | undefined>(r => setTimeout(r, 10000)),
  ])
    .then(v => v || '')
    .catch(() => '')
