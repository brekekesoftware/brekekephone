import EventEmitter from 'eventemitter3'
import { random } from 'lodash'
import { Platform } from 'react-native'
import validator from 'validator'

import { Pbx, PbxCustomPage, PbxEvent } from '../brekekejs'
import { bundleIdentifier, fcmApplicationId } from '../config'
import { embedApi } from '../embed/embedApi'
import { Account, accountStore } from '../stores/accountStore'
import { getAuthStore, waitPbx } from '../stores/authStore'
import { PbxUser, Phonebook } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { toBoolean } from '../utils/string'
import {
  addFromNumberNonce,
  hasPbxTokenTobeRepalced,
  pbxTokenTobeReplacedRe,
  replaceFromNumberUsingParam,
  replacePbxTokenUsingSessParam,
  replaceUrlWithoutPbxToken,
  sessParamRe,
} from './customPage'
import { parseCallParams, parsePalParams } from './parseParamsWithPrefix'
import { PnCommand, PnParams, PnParamsNew, PnServiceId } from './pnConfig'

export class PBX extends EventEmitter {
  client?: Pbx
  private connectTimeoutId = 0

  // wait auth state to success
  isMainInstance = true

  connect = async (
    a: Account,
    palParamUserReconnect?: boolean,
  ): Promise<boolean> => {
    console.log('PBX PN debug: call pbx.connect')
    if (this.client) {
      console.warn('PAL client already connected, ignore...')
      return true
    }

    const d = await accountStore.findDataAsync(a)
    const oldPalParamUser = d.palParams?.['user']
    console.log(
      `PBX PN debug: construct pbx.client - webphone.pal.param.user=${oldPalParamUser}`,
    )

    const wsUri = `wss://${a.pbxHostname}:${a.pbxPort}/pbx/ws`
    const client = window.Brekeke.pbx.getPal(wsUri, {
      tenant: a.pbxTenant,
      login_user: a.pbxUsername,
      login_password: a.pbxPassword,
      _wn: d.accessToken,
      park: a.parks || [],
      voicemail: 'self',
      status: true,
      secure_login_password: false,
      phonetype: 'webphone',
      callrecording: 'self',
      ...d.palParams,
      ...embedApi._palParams,
    })
    this.client = client

    client.debugLevel = 2
    client.call_pal = (method: keyof Pbx, params?: object) => {
      return new Promise((resolve, reject) => {
        const f = client[method] as Function
        if (typeof f !== 'function') {
          return reject(new Error(`PAL client doesn't support "${method}"`))
        }
        f.call(client, params, resolve, reject)
      })
    }

    // emit to embed api
    if (!window._BrekekePhoneWebRoot) {
      embedApi.emit('pal', client)
    }
    const embedListeners: { [k in keyof Pbx]?: Function } = {}
    if (!window._BrekekePhoneWebRoot && embedApi._palEvents?.length) {
      embedApi._palEvents.forEach(k => {
        const listener = (...args: unknown[]) => {
          console.log(`Embed api emitting pal event ${k}`)
          embedApi.emit(`pal.${k}`, ...args)
        }
        embedListeners[k] = listener
        client[k] = listener
      })
    }
    const setListenerWithEmbed = <T extends keyof Pbx>(k: T, f: Pbx[T]) => {
      const listener = (...args: unknown[]) => {
        embedListeners[k]?.(...args)
        return (f as Function)(...args)
      }
      client[k] = listener as any
    }

    let resolveFn: Function | undefined = undefined
    const connected = new Promise<boolean>(r => {
      resolveFn = r
    })
    const pendingServerStatus: PbxEvent['serverStatus'][] = []
    setListenerWithEmbed('notify_serverstatus', e => {
      pendingServerStatus.push(e)
      if (!e?.status) {
        return
      }
      if (e.status === 'active') {
        resolveFn?.(true)
        resolveFn = undefined
      } else if (e.status === 'inactive') {
        resolveFn?.(false)
        resolveFn = undefined
      }
    })
    const pendingClose: unknown[] = []
    setListenerWithEmbed('onClose', () => {
      pendingClose.push()
      resolveFn?.(false)
      resolveFn = undefined
    })
    const pendingError: Error[] = []
    setListenerWithEmbed('onError', err => {
      pendingError.push(err)
      resolveFn?.(false)
      resolveFn = undefined
    })

    const newTimeoutPromise = () => {
      this.clearConnectTimeoutId()
      return new Promise<boolean>(resolve => {
        this.connectTimeoutId = BackgroundTimer.setTimeout(() => {
          resolve(false)
          console.warn('Pbx login connection timed out')
          // fix case already reconnected
          if (client === this.client) {
            this.disconnect()
          } else {
            client.close()
          }
        }, 10000)
      })
    }
    const login = new Promise<boolean>((resolve, reject) =>
      client.login(() => resolve(true), reject),
    )
    await Promise.race([login, newTimeoutPromise()])
    this.clearConnectTimeoutId()

    const isConnected = async () => {
      const r = await Promise.race([connected, newTimeoutPromise()])
      this.clearConnectTimeoutId()
      return r
    }

    // in syncPnToken, isMainInstance = false
    // we will not proceed further in that case
    if (!this.isMainInstance) {
      return isConnected()
    }

    // check again webphone.pal.param.user
    if (!palParamUserReconnect) {
      const as = getAuthStore()
      // TODO
      // any function get pbxConfig on this time may get undefined
      as.pbxConfig = undefined
      await isConnected()
      await this.getConfig(true)
      const newPalParamUser = as.pbxConfig?.['webphone.pal.param.user']
      if (newPalParamUser !== oldPalParamUser) {
        console.warn(
          `Attempt to reconnect due to mismatch webphone.pal.param.user after login: old=${oldPalParamUser} new=${newPalParamUser}`,
        )
        this.disconnect()
        return this.connect(a, true)
      }
    }

    // register client direct event handlers
    setListenerWithEmbed('onClose', this.onClose)
    setListenerWithEmbed('onError', this.onError)
    setListenerWithEmbed('notify_serverstatus', this.onServerStatus)
    setListenerWithEmbed('notify_park', this.onPark)
    setListenerWithEmbed('notify_callrecording', this.onCallRecording)
    setListenerWithEmbed('notify_voicemail', this.onVoicemail)
    setListenerWithEmbed('notify_status', this.onUserStatus)
    // fire pending events
    pendingClose.forEach(this.onClose)
    pendingError.forEach(this.onError)
    pendingServerStatus.forEach(this.onServerStatus)

    return connected
  }

