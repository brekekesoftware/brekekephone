import EventEmitter from 'eventemitter3'
import { debounce, random } from 'lodash'
import { observable } from 'mobx'
import { v4 as newUuid } from 'uuid'
import validator from 'validator'

import {
  addFromNumberNonce,
  hasPbxTokenTobeRepalced,
  isCustomPageUrlBuilt,
  replaceFromNumberUsingParam,
  replacePbxToken,
  replacePbxTokenUsingSessParam,
  replaceUrlWithoutPbxToken,
} from '#/api/customPage'
import { parseCallParams, parsePalParams } from '#/api/parseParamsWithPrefix'
import type { PnParams, PnParamsNew } from '#/api/pnConfig'
import { PnCommand, PnServiceId } from '#/api/pnConfig'
import type {
  PalMethodParams,
  Pbx,
  PbxCustomPage,
  PbxEvent,
  PbxPal,
  PbxResourceLine,
  Request,
} from '#/brekekejs'
import {
  bundleIdentifier,
  fcmApplicationId,
  isAndroid,
  isEmbed,
  isWeb,
  retryInterval,
} from '#/config'
import { embedApi } from '#/embed/embedApi'
import type { Account } from '#/stores/accountStore'
import type { PbxUser, Phonebook } from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { BackgroundTimer } from '#/utils/BackgroundTimer'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { jsonSafe } from '#/utils/jsonSafe'
import { toBoolean } from '#/utils/string'
import { waitTimeout } from '#/utils/waitTimeout'

export class PBX extends EventEmitter {
  client?: Pbx
  isMainInstance = true

  // === handle cache and retry requests
  private pendingRequests: Request<keyof PbxPal>[] = []
  private requests: Request<keyof PbxPal>[] = []
  private MAX_RETRY = 3
  @observable retryingRequests: string[] = []

  private generateRequestId = (): string => newUuid()
  isPalTimeoutError = (err: unknown): boolean => {
    if (!err || typeof err !== 'object') {
      return false
    }
    return (
      ('code' in err && (err as any).code === -1) ||
      ('message' in err && /timeout/i.test((err as Error).message))
    )
  }

