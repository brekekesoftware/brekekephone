import EventEmitter from 'eventemitter3'
import { random } from 'lodash'
import { Platform } from 'react-native'
import validator from 'validator'

import type {
  Pbx,
  PbxCustomPage,
  PbxEvent,
  PbxResourceLine,
} from '../brekekejs'
import { bundleIdentifier, fcmApplicationId } from '../config'
import { embedApi } from '../embed/embedApi'
import type { Account } from '../stores/accountStore'
import { accountStore } from '../stores/accountStore'
import { authPBX } from '../stores/AuthPBX'
import { authSIP } from '../stores/AuthSIP'
import { getAuthStore, waitPbx } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import type { PbxUser, Phonebook } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { toBoolean } from '../utils/string'
import { waitTimeout } from '../utils/waitTimeout'
import {
  addFromNumberNonce,
  hasPbxTokenTobeRepalced,
  isCustomPageUrlBuilt,
  replaceFromNumberUsingParam,
  replacePbxToken,
  replacePbxTokenUsingSessParam,
  replaceUrlWithoutPbxToken,
} from './customPage'
import { parseCallParams, parsePalParams } from './parseParamsWithPrefix'
import type { PnParams, PnParamsNew } from './pnConfig'
import { PnCommand, PnServiceId } from './pnConfig'
import { sip } from './sip'
import { SyncPnToken } from './syncPnToken'

export class PBX extends EventEmitter {
  client?: Pbx
  private connectTimeoutId = 0

  // wait auth state to success
  isMainInstance = true

  pendingRequests: {
    funcName: keyof PBX
    params: string[]
    callback: Function
  }[] = []

