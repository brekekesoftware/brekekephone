import 'brekekejs/lib/jsonrpc'
import 'brekekejs/lib/pal'

import EventEmitter from 'eventemitter3'
import { Platform } from 'react-native'

import { embedApi } from '../embed/embedApi'
import { Account, accountStore } from '../stores/accountStore'
import { getAuthStore, waitPbx } from '../stores/authStore'
import { PbxUser, Phonebook2 } from '../stores/contactStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { toBoolean } from '../utils/string'
import { Pbx, PbxEvent } from './brekekejs'
import { parsePalParams } from './parsePalParams'

export class PBX extends EventEmitter {
  client?: Pbx
  private connectTimeoutId = 0

  // wait auth state to success
  needToWait = true

  connect = async (p: Account, palParamUserReconnect?: boolean) => {
    console.log('PBX PN debug: call pbx.connect')
    if (this.client) {
      console.warn('PAL client already connected, ignore...')
      return
    }

    const d = await accountStore.getAccountDataAsync(p)
    const oldPalParamUser = d.palParams?.['user']
    console.log(
      `PBX PN debug: construct pbx.client - webphone.pal.param.user=${oldPalParamUser}`,
    )

    const wsUri = `wss://${p.pbxHostname}:${p.pbxPort}/pbx/ws`
    const client = window.Brekeke.pbx.getPal(wsUri, {
      tenant: p.pbxTenant,
      login_user: p.pbxUsername,
      login_password: p.pbxPassword,
      _wn: d.accessToken,
      park: p.parks || [],
      voicemail: 'self',
      status: true,
      secure_login_password: false,
      phonetype: 'webphone',
      callrecording: 'self',
      ...d.palParams,
      ...embedApi._palParams,
    })
    this.client = client

    client.call_pal = ((method: keyof Pbx, params?: object) => {
      return new Promise((resolve, reject) => {
        const f = (client[method] as Function).bind(client) as Function
        if (typeof f !== 'function') {
          return reject(new Error(`PAL client doesn't support "${method}"`))
        }
        f(params, resolve, reject)
      })
    }) as unknown as Pbx['call_pal']

    client.debugLevel = 2

    await Promise.race([
      new Promise((_, reject) => {
        this.connectTimeoutId = BackgroundTimer.setTimeout(() => {
          client.close()
          // Fix case already reconnected
          if (client === this.client) {
            reject(new Error('Timeout'))
          }
        }, 10000)
      }),
      new Promise((resolve, reject) => {
        client.login(() => resolve(undefined), reject)
      }),
    ])

    const pendingServerStatuses: PbxEvent['serverStatus'][] = []
    client.notify_serverstatus = e => pendingServerStatuses.push(e)
    // Check again webphone.pal.param.user
    if (!palParamUserReconnect) {
      const as = getAuthStore()
      // TODO may any function get pbxConfig on this time may get undefined
      as.pbxConfig = undefined
      await this.getConfig(true)
      const newPalParamUser = as.pbxConfig?.['webphone.pal.param.user']
      if (newPalParamUser !== oldPalParamUser) {
        console.warn(
          `Attempt to reconnect due to mismatch webphone.pal.param.user after login: old=${oldPalParamUser} new=${newPalParamUser}`,
        )
        this.disconnect()
        await this.connect(p, true)
        return
      }
    }

    this.clearConnectTimeoutId()
    embedApi.emit('pal', p, client)

    client.onClose = () => {
      this.emit('connection-stopped')
    }

    client.onError = err => {
      console.error('pbx.client.onError:', err)
    }

    client.notify_serverstatus = e => {
      if (e?.status === 'active') {
        return this.emit('connection-started')
      }
      if (e?.status === 'inactive') {
        return this.emit('connection-stopped')
      }
      return
    }
    pendingServerStatuses.forEach(client.notify_serverstatus)

    // {"room_id":"282000000230","talker_id":"1416","time":1587451427817,"park":"777","status":"on"}
    // {"time":1587451575120,"park":"777","status":"off"}
    client.notify_park = e => {
      // TODO
      if (e?.status === 'on') {
        return this.emit('park-started', e.park)
      }
      if (e?.status === 'off') {
        return this.emit('park-stopped', e.park)
      }
      return
    }
    client.notify_callrecording = e => {
      if (!e) {
        return
      }
      this.emit('call-recording', e)
    }

    client.notify_voicemail = e => {
      if (!e) {
        return
      }
      this.emit('voicemail-updated', e)
    }

    client.notify_status = e => {
      if (!e) {
        return
      }
      switch (e.status) {
        case '14':
        case '2':
        case '36':
          return this.emit('user-talking', {
            user: e.user,
            talker: e.talker_id,
          })
        case '35':
          return this.emit('user-holding', {
            user: e.user,
            talker: e.talker_id,
          })
        case '-1':
          return this.emit('user-hanging', {
            user: e.user,
            talker: e.talker_id,
          })
        case '1':
          return this.emit('user-calling', {
            user: e.user,
            talker: e.talker_id,
          })
        case '65':
          return this.emit('user-ringing', {
            user: e.user,
            talker: e.talker_id,
          })
        default:
          return
      }
    }
  }