  cancelRequest = (requestId: string): boolean => {
    const index = this.pendingRequests.findIndex(req => req.id === requestId)
    if (index !== -1) {
      const request = this.pendingRequests[index]
      this.pendingRequests.splice(index, 1)
      request.cancelled = true
      request.reject(this.msgErrorCancelRequest(request))
      return true
    }
    const index2 = this.requests.findIndex(req => req.id === requestId)
    if (index2 !== -1) {
      const request = this.requests[index2]
      this.requests.splice(index2, 1)
      request.cancelled = true
      request.reject(this.msgErrorCancelRequest(request))
      return true
    }
    return false
  }
  removeRequest = (requestId: string) => {
    const index = this.requests.findIndex(req => req.id === requestId)
    if (index !== -1) {
      this.requests.splice(index, 1)
      return true
    }
    return false
  }
  private msgErrorCancelRequest = (request: Request<keyof PbxPal>) =>
    new Error(`${request.method} request cancelled by user`)
  private palRequestWithRetry = <K extends keyof PbxPal>(
    method: K,
    ...params: PalMethodParams<K>
  ): {
    promise: Promise<Parameters<Parameters<PbxPal[K]>[1]>[0]>
    requestId: string
  } => {
    const requestId = this.generateRequestId()
    const promise = new Promise((resolve, reject) => {
      const rq = {
        id: requestId,
        method,
        params,
        resolve,
        reject,
        retryCount: 0,
        cancelled: false,
      }
      if (!this.client) {
        this.pendingRequests.push(rq)
        return
      }
      this.requests.push(rq)
      this.client
        .call_pal(method, ...params)
        .then(result => {
          const request = this.pendingRequests.find(req => req.id === requestId)
          if (request?.cancelled) {
            reject(this.msgErrorCancelRequest(request))
          } else {
            resolve(result)
            this.removeRequest(requestId)
          }
        })
        .catch(err => {
          if (this.isPalTimeoutError(err)) {
            this.pendingRequests.push(rq)
          } else {
            reject(err)
            this.removeRequest(requestId)
          }
        })
    })
    return { promise, requestId }
  }
  retryRequests = () => {
    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests.shift()
      if (!request) {
        continue
      }
      if (request.cancelled) {
        request.reject(this.msgErrorCancelRequest(request))
        continue
      }
      if (request.retryCount >= this.MAX_RETRY) {
        request.reject(new Error('Maximum number of retries reached'))
        this.emit('pal-retry-end', request)
        continue
      }
      const params = request?.params as PalMethodParams<typeof request.method>
      this.emit('pal-retrying', request)
      this.client
        ?.call_pal(request.method, ...params)
        .then(result => {
          this.emit('pal-retry-end', request)
          if (request.cancelled) {
            request.reject(this.msgErrorCancelRequest(request))
          } else {
            request.resolve(result)
          }
        })
        .catch(err => {
          this.emit('pal-retry-end', request)
          if (request.cancelled) {
            request.reject(this.msgErrorCancelRequest(request))
            return
          }
          if (this.isPalTimeoutError(err)) {
            request.retryCount++
            setTimeout(() => {
              this.pendingRequests.push(request)
            }, retryInterval)
          } else {
            request.reject(err)
          }
        })
    }
  }
  // === end handle cache and retry requests
  private pingIntervalId: number | undefined = undefined
  private pingActivityAt = 0
  private getPingInterval = () => {
    const config = ctx.auth.pbxConfig
    const t = Math.round(Number(config?.['webphone.pal.ping_interval']))
    if (!t || t <= 5000) {
      return 20000
    }
    return t
  }
  private getPingTimeout = () => {
    const config = ctx.auth.pbxConfig
    const t = Math.round(Number(config?.['webphone.pal.ping_timeout']))
    if (!t || t <= 5000) {
      return 30000
    }
    return t
  }
  private startPingInterval = () => {
    if (!this.isMainInstance) {
      return
    }
    this.stopPingInterval()
    this.pingIntervalId = BackgroundTimer.setInterval(() => {
      if (ctx.auth.pbxLoginFromAnotherPlace) {
        this.stopPingInterval()
        return
      }
      this.ping()
    }, this.getPingInterval())
  }
  private stopPingInterval = () => {
    if (!this.isMainInstance) {
      return
    }
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId)
      this.pingIntervalId = undefined
      this.pingActivityAt = 0
    }
  }
  ping = debounce(
    () => {
      if (!this.client || !this.isMainInstance) {
        return
      }
      const d = Date.now() - this.pingActivityAt
      if (d > this.getPingTimeout()) {
        this.client.call_pal('ping')
      }
    },
    10000,
    {
      maxWait: 10000,
      leading: true,
      trailing: true,
    },
  )

  private checkTimeoutToReconnectPbx = async (err: Error | true) => {
    if (err === true) {
      return
    }
    ctx.toast.internet(err)
    if (this.isPalTimeoutError(err)) {
      ctx.authPBX.dispose()
      // wait for 1 second to ensure PBX is fully stopped and Mobx reactions cleared
      await waitTimeout(1000)
      ctx.authPBX.auth()
    } else {
      this.pingActivityAt = Date.now()
    }
  }

  private wrapListenersWithLog = <T extends (...args: any[]) => void>(
    name: string,
    listener: T,
  ): T =>
    ((...args: any[]) => {
      if (this.isMainInstance) {
        console.log(`PAL event triggered: ${name}, args:`, ...args)
        this.pingActivityAt = Date.now()
      }
      return listener(...args)
    }) as T
  private logMainInstance = (message: string, ...args: any[]) => {
    if (!this.isMainInstance) {
      return
    }
    console.log(message, ...args)
  }

  // wait auth state to be success
  private connectTimeoutId = 0
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

    const d = await ctx.account.findDataWithDefault(a)
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
      // From the version 2.14.x, please add ctype=2 to the URL for PAL.
      // (If you receive webphone.pal.param.ctype=<something>, it should be overwritten.)
      ctype: 2,
    })
    this.client = client
    client.debugLevel = 2

    // Check server availability before login
    if (isAndroid) {
      const serverReady = await new Promise<boolean>(resolve => {
        const testWs = new WebSocket(`${wsUri}?status=true`)
        let timeoutId: number | undefined
        let isResolved = false

        const cleanup = (result: boolean) => {
          if (isResolved) {
            return
          }
          isResolved = true

          if (timeoutId) {
            BackgroundTimer.clearTimeout(timeoutId)
          }
          try {
            testWs.close()
          } catch {}
          resolve(result)
        }

        timeoutId = BackgroundTimer.setTimeout(() => cleanup(false), 5000)
        testWs.onopen = () => cleanup(true)
        testWs.onerror = () => cleanup(false)
        testWs.onclose = e => cleanup(e.wasClean || e.code === 1000)
      })

      if (!serverReady) {
        this.logMainInstance('PAL Server not ready - aborting login')
        this.disconnect()
        return false
      }
      this.logMainInstance('PAL Server available - proceeding with login')
    }
    client.call_pal = (method: keyof Pbx, params?: object) =>
      new Promise((resolve, reject) => {
        const start = Date.now()
        this.logMainInstance(
          `PAL call start, method: ${method}, params:`,
          params,
        )
        const f = client[method] as Function
        if (typeof f !== 'function') {
          return reject(new Error(`PAL client doesn't support "${method}"`))
        }
        f.call(
          client,
          params,
          (r: any) => {
            if (this.isMainInstance) {
              const end = Date.now()
              console.log(
                `PAL call success - method: ${method}, duration: ${end - start}ms, result:`,
                r,
              )
              ctx.pbx.pingActivityAt = end
            }
            resolve(r)
          },
          (err: any) => {
            if (this.isMainInstance) {
              const end = Date.now()
              console.log(
                `PAL call error - method: ${method}, duration: ${end - start}ms, error:`,
                err,
              )
              this.checkTimeoutToReconnectPbx(err)
            }
            reject(err)
          },
        )
      })

    // emit to embed api
    const embedListeners: { [k in keyof Pbx]?: Function } = {}
    if (isEmbed) {
      embedApi.emit('pal', client)
      embedApi._palEvents?.forEach(k => {
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
          resolveFn?.(false)
          resolveFn = undefined
          console.warn('PAL login connection timed out')
          // fix case already reconnected
          if (client === this.client) {
            this.disconnect()
          } else {
            client.close()
          }
        }, 10000)
      })
    }
    const login = new Promise<boolean>((resolve, reject) => {
      this.logMainInstance('PAL login start')
      client.login(
        () => {
          this.logMainInstance('PAL login success')
          resolve(true)
        },
        (err: any) => {
          this.logMainInstance('PAL login error:', err)
          reject(err)
        },
      )
    })

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
    Object.keys(listeners).forEach(k => {
      listeners[k] = this.wrapListenersWithLog(k, listeners[k])
    })

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
    if (!(await isConnected())) {
      return false
    }

    // in syncPnToken, isMainInstance = false
    // we will not proceed further in that case
    if (!this.isMainInstance) {
      return true
    }

    // check again webphone.pal.param.user
    if (!palParamUserReconnect) {
      // TODO:
      // any function get pbxConfig on this time may get undefined
      ctx.auth.pbxConfig = undefined
      await this.getConfig(true)
      const newPalParamUser = ctx.auth.pbxConfig?.['webphone.pal.param.user']
      if (newPalParamUser !== oldPalParamUser) {
        console.warn(
          `Attempt to reconnect due to mismatch webphone.pal.param.user after login: old=${oldPalParamUser} new=${newPalParamUser}`,
        )
        this.disconnect()
        return this.connect(a, true)
      }
    }

    // reset state
    ctx.call.parkNumbers = {}
    // call listeners using pendings then set
    Object.keys(listeners).forEach((k: any) => {
      pendings[k].forEach(e => listeners[k](e))
      setListenerWithEmbed(k, listeners[k])
    })

    this.startPingInterval()

    return true
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
    // TODO:
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
      ctx.auth.pbxLoginFromAnotherPlace = true

      const a = ctx.auth.getCurrentAccount()
      if (a) {
        console.log(
          'pbxLoginFromAnotherPlace debug: remove token for account ' +
            a.pbxUsername,
        )
        await ctx.pnToken.sync(a, { noUpsert: true })
      }

      if (!ctx.call.calls.length && !ctx.sip.phone?.getSessionCount()) {
        console.log(
          'pbxLoginFromAnotherPlace: no call is in progress, disconnect SIP and PBX',
        )
        ctx.authSIP.dispose()
        ctx.authPBX.dispose()
        // wait for the last device to complete syncing the token before allowing the current device to interact
        await waitTimeout(2500)
        ctx.auth.showMsgPbxLoginFromAnotherPlace = true
      }
    }
  }
  disconnect = () => {
    if (this.client) {
      this.logMainInstance('PAL client close')
      this.client.close()
      this.client = undefined
      console.log('PBX PN debug: pbx.client set to null in pbx.disconnect')
    }
    this.stopPingInterval()
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
      if (ctx.auth.pbxConfig) {
        return ctx.auth.pbxConfig
      }
      if (!skipWait) {
        await ctx.auth.waitPbx()
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

    BrekekeUtils.setPbxConfig(jsonSafe(parseCallParams(config)))

    ctx.auth.pbxConfig = config
    ctx.auth.setUserAgentConfig(config['webphone.http.useragent.product'])
    ctx.auth.setRecentCallsMax(config['webphone.recents.max'])

    // the custom page only load at the first time the tab is shown after you log in
    //    even after re-connected it, don't refresh it again
    const urlCustomPage = ctx.auth.listCustomPage?.[0]?.url
    if (!urlCustomPage || !isCustomPageUrlBuilt(urlCustomPage)) {
      _parseListCustomPage()
    }

    // get resource line
    if (!isEmbed) {
      _parseResourceLines(config['webphone.resource-line'])
    }

    const ca = ctx.auth.getCurrentAccount()
    if (ca) {
      ca.pbxRingtone = config['webphone.call.ringtone']
      ctx.account.saveAccountsToLocalStorageDebounced()
    }
    const d = await ctx.auth.getCurrentDataAsync()
    if (d) {
      d.palParams = parsePalParams(ctx.auth.pbxConfig)
      d.userAgent = ctx.auth.pbxConfig['webphone.useragent']
      d.pnExpires = ctx.auth.pbxConfig['webphone.pn_expires']
      ctx.account.updateAccountData(d)
    }

    return ctx.auth.pbxConfig
  }

  createSIPAccessToken = async (sipUsername: string) => {
    if (this.isMainInstance) {
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
    }
    const ca = ctx.auth.getCurrentAccount()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
    }
    if (!this.client) {
      return
    }
    const res = this.palRequestWithRetry('getPhoneAppliContact', {
      tenant,
      user,
      tel,
    })
    return res.promise
  }
  getContact = async (id: string) => {
    if (this.isMainInstance) {
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
    }
    if (!this.client) {
      return
    }
    const res = await this.client.call_pal('getToken').catch(() => undefined)
    return res
  }

  holdTalker = async (tenant: string, talker: string) => {
    if (this.isMainInstance) {
      await ctx.auth.waitPbx()
    }

    if (!this.client) {
      return { promise: Promise.resolve(false), requestId: '' }
    }
    const res = this.palRequestWithRetry('hold', {
      tenant,
      tid: talker,
    })
    return res
  }

  unholdTalker = async (tenant: string, talker: string) => {
    if (this.isMainInstance) {
      await ctx.auth.waitPbx()
    }
    if (!this.client) {
      return { promise: Promise.resolve(false), requestId: '' }
    }
    const res = this.palRequestWithRetry('unhold', {
      tenant,
      tid: talker,
    })
    return res
  }

  startRecordingTalker = async (tenant: string, talker: string) => {
    if (this.isMainInstance) {
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
      await ctx.auth.waitPbx()
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
    let application_id = isAndroid ? fcmApplicationId : bundleIdentifier
    let { username } = d
    if (!pnmanageNew && d.voip) {
      application_id += '.voip'
      username += '@voip'
    }
    await this.client.call_pal('pnmanage', {
      command,
      service_id,
      application_id,
      user_agent: isWeb ? navigator.userAgent : 'react-native',
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

ctx.pbx = new PBX()

// ----------------------------------------------------------------------------
// parse resource line data
export const _parseResourceLines = (l: string | undefined) => {
  if (!l) {
    ctx.auth.resourceLines = []
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
  ctx.auth.resourceLines = resourceLines.filter((item, index) => {
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
  const c = ctx.auth.pbxConfig
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
    const title = c[`${id}.title`]?.trim() || intl`PBX user settings`
    const pos = c[`${id}.pos`]?.trim() || 'setting,right,1'
    const incoming = c[`${id}.incoming`]?.trim()
    results.push({
      id,
      url,
      title,
      pos,
      incoming,
    })
  })
  ctx.auth.listCustomPage = results
}

export const buildCustomPageUrl = async (url: string) => {
  const ca = ctx.auth.getCurrentAccount()
  if (!ca) {
    return url
  }
  url = replaceUrlWithoutPbxToken(
    url,
    ctx.intl.locale,
    ca.pbxTenant,
    ca.pbxUsername,
  )
  if (!hasPbxTokenTobeRepalced(url)) {
    return url
  }
  const r = await ctx.pbx.getPbxToken()
  return r?.token ? replacePbxToken(url, r.token) : url
}

export const rebuildCustomPageUrlNonce = (url: string) =>
  replaceFromNumberUsingParam(url, random(1, 1000000, false))

export const rebuildCustomPageUrlPbxToken = async (url: string) => {
  url = rebuildCustomPageUrlNonce(url)
  const r = await ctx.pbx.getPbxToken()
  return r?.token ? replacePbxTokenUsingSessParam(url, r.token) : url
}
