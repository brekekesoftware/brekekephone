import WifiManager from 'react-native-wifi-reborn'

import { isAndroid, isIos, isWeb } from '../config'
import type { Account } from '../stores/accountStore'
import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { compareSemVer } from '../stores/debugStore'
import { checkFineLocation, permFineLocation } from '../utils/permissions'
import { PushNotification } from '../utils/PushNotification'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { toBoolean } from '../utils/string'
import { waitTimeout } from '../utils/waitTimeout'
import { PBX } from './pbx'
import { PnCommand, PnServiceId } from './pnConfig'
import { setSyncPnTokenModule } from './syncPnToken'
import { updatePhoneIndex } from './updatePhoneIndex'

let locationPerm: boolean | null = null
const syncPnTokenWithoutCatch = async (
  p: Account,
  { noUpsert }: Pick<SyncPnTokenOption, 'noUpsert'>,
) => {
  console.log('PN sync debug: syncPnTokenWithoutCatch')

  if (isWeb) {
    // TODO:should be implemented by now
    console.log('PN sync debug: not implemented yet on web browser')
    return
  }

  if (!p.pbxUsername) {
    console.log('PN sync debug: invalid data')
    return
  }

  const pnEnabled =
    !getAuthStore().pbxLoginFromAnotherPlace && p.pushNotificationEnabled
  console.log(
    `PN sync debug: trying to turn ${pnEnabled ? 'on' : 'off'} PN for account ${
      p.pbxUsername
    }`,
  )

  const pbx = new PBX()
  pbx.isMainInstance = false
  const disconnectPbx = (success?: boolean) => {
    console.log(
      `PN sync debug: pbx disconnect by syncPnToken success=${success} noUpsert=${noUpsert}`,
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
    const success = await pbx.connect(p, false, true)
    if (!success) {
      console.log('PN sync debug: failed to connect to pbx')
      return disconnectPbx()
    }

    const webPhone = await updatePhoneIndex(p, pbx)
    if (!webPhone) {
      console.log('PN sync debug: can not find webphone')
      return disconnectPbx()
    }

    const username = webPhone.id
    let t = await PushNotification.getToken()
    let tvoip = t
    if (isIos) {
      tvoip = await PushNotification.getVoipToken()
      if (!tvoip) {
        throw new Error('PN sync debug: empty ios voip PN token')
      }
      if (!t) {
        // TODO: pn token empty when dev app refresh?
        console.error('PN sync debug: empty ios PN token')
        t = tvoip
      }
    }
    if (!t) {
      throw new Error('PN sync debug: Empty PN token')
    }

    const c = await pbx.getConfig()
    if (!c) {
      console.error('PN sync debug: empty getProductInfo')
      return
    }
    const pnmanageNew = compareSemVer(c.version, '3.14.5') >= 0
    console.log(
      `PN sync debug: pbx version=${c.version} pnmanageNew=${pnmanageNew}`,
    )

    const params = {
      username,
      device_id: t,
    }
    const newParams = pnmanageNew
      ? {
          ...params,
          command: pnEnabled ? PnCommand.set : PnCommand.remove,
          service_id: [isAndroid ? PnServiceId.fcm : PnServiceId.apns],
          pnmanageNew: true,
          device_id_voip: tvoip,
        }
      : undefined

    const lpcPort = parseInt(c['webphone.lpc.port'] || '0', 10)
    const tlsKeyHash = c['webphone.lpc.keyhash'] || ''
    // never establish plain non-tls lpc connection
    const lpcEnabled = lpcPort && tlsKeyHash
    if (lpcPort && !tlsKeyHash) {
      console.warn(
        'webphone.lpc.port is present but empty webphone.lpc.keyhash, thus lpc is disabled since we dont allow non-tls lpc connection',
      )
    }
    // if lpc is enabled pnmanageNew must be true
    // since lpc is only available in pbx 3.14.5 and above
    if (!lpcEnabled || !newParams) {
      BrekekeUtils.disableLPC()
      if (newParams) {
        await pbx.pnmanage(newParams)
      } else {
        // backward compatibility
        const fn = isAndroid
          ? pnEnabled
            ? pbx.setFcmPnToken
            : pbx.removeFcmPnToken
          : pnEnabled
            ? pbx.setApnsToken
            : pbx.removeApnsToken
        await Promise.all([
          fn(params),
          fn({ ...params, device_id: tvoip, voip: true }),
        ])
      }
      locationPerm = null
      return disconnectPbx(true)
    }

    if (isAndroid) {
      // request access fine location to get current ssid
      const granted = await permFineLocation()
      locationPerm = granted
      if (!granted) {
        BrekekeUtils.disableLPC()
        // set flag -> "blocked"
        return disconnectPbx(true)
      }
    }

    const remoteSsids =
      c['webphone.lpc.wifi']
        ?.split(',')
        .map(w => w.trim())
        .filter(w => w) || []
    const localSsid = remoteSsids.length && isIos ? '' : await getLocalSsid()

    const lpcPn = toBoolean(c['webphone.lpc.pn'])
    console.log('PN sync debug: lpc data', {
      pnmanageNew,
      lpcPort,
      remoteSsids,
      localSsid,
      tlsKeyHash,
      lpcPn,
      t,
      tvoip,
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
      newParams.service_id.push(isAndroid ? PnServiceId.fcm : PnServiceId.apns)
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

const syncPnTokenForAllAccounts = async () => {
  // If locationPerm = null then do not check for permission changes anymore
  const noCheckChange = locationPerm === null
  // Check if user changed location permissions in App Info
  // If true, resync

  const isChange = noCheckChange
    ? false
    : (await checkFineLocation()) !== locationPerm
  accountStore.accounts.forEach(a => {
    if (a.pushNotificationEnabledSynced && !isChange) {
      return
    }
    syncPnToken(a)
  })
}

const m = {
  sync: syncPnToken,
  syncForAllAccounts: syncPnTokenForAllAccounts,
}
setSyncPnTokenModule(m)

export type TSyncPnToken = typeof m

const getLocalSsid = () =>
  Promise.race([WifiManager.getCurrentWifiSSID(), waitTimeout(10000)])
    .then(v => v || '')
    .catch(() => '')