  disconnect = () => {
    if (this.client) {
      this.client.close()
      this.client = undefined
      console.log('PBX PN debug: pbx.client set to null')
    }
    this.clearConnectTimeoutId()
  }
  private clearConnectTimeoutId = () => {
    if (this.connectTimeoutId) {
      BackgroundTimer.clearTimeout(this.connectTimeoutId)
      this.connectTimeoutId = 0
    }
  }

  getConfig = async (force?: boolean) => {
    const s = getAuthStore()
    if (s.pbxConfig) {
      return s.pbxConfig
    }
    if (this.needToWait && !force) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    s.pbxConfig = await this.client.call_pal('getProductInfo', {
      webphone: 'true',
    })
    const d = await s.getCurrentDataAsync()
    if (Platform.OS === 'android') {
      BrekekeUtils.setConfig(
        s.pbxConfig?.['webphone.call.transfer'] === 'false',
        s.pbxConfig?.['webphone.call.park'] === 'false',
        s.pbxConfig?.['webphone.call.video'] === 'false',
        s.pbxConfig?.['webphone.call.speaker'] === 'false',
        s.pbxConfig?.['webphone.call.mute'] === 'false',
        s.pbxConfig?.['webphone.call.record'] === 'false',
        s.pbxConfig?.['webphone.call.dtmf'] === 'false',
        s.pbxConfig?.['webphone.call.hold'] === 'false',
      )
    }
    d.palParams = parsePalParams(s.pbxConfig)
    accountStore.updateAccountData(d)
    return s.pbxConfig
  }

  createSIPAccessToken = async (sipUsername: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    return this.client.call_pal('createAuthHeader', {
      username: sipUsername,
    })
  }

  getUsers = async (tenant: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    return this.client.call_pal('getExtensions', {
      tenant,
      pattern: '..*',
      limit: -1,
      type: 'user',
      property_names: ['name'],
    })
  }
  getExtraUsers = async (ids: string[]): Promise<PbxUser[] | undefined> => {
    if (this.needToWait) {
      await waitPbx()
    }
    const cp = getAuthStore().getCurrentAccount()
    if (!this.client || !cp) {
      return
    }
    const res = await this.client.call_pal('getExtensionProperties', {
      tenant: cp.pbxTenant,
      extension: ids,
      property_names: ['name'],
    })
    // server return "No permission." if id not exist on Pbx.
    return res.map((r, i) => ({
      id: ids[i],
      name: (r as unknown as string) === 'No permission.' ? '' : r[0],
    }))
  }

  getPbxPropertiesForCurrentUser = async (tenant: string, userId: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }

    const [res] = await this.client.call_pal('getExtensionProperties', {
      tenant,
      extension: [userId],
      property_names: [
        'name',
        'p1_ptype',
        'p2_ptype',
        'p3_ptype',
        'p4_ptype',
        'pnumber',
        'language',
      ],
    })

    const pnumber = ('' + res[5]).split(',')

    const phones = [
      {
        id: pnumber[0],
        type: res[1],
      },
      {
        id: pnumber[1],
        type: res[2],
      },
      {
        id: pnumber[2],
        type: res[3],
      },
      {
        id: pnumber[3],
        type: res[4],
      },
    ]

    const lang = res[6]
    const userName = res[0]