  // pal client direct event handlers
  private onClose = () => {
    this.emit('connection-stopped')
  }
  private onError = (err: Error) => {
    console.error('pbx.client.onError:', err)
  }
  private onServerStatus = (e: PbxEvent['serverStatus']) => {
    if (!e?.status) {
      return
    }
    if (e.status === 'active') {
      this.emit('connection-started')
    } else if (e.status === 'inactive') {
      this.emit('connection-stopped')
    }
  }
  // {"room_id":"282000000230","talker_id":"1416","time":1587451427817,"park":"777","status":"on"}
  // {"time":1587451575120,"park":"777","status":"off"}
  private onPark = (e: PbxEvent['park']) => {
    if (!e?.status) {
      return
    }
    // TODO
    if (e.status === 'on') {
      this.emit('park-started', e.park)
    } else if (e.status === 'off') {
      this.emit('park-stopped', e.park)
    }
  }
  private onCallRecording = (e: PbxEvent['callRecording']) => {
    if (!e) {
      return
    }
    this.emit('call-recording', e)
  }
  private onVoicemail = (e: PbxEvent['voicemail']) => {
    if (!e) {
      return
    }
    this.emit('voicemail-updated', e)
  }
  private onUserStatus = (e: PbxEvent['userStatus']) => {
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

  getConfig = async (skipWait?: boolean) => {
    if (this.isMainInstance) {
      const s = getAuthStore()
      if (s.pbxConfig) {
        return s.pbxConfig
      }
      if (!skipWait) {
        await waitPbx()
      }
    }
    if (!this.client) {
      return
    }

    const config = await this.client.call_pal('getProductInfo', {
      webphone: 'true',
    })
    if (!this.isMainInstance) {
      return config
    }
    BrekekeUtils.setPbxConfig(JSON.stringify(parseCallParams(config)))

    const as = getAuthStore()
    as.pbxConfig = config
    _parseListCustomPage()

    const d = await as.getCurrentDataAsync()
    d.palParams = parsePalParams(as.pbxConfig)
    d.userAgent = as.pbxConfig['webphone.useragent']
    d.pnExpires = as.pbxConfig['webphone.pn_expires']
    accountStore.updateAccountData(d)

    return as.pbxConfig
  }

  createSIPAccessToken = async (sipUsername: string) => {
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    return res.map((r, i) => ({
      id: ids[i],
      // server return "No permission." if id not exist
      name: Array.isArray(r) && typeof r[0] === 'string' ? r[0] : '',
    }))
  }

  getPbxPropertiesForCurrentUser = async (tenant: string, userId: string) => {
    if (this.isMainInstance) {
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

    const pnumber = `${res[5]}`.split(',')

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
    offset,
    limit,
  }: {
    search_text: string
    offset: number
    limit: number
  }) => {
    if (this.isMainInstance) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('getContactList', {
      phonebook: '',
      search_text,
      offset,
      limit,
    })
    return res.map(contact => ({
      id: contact.aid,
      display_name: contact.display_name,
      phonebook: contact.phonebook,
      user: contact.user,
      shared: !contact?.user,
      info: {},
    }))
  }
  getPhonebooks = async () => {
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('getPhonebooks')
    return res?.filter(item => !item.shared) || []
  }
  getContact = async (id: string) => {
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
  setContact = async (contact: Phonebook) => {
    if (this.isMainInstance) {
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

  getPbxToken = async (): Promise<{ token: string } | undefined> => {
    if (this.isMainInstance) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('getToken').catch(() => undefined)
    return res
  }

  holdTalker = async (tenant: string, talker: string) => {
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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
    if (this.isMainInstance) {
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

  pnmanage = async (d: PnParamsNew) => {
    if (this.isMainInstance) {
      await waitPbx()
    }
    if (!this.client) {
      return false
    }
    const {
      pnmanageNew,
      command,
      service_id,
      device_id,
      device_id_voip,
      auth_secret,
      endpoint,
      key,
    } = d
    let isFcm = false
    const arr = Array.isArray(service_id) ? service_id : [service_id]
    arr.forEach(id => {
      if (id === PnServiceId.fcm || id === PnServiceId.web) {
        isFcm = true
      } else if (isFcm) {
        throw new Error('Can not mix service_id fcm/web together with apns/lpc')
      }
    })
    let application_id = isFcm ? fcmApplicationId : bundleIdentifier
    let { username } = d
    if (!pnmanageNew && d.voip) {
      if (!isFcm) {
        application_id += '.voip'
      }
      username += '@voip'
    }
    await this.client.call_pal('pnmanage', {
      command,
      service_id,
      application_id,
      user_agent: Platform.OS === 'web' ? navigator.userAgent : 'react-native',
      username,
      device_id,
      device_id_voip,
      add_voip: pnmanageNew ? true : undefined,
      add_device_id_suffix: pnmanageNew ? true : undefined,
      auth_secret,
      endpoint,
      key,
    })
    return true
  }

  setWebPnToken = async (d: PnParams) => {
    return this.pnmanage({
      ...d,
      command: PnCommand.set,
      service_id: PnServiceId.web,
    })
  }
  removeWebPnToken = async (d: PnParams) => {
    return this.pnmanage({
      ...d,
      command: PnCommand.remove,
      service_id: PnServiceId.web,
    })
  }

  setFcmPnToken = async (d: PnParams) => {
    return this.pnmanage({
      ...d,
      command: PnCommand.set,
      service_id: PnServiceId.fcm,
    })
  }
  removeFcmPnToken = async (d: PnParams) => {
    return this.pnmanage({
      ...d,
      command: PnCommand.remove,
      service_id: PnServiceId.fcm,
    })
  }

  setApnsToken = async (d: PnParams) => {
    return this.pnmanage({
      ...d,
      command: PnCommand.set,
      service_id: PnServiceId.apns,
    })
  }
  removeApnsToken = async (d: PnParams) => {
    return this.pnmanage({
      ...d,
      command: PnCommand.remove,
      service_id: PnServiceId.apns,
    })
  }
}

export const pbx = new PBX()

// ----------------------------------------------------------------------------
// custom page url utils
// need to place them here to avoid circular dependencies

const _parseListCustomPage = () => {
  const as = getAuthStore()
  const c = as.pbxConfig
  if (!c) {
    return
  }
  const results: PbxCustomPage[] = []
  Object.keys(c).forEach(k => {
    if (!k.startsWith('webphone.custompage')) {
      return
    }
    const parts = k.split('.')
    const id = `${parts[0]}.${parts[1]}`
    if (results.some(item => item.id === id)) {
      return
    }
    let url = c[`${id}.url`]
    if (!validator.isURL(url)) {
      // ignore if not url
      console.log(`CustomPage debug: ${url} is not valid url`)
      return
    }
    url = addFromNumberNonce(url)
    const title = c[`${id}.title`] || intl`PBX user settings`
    const pos = c[`${id}.pos`] || 'setting,right,1'
    const incoming = c[`${id}.incoming`]
    results.push({
      id,
      url,
      title,
      pos,
      incoming,
    })
  })
  as.listCustomPage = results
}

export const buildCustomPageUrl = async (url: string) => {
  const ca = getAuthStore().getCurrentAccount()
  url = replaceUrlWithoutPbxToken(
    url,
    intlStore.locale,
    ca.pbxTenant,
    ca.pbxUsername,
  )
  if (!hasPbxTokenTobeRepalced(url)) {
    return url
  }
  const r = await pbx.getPbxToken()
  return r?.token ? url.replace(pbxTokenTobeReplacedRe, r.token) : url
}

export const rebuildCustomPageUrlNonce = (url: string) =>
  replaceFromNumberUsingParam(url, random(1, 1000000, false))

export const rebuildCustomPageUrlPbxToken = async (url: string) => {
  url = rebuildCustomPageUrlNonce(url)
  const r = await pbx.getPbxToken()
  return r?.token ? replacePbxTokenUsingSessParam(url, r.token) : url
}
