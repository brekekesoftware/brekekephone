import { Platform } from 'react-native'

import { Account, accountStore } from '../stores/accountStore'
// @ts-ignore
import { PushNotification } from '../utils/PushNotification'
import { PBX } from './pbx'
import { setSyncPnTokenModule } from './syncPnToken'
import { updatePhoneIndex } from './updatePhoneIndex'

const syncPnTokenWithoutCatch = async (
  p: Account,
  { noUpsert }: Pick<SyncPnTokenOption, 'noUpsert'>,
) => {
  if (Platform.OS === 'web') {
    console.log('PN sync debug: invalid platform')
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
  t = 'a20a2ad59457ae42fd3a14a93241ea25074756ba26067d8cfd1604401a61fc11'
  tvoip = 'a20a2ad59457ae42fd3a14a93241ea25074756ba26067d8cfd1604401a61fc11'

  const fn =
    Platform.OS === 'ios'
      ? p.pushNotificationEnabled
        ? pbx.setLPCToken
        : pbx.removeLPCToken
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
  if (t) {
    arr.push(
      fn({
        username: webPhone.id,
        device_id: t,
      }),
    )
  }
  if (tvoip) {
    arr.push(
      fn({
        username: webPhone.id,
        device_id: tvoip,
        voip: true,
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