    return {
      id: userId,
      name: userName,
      phones,
      language: lang,
    }
  }

  getContacts = async ({
    search_text,
    shared,
    offset,
    limit,
  }: {
    search_text: string
    shared: boolean
    offset: number
    limit: number
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('getContactList', {
      phonebook: '',
      search_text,
      // The shared is just indicate if the phonebook is shared or not.
      // In the future, maybe you can add a filter like PBX UI.
      //shared,
      offset,
      limit,
    })
    return res.map(contact => ({
      id: contact.aid,
      display_name: contact.display_name,
      phonebook: contact.phonebook,
      user: contact.user,
      shared: !!!contact?.user,
      info: {},
    }))
  }
  getPhonebooks = async () => {
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('getPhonebooks', {})
    return res?.filter(item => !!!item.shared) || []
  }
  getContact = async (id: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }

    const res = await this.client.call_pal('getContact', {
      aid: id,
    })

    res.info = res.info || {}
    return {
      id: res.aid,
      display_name: res.display_name,
      phonebook: res.phonebook,
      shared: toBoolean(res.shared),
      info: res.info,
    }
  }
  deleteContact = async (id: string[]) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('deleteContact', {
      aid: id,
    })
    return res
  }
  setContact = async (contact: Phonebook2) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    return this.client.call_pal('setContact', {
      aid: contact.id,
      phonebook: contact.phonebook,
      shared: contact.shared ? 'true' : 'false',
      display_name: contact.display_name,
      info: contact.info,
    })
  }

  holdTalker = async (tenant: string, talker: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('hold', {
      tenant,
      tid: talker,
    })
    return true
  }

  unholdTalker = async (tenant: string, talker: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('unhold', {
      tenant,
      tid: talker,
    })
    return true
  }

  startRecordingTalker = async (tenant: string, talker: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('startRecording', {
      tenant,
      tid: talker,
    })
    return true
  }

  stopRecordingTalker = async (tenant: string, talker: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('stopRecording', {
      tenant,
      tid: talker,
    })
    return true
  }

  transferTalkerBlind = async (
    tenant: string,
    talker: string,
    toUser: string,
  ) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('transfer', {
      tenant,
      user: toUser,
      tid: talker,
      mode: 'blind',
    })
    return true
  }

  transferTalkerAttended = async (
    tenant: string,
    talker: string,
    toUser: string,
  ) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('transfer', {
      tenant,
      user: toUser,
      tid: talker,
    })
    return true
  }

  joinTalkerTransfer = async (tenant: string, talker: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('conference', {
      tenant,
      tid: talker,
    })
    return true
  }

  stopTalkerTransfer = async (tenant: string, talker: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('cancelTransfer', {
      tenant,
      tid: talker,
    })
    return true
  }

  parkTalker = async (tenant: string, talker: string, atNumber: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('park', {
      tenant,
      tid: talker,
      number: atNumber,
    })
    return true
  }

  sendDTMF = async (signal: string, tenant: string, talker_id: string) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('sendDTMF', {
      signal,
      tenant,
      talker_id,
    })
    return true
  }
  setLPCToken = async ({
    device_id,
    username,
    voip = false,
    host,
    ssid,
  }: {
    device_id: string
    username: string
    voip?: boolean
    host: string
    ssid: string
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    // await this.removeApnsToken({device_id, username, voip})
    await this.client.call_pal('pnmanage', {
      command: 'set',
      service_id: '4',
      application_id: 'com.brekeke.phonedev' + (voip ? '.voip' : ''),
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    BrekekeUtils.enableLPC(
      device_id,
      'com.brekeke.phonedev',
      username,
      ssid,
      host,
    )
    return true
  }

  setApnsToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }

    await this.client.call_pal('pnmanage', {
      command: 'set',
      service_id: '11',
      application_id: 'com.brekeke.phonedev' + (voip ? '.voip' : ''),
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    BrekekeUtils.disableLPC()
    return true
  }

  setFcmPnToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('pnmanage', {
      command: 'set',
      service_id: '12',
      application_id: '22177122297',
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    return true
  }
  removeApnsToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('pnmanage', {
      command: 'remove',
      service_id: '11',
      application_id: 'com.brekeke.phonedev' + (voip ? '.voip' : ''),
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    return true
  }
  removeLPCToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('pnmanage', {
      command: 'remove',
      service_id: '4',
      application_id: 'com.brekeke.phonedev' + (voip ? '.voip' : ''),
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })

    BrekekeUtils.disableLPC()

    return true
  }

  removeFcmPnToken = async ({
    device_id,
    username,
    voip = false,
  }: {
    device_id: string
    username: string
    voip?: boolean
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client.call_pal('pnmanage', {
      command: 'remove',
      service_id: '12',
      application_id: '22177122297',
      user_agent: 'react-native',
      username: username + (voip ? '@voip' : ''),
      device_id,
    })
    return true
  }

  addWebPnToken = async ({
    auth_secret,
    endpoint,
    key,
    username,
  }: {
    auth_secret: string
    endpoint: string
    username: string
    key: string
  }) => {
    if (this.needToWait) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    await this.client
      .call_pal('pnmanage', {
        command: 'set',
        service_id: '13',
        application_id: '22177122297',
        user_agent: navigator.userAgent,
        username,
        endpoint,
        auth_secret,
        key,
      })
      .catch((err: Error) => {
        console.error('pbx.addWebPnToken:', err)
      })
    return true
  }
}

export const pbx = new PBX()