  connect = async (
    a: Account,
    palParamUserReconnect?: boolean,
    forSyncPnToken?: boolean,
  ): Promise<boolean> => {
    console.log('PBX PN debug: call pbx.connect')
    if (this.client) {
      console.warn('PAL client already connected, ignore...')
      return true
    }

    const d = await accountStore.findDataWithDefault(a)
    const oldPalParamUser = d.palParams?.['user']
    console.log(
      `PBX PN debug: construct pbx.client - webphone.pal.param.user=${oldPalParamUser}`,
    )

    const wsUri = `wss://${a.pbxHostname}:${a.pbxPort}/pbx/ws`
    const client = window.Brekeke.pbx.getPal(wsUri, {
      tenant: a.pbxTenant,
      login_user: a.pbxUsername,
      login_password: a.pbxPassword,
      ...(forSyncPnToken ? {} : { phone_idx: a.pbxPhoneIndex }),
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
    client.call_pal = (method: keyof Pbx, params?: object) =>
      new Promise((resolve, reject) => {
        const f = client[method] as Function
        if (typeof f !== 'function') {
          return reject(new Error(`PAL client doesn't support "${method}"`))
        }
        f.call(client, params, resolve, reject)
      })

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

    // listeners to be added after login successfully
    const listeners = {
      onClose: this.onClose,
      onError: this.onError,
      notify_serverstatus: this.onServerStatus,
      notify_park: this.onPark,
      notify_callrecording: this.onCallRecording,
      notify_voicemail: this.onVoicemail,
      notify_status: this.onUserStatus,
      notify_pal: this.onUserLoginOtherDevices,
    }
    // pending events received before login successfully
    const pendings = Object.keys(listeners).reduce(
      (m, k) => {
        m[k] = []
        return m
      },
      {} as { [k: string]: any[] },
    )
    // pending listeners before login successfully
    const pendingOnCloseOrError = () => {
      resolveFn?.(false)
      resolveFn = undefined
    }
    const pendingOnServerStatus = (e: PbxEvent['serverStatus']) => {
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
    }
    const pendingListeners = {
      onClose: pendingOnCloseOrError,
      onError: pendingOnCloseOrError,
      notify_serverstatus: pendingOnServerStatus,
    }
    // add listeners before login successfully
    // also add the event to pendings array
    Object.keys(listeners).forEach((k: any) => {
      setListenerWithEmbed(k, e => {
        pendings[k].push(e)
        pendingListeners[k]?.(e)
      })
    })

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

    // reset state
    getCallStore().parkNumbers = {}
    // call listeners using pendings then set
    Object.keys(listeners).forEach((k: any) => {
      pendings[k].forEach(e => listeners[k](e))
      setListenerWithEmbed(k, listeners[k])
    })

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

  private onUserLoginOtherDevices = async (e: PbxEvent['pal']) => {
    if (!e) {
      return
    }
    if (e.code === 1 && e.message === 'ANOTHER_LOGIN') {
      getAuthStore().pbxLoginFromAnotherPlace = true
      if (!getCallStore().calls.length && !sip.phone?.getSessionCount()) {
        console.log(
          'pbxLoginFromAnotherPlace debug:  No call is in progress, disconnect SIP and PBX.',
        )
        const a = getAuthStore().getCurrentAccount()
        if (a) {
          console.log(
            'pbxLoginFromAnotherPlace debug:  remove token for account ' +
              a.pbxUsername,
          )
          await SyncPnToken().sync(a, { noUpsert: true })
        }
        authSIP.dispose()
        authPBX.dispose()
        // wait for the last device to complete syncing the token before allowing the current device to interact
        await waitTimeout(2500)
        getAuthStore().showMsgPbxLoginFromAnotherPlace = true
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
    as.setUserAgentConfig(config['webphone.http.useragent.product'])
    as.setRecentCallsMax(config['webphone.recents.max'])

    // the custom page only load at the first time the tab is shown after you log in
    //    even after re-connected it, don't refresh it again
    const urlCustomPage = as.listCustomPage?.[0]?.url
    if (!urlCustomPage || !isCustomPageUrlBuilt(urlCustomPage)) {
      _parseListCustomPage()
    }

    // get resource line
    _parseResourceLines(config['webphone.resource-line'])

    const d = await as.getCurrentDataAsync()
    if (d) {
      d.palParams = parsePalParams(as.pbxConfig)
      d.userAgent = as.pbxConfig['webphone.useragent']
      d.pnExpires = as.pbxConfig['webphone.pn_expires']
      accountStore.updateAccountData(d)
    }

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
    const ca = getAuthStore().getCurrentAccount()
    if (!this.client || !ca) {
      return
    }
    const res = await this.client.call_pal('getExtensionProperties', {
      tenant: ca.pbxTenant,
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
        'phoneappli.enable',
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
      phoneappli: toBoolean(res?.[7]),
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
  getPhoneappliContact = async (tenant: string, user: string, tel: string) => {
    if (this.isMainInstance) {
      await waitPbx()
    }
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('getPhoneAppliContact', {
      tenant,
      user,
      tel,
    })
    return res
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

  setWebPnToken = async (d: PnParams) =>
    this.pnmanage({
      ...d,
      command: PnCommand.set,
      service_id: PnServiceId.web,
    })
  removeWebPnToken = async (d: PnParams) =>
    this.pnmanage({
      ...d,
      command: PnCommand.remove,
      service_id: PnServiceId.web,
    })

  setFcmPnToken = async (d: PnParams) =>
    this.pnmanage({
      ...d,
      command: PnCommand.set,
      service_id: PnServiceId.fcm,
    })
  removeFcmPnToken = async (d: PnParams) =>
    this.pnmanage({
      ...d,
      command: PnCommand.remove,
      service_id: PnServiceId.fcm,
    })

  setApnsToken = async (d: PnParams) =>
    this.pnmanage({
      ...d,
      command: PnCommand.set,
      service_id: PnServiceId.apns,
    })
  removeApnsToken = async (d: PnParams) =>
    this.pnmanage({
      ...d,
      command: PnCommand.remove,
      service_id: PnServiceId.apns,
    })
}

export const pbx = new PBX()

// ----------------------------------------------------------------------------
// parse resource line data
const _parseResourceLines = (l: string | undefined) => {
  const as = getAuthStore()
  if (!l) {
    as.resourceLines = []
    return
  }
  const lines = l.split(',')
  const resourceLines: PbxResourceLine[] = []
  lines.forEach(line => {
    if (line.includes(':')) {
      const [key, value] = line.split(':')
      if (key) {
        resourceLines.push({ key: key.trim(), value: value.trim() })
      }
    } else if (line) {
      resourceLines.push({ key: line.trim(), value: line.trim() })
    }
  })
  // remove duplicate value
  as.resourceLines = resourceLines.filter((item, index) => {
    const nextItem = resourceLines.find(
      (next, nextIndex) => nextIndex > index && next.value === item.value,
    )
    return !nextItem
  })
}

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
  if (!ca) {
    return url
  }
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
  return r?.token ? replacePbxToken(url, r.token) : url
}

export const rebuildCustomPageUrlNonce = (url: string) =>
  replaceFromNumberUsingParam(url, random(1, 1000000, false))

export const rebuildCustomPageUrlPbxToken = async (url: string) => {
  url = rebuildCustomPageUrlNonce(url)
  const r = await pbx.getPbxToken()
  return r?.token ? replacePbxTokenUsingSessParam(url, r.token) : url
}
