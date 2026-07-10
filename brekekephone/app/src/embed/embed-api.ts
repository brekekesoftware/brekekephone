import EventEmitter from 'eventemitter3'

import { parsePalParams } from '#/api/parse-params-with-prefix'
import type {
  EmbedAccount,
  EmbedNotificationOptions,
  EmbedPbxConfig,
  EmbedSignInOptions,
  MakeCallFn,
  MfaResendResult,
  MfaState,
  MfaVerifyResult,
  SetDeviceTokenParams,
  SetDeviceTokenResult,
} from '#/brekekejs'
import { bundleIdentifier, currentVersion, jssipVersion } from '#/config'
import type { DeviceInfo } from '#/embed/embed-devices-manager'
import { embedDevicesManager } from '#/embed/embed-devices-manager'
import type { Account } from '#/stores/account-store'
import { getAccountUniqueId } from '#/stores/account-store'
import { ctx } from '#/stores/ctx'
import { arrToMap } from '#/utils/arr-to-map'
import { getAudioVideoPermission } from '#/utils/get-audio-video-permission'
import { getPublicIp } from '#/utils/public-ip-address'
import { waitTimeout } from '#/utils/wait-timeout'
import { webPromptPermission } from '#/utils/web-prompt-permission'
import { webCloseNotification } from '#/utils/web-show-notification'

type NormalizedSetDeviceTokenParams = SetDeviceTokenParams & {
  token: string
  user: string
}
type PendingSetDeviceToken = {
  p: NormalizedSetDeviceTokenParams
  resolve: (result: SetDeviceTokenResult) => void
}
type PendingSetDeviceTokenResult = {
  req: PendingSetDeviceToken
  result: SetDeviceTokenResult
}

export class EmbedApi extends EventEmitter {
  /** ==========================================================================
   * public properties/methods
   */

  static promptBrowserPermission = webPromptPermission
  static acceptBrowserPermission = getAudioVideoPermission
  promptBrowserPermission = webPromptPermission
  acceptBrowserPermission = getAudioVideoPermission

  setIncomingRingtone = (ringtone: string) => {
    ctx.call.setIncomingRingtone(ringtone)
  }
  setProductName = (name: string) => {
    ctx.global.productName = name
  }

  closeNotification = webCloseNotification

  getCurrentAccount = () => ctx.auth.getCurrentAccount()
  getCurrentAccountCtx = () => ctx

  static getCurrentVersion = () => ({
    webphone: currentVersion,
    jssip: jssipVersion,
    bundleIdentifier,
  })
  getCurrentVersion = EmbedApi.getCurrentVersion

  call: MakeCallFn = (...args) => ctx.call.startCall(...args)
  getRunningCalls = () => ctx.call.calls

  setDeviceToken = async (
    p: SetDeviceTokenParams,
  ): Promise<SetDeviceTokenResult> => {
    const normalized = this._normalizeSetDeviceTokenParams(p)
    if (!normalized) {
      return {
        ok: false,
        error: 'INVALID_ARGUMENT',
      }
    }

    if (this._acceptingDeviceTokensBeforeAutoLogin) {
      return new Promise(resolve => {
        this._pendingSetDeviceTokens.push({
          p: normalized,
          resolve,
        })
      })
    }

    await ctx.account.waitStorageLoaded()
    return this._setDeviceToken(normalized)
  }

  _setDeviceToken = async (
    p: NormalizedSetDeviceTokenParams,
    reconnect?: boolean,
  ): Promise<SetDeviceTokenResult> => {
    const ca = this._findAccountForDeviceToken(p)
    if (ca === 'ACCOUNT_AMBIGUOUS') {
      return {
        ok: false,
        error: 'ACCOUNT_AMBIGUOUS',
      }
    }
    if (!ca) {
      return {
        ok: false,
        error: 'ACCOUNT_NOT_FOUND',
      }
    }

    const isCurrentAccount = ctx.auth.signedInId === ca.id
    const shouldReconnect = reconnect ?? isCurrentAccount
    const shouldSignIn = reconnect === undefined && !isCurrentAccount
    const ok = await ctx.account.setDeviceToken(ca, p.token, {
      reconnect: shouldReconnect,
      skipFreshLoginMFA: !shouldReconnect || shouldSignIn,
    })
    if (!ok) {
      return {
        ok: false,
        error: 'FAILED',
      }
    }
    if (!shouldReconnect) {
      if (shouldSignIn) {
        const signedIn = await ctx.auth.signIn(ca)
        if (!signedIn) {
          await ctx.account.clearDeviceToken(ca)
          return {
            ok: false,
            error: 'SIGN_IN_FAILED',
          }
        }
        return this._waitForSetDeviceTokenConnect(ca)
      }
      return {
        ok: true,
      }
    }
    return this._waitForSetDeviceTokenConnect(ca)
  }

  /* MFA — for hosts using their own OTP UI (listen to the `mfa` event too) */
  getMfaState = (): MfaState => {
    const id = ctx.mfa.accountId
    if (!id) {
      return {
        active: false as const,
      }
    }
    const a = ctx.account.accountsMap[id]
    return {
      active: true as const,
      accountId: id,
      tenant: a?.pbxTenant,
      user: a?.pbxUsername,
      type: ctx.mfa.type,
      url: ctx.mfa.url || undefined,
      message: ctx.mfa.error || undefined,
    }
  }
  verifyMfaCode = async (code: string): Promise<MfaVerifyResult> => {
    const id = ctx.mfa.accountId
    if (!id) {
      return {
        ok: false,
        error: 'NO_ACTIVE_MFA',
      }
    }
    const ca = ctx.account.accountsMap[id]
    if (!ca) {
      return {
        ok: false,
        error: 'ACCOUNT_NOT_FOUND',
      }
    }
    const status = await ctx.account.mfaCheck(ca, code)
    if (status !== 'OK') {
      return {
        ok: false,
        status,
      }
    }
    const ok = await ctx.account.createMFADeviceToken(
      {
        tenant: ca.pbxTenant,
        user: ca.pbxUsername,
        ip_address: await getPublicIp(),
        user_agent: navigator.userAgent,
      },
      ca,
      ctx.mfa.skipReconnect,
    )
    if (!ok) {
      return {
        ok: false,
        status: 'OK',
        error: ctx.mfa.error || undefined,
      }
    }
    const hadAwaiters = ctx.mfa.complete()
    if (!hadAwaiters) {
      ctx.nav.goToPageIndex()
    }
    return {
      ok: true,
      status: 'OK',
    }
  }
  resendMfaCode = async (): Promise<MfaResendResult> => {
    const id = ctx.mfa.accountId
    if (!id) {
      return {
        ok: false,
        error: 'NO_ACTIVE_MFA',
      }
    }
    const ca = ctx.account.accountsMap[id]
    if (!ca) {
      return {
        ok: false,
        error: 'ACCOUNT_NOT_FOUND',
      }
    }
    const deleted = await ctx.account.mfaDelete(ca)
    if (!deleted) {
      return {
        ok: false,
        error: 'RESEND_FAILED',
      }
    }
    const result = await ctx.account.mfaStart(ca)
    if (result === 'none') {
      ctx.mfa.reset()
      return {
        ok: false,
        error: 'NO_MFA_REQUIRED',
      }
    }
    if (!result || (typeof result === 'object' && 'error' in result)) {
      const error =
        typeof result === 'object' && 'error' in result
          ? result.error
          : 'RESEND_FAILED'
      ctx.mfa.show(ca.id, {
        error,
      })
      return {
        ok: false,
        error,
      }
    }
    if (result === true) {
      ctx.mfa.show(ca.id)
      return {
        ok: true,
      }
    }
    // success — same account, show() merges state without re-emitting
    ctx.mfa.show(ca.id, {
      type: result.type,
      url: result.url,
    })
    return {
      ok: true,
      type: result.type,
      url: result.url,
    }
  }
  cancelMfa = async () => {
    const id = ctx.mfa.accountId
    if (!id) {
      return
    }
    const ca = ctx.account.accountsMap[id]
    if (ca && ctx.account.keySessionMFA) {
      await ctx.account.mfaDelete(ca)
    }
    ctx.mfa.cancel()
    ctx.auth.signOut()
    if (ca) {
      await ctx.account.setMFAPending(ca, false)
    }
  }

  /* Input */
  static getAvailableCameras = (): Promise<DeviceInfo[]> =>
    embedDevicesManager.getVideoInputDevices()
  getAvailableCameras = EmbedApi.getAvailableCameras

  static getAvailableMicrophones = (): Promise<DeviceInfo[]> =>
    embedDevicesManager.getAudioInputDevices()
  getAvailableMicrophones = EmbedApi.getAvailableMicrophones

  static setAudioInputDevice = (deviceId: string): boolean =>
    embedDevicesManager.setAudioInputDevice(deviceId)
  setAudioInputDevice = EmbedApi.setAudioInputDevice

  static setVideoInputDevice = (deviceId: string): Promise<boolean> =>
    embedDevicesManager.setVideoInputDevice(deviceId)
  setVideoInputDevice = EmbedApi.setVideoInputDevice

  static getAudioInputDevice = (): string | null =>
    embedDevicesManager._audioInputDeviceId
  getAudioInputDevice = EmbedApi.getAudioInputDevice

  static getVideoInputDevice = (): string | null =>
    embedDevicesManager._videoInputDeviceId
  getVideoInputDevice = EmbedApi.getVideoInputDevice
  /* Input */

  /* Output */
  static getAvailableSpeakers = (): Promise<DeviceInfo[]> =>
    embedDevicesManager.getAudioOutputDevices()
  getAvailableSpeakers = EmbedApi.getAvailableSpeakers

  static setAudioOutputDevice = (deviceId: string): Promise<boolean> =>
    embedDevicesManager.setAudioOutputDevice(deviceId)
  setAudioOutputDevice = EmbedApi.setAudioOutputDevice

  static getAudioOutputDevice = () => embedDevicesManager._audioOutputDevice
  getAudioOutputDevice = EmbedApi.getAudioOutputDevice

  static registerAudioElement = (el: HTMLAudioElement) =>
    embedDevicesManager.registerAudioElement(el)
  registerAudioElement = EmbedApi.registerAudioElement

  static unregisterAudioElement = (el: HTMLAudioElement) =>
    embedDevicesManager.unregisterAudioElement(el)
  unregisterAudioElement = EmbedApi.unregisterAudioElement
  /* Output */

  restart = async (options: EmbedSignInOptions) => {
    ctx.auth.signOutWithoutSaving()
    await waitTimeout()
    await this._signIn(options)
  }

  cleanup = () => {
    ctx.auth.signOutWithoutSaving()
    embedDevicesManager.destroy()
    if (this._unmountApp) {
      this._unmountApp()
    }
  }

  /** ==========================================================================
   *properties/methods
   */

  _unmountApp?: Function
  _notificationOptions?: EmbedNotificationOptions

  _palEvents?: string[]
  _palParams?: { [k: string]: string }
  _pbxConfig: EmbedPbxConfig = {}
  _acceptingDeviceTokensBeforeAutoLogin = false
  _pendingSetDeviceTokens: PendingSetDeviceToken[] = []

  _normalizeSetDeviceTokenParams = (
    p: SetDeviceTokenParams,
  ): NormalizedSetDeviceTokenParams | undefined => {
    const token = p?.token?.trim()
    const user = p?.user?.trim()
    if (!token || !user) {
      return
    }
    return {
      ...p,
      token,
      user,
    }
  }

  _findAccountForDeviceToken = (
    p: SetDeviceTokenParams,
  ): Account | 'ACCOUNT_AMBIGUOUS' | undefined => {
    const tenant = p.tenant || '-'
    const matches = ctx.account.accounts.filter(
      a =>
        a.pbxUsername === p.user &&
        (a.pbxTenant || '-') === tenant &&
        (!p.hostname || a.pbxHostname === p.hostname) &&
        (!p.port || a.pbxPort === p.port),
    )
    const currentAccount = ctx.auth.getCurrentAccount()
    const currentMatch =
      currentAccount && matches.find(a => a.id === currentAccount.id)
    if (currentMatch) {
      return currentMatch
    }
    if (matches.length === 1) {
      return matches[0]
    }
    if (matches.length > 1) {
      return 'ACCOUNT_AMBIGUOUS'
    }
    return undefined
  }

  _flushPendingSetDeviceTokens = async (): Promise<
    PendingSetDeviceTokenResult[]
  > => {
    const requests = this._pendingSetDeviceTokens
    this._pendingSetDeviceTokens = []
    const results: PendingSetDeviceTokenResult[] = []
    for (const req of requests) {
      results.push({
        req,
        result: await this._setDeviceToken(req.p, false),
      })
    }
    return results
  }

  _rejectPendingSetDeviceTokens = (error: SetDeviceTokenResult['error']) => {
    const requests = this._pendingSetDeviceTokens
    this._pendingSetDeviceTokens = []
    requests.forEach(req =>
      req.resolve({
        ok: false,
        error,
      }),
    )
  }

  _rejectAppliedPendingSetDeviceTokens = async (
    results: PendingSetDeviceTokenResult[],
    error: SetDeviceTokenResult['error'],
  ) => {
    for (const { req, result } of results) {
      if (result.ok) {
        await this._clearDeviceTokenForParams(req.p)
        req.resolve({
          ok: false,
          error,
        })
      } else {
        req.resolve(result)
      }
    }
  }

  _resolvePendingSetDeviceTokens = async (
    results: PendingSetDeviceTokenResult[],
    connected?: boolean,
  ) => {
    for (const { req, result } of results) {
      if (!result.ok) {
        req.resolve(result)
        continue
      }
      if (connected === false) {
        await this._clearDeviceTokenForParams(req.p)
        req.resolve({
          ok: false,
          error: 'CONNECT_FAILED',
        })
        continue
      }
      req.resolve(result)
    }
  }

  _clearDeviceTokenForParams = async (p: NormalizedSetDeviceTokenParams) => {
    const ca = this._findAccountForDeviceToken(p)
    if (!ca || ca === 'ACCOUNT_AMBIGUOUS') {
      return
    }
    await ctx.account.clearDeviceToken(ca)
  }

  _waitForSetDeviceTokenConnect = async (
    ca: Account,
  ): Promise<SetDeviceTokenResult> => {
    const connected = (await ctx.auth.waitPbx()) as boolean
    if (connected) {
      return {
        ok: true,
      }
    }
    await ctx.account.clearDeviceToken(ca)
    ctx.auth.signOutWithoutSaving()
    return {
      ok: false,
      error: 'CONNECT_FAILED',
    }
  }

  _resolvePendingSetDeviceTokensAfterAutoLogin = async (
    results: PendingSetDeviceTokenResult[],
  ) => {
    if (!results.length) {
      return
    }
    let connected: boolean | undefined
    if (results.some(r => r.result.ok)) {
      connected = (await ctx.auth.waitPbx()) as boolean
      if (!connected) {
        ctx.auth.signOutWithoutSaving()
      }
    }
    await this._resolvePendingSetDeviceTokens(results, connected)
  }

  _signIn = async (_o: EmbedSignInOptions) => {
    this._acceptingDeviceTokensBeforeAutoLogin = true
    let pendingSetDeviceTokenResults: PendingSetDeviceTokenResult[] = []
    try {
      const {
        palEvents,
        dontShowNotificationIfFocusing = true,
        closeAllNotificationOnFocus = true,
        closeNotificationOnCallAnswer = true,
        closeNotificationOnCallEnd = true,
        notificationInterval = 15000,
        notificationCallCompletedElseWhere = true,
        notificationCallCompletedElseWhereInterval = 15000,
        ...o
      } = _o
      this._notificationOptions = {
        dontShowNotificationIfFocusing,
        closeAllNotificationOnFocus,
        closeNotificationOnCallAnswer,
        closeNotificationOnCallEnd,
        notificationInterval,
        notificationCallCompletedElseWhere,
        notificationCallCompletedElseWhereInterval,
      }
      await ctx.account.waitStorageLoaded()

      // reassign options on each sign in
      embedApi._palEvents = palEvents
      embedApi._palParams = parsePalParams(o)
      embedApi._pbxConfig = o // TODO: pick fields

      // init devices manager to get default devices
      await embedDevicesManager.init()

      ctx.pbx.parseResourceLines(embedApi._pbxConfig['webphone.resource-line'])
      // check if cleanup existing account
      if (o.clearExistingAccount) {
        ctx.account.accounts = []
        ctx.account.accountData = []
      }

      // create map based on unique (host, port, tenant, user)
      const accountsMap = arrToMap(
        ctx.account.accounts,
        getAccountUniqueId,
        (p: Account) => p,
      ) as { [k: string]: Account }

      // convert accounts from options to storage
      let firstAccountInOptions: Account | undefined
      o.accounts.forEach(a => {
        const fr = convertToStorage(a)
        const to = accountsMap[getAccountUniqueId(fr)]
        if (to) {
          copyToStorage(fr, to)
          firstAccountInOptions = firstAccountInOptions || to
        } else {
          ctx.account.accounts.push(fr)
          firstAccountInOptions = firstAccountInOptions || fr
        }
      })
      pendingSetDeviceTokenResults = await this._flushPendingSetDeviceTokens()
      this._acceptingDeviceTokensBeforeAutoLogin = false
      await ctx.account.saveAccountsToLocalStorageDebounced()

      // check if auto login
      if (!o.autoLogin) {
        await this._resolvePendingSetDeviceTokens(pendingSetDeviceTokenResults)
        return
      }
      if (firstAccountInOptions) {
        ctx.auth.signIn(firstAccountInOptions)
        await this._resolvePendingSetDeviceTokensAfterAutoLogin(
          pendingSetDeviceTokenResults,
        )
        return
      }
      await ctx.auth.autoSignInEmbed()
      await this._resolvePendingSetDeviceTokensAfterAutoLogin(
        pendingSetDeviceTokenResults,
      )
    } catch (err) {
      this._rejectPendingSetDeviceTokens('SIGN_IN_FAILED')
      await this._rejectAppliedPendingSetDeviceTokens(
        pendingSetDeviceTokenResults,
        'SIGN_IN_FAILED',
      )
      throw err
    } finally {
      this._acceptingDeviceTokensBeforeAutoLogin = false
    }
  }

  static _renderApp: Function
  static render = (rootTag, options) => {
    ctx.embed._unmountApp = this._renderApp(rootTag)
    ctx.embed._signIn(options)
    return ctx.embed
  }
}

export const embedApi = new EmbedApi()
ctx.embed = embedApi
const convertToStorage = (a: EmbedAccount): Account => {
  const ea = ctx.account.genEmptyAccount()
  ea.pbxHostname = a.hostname || ''
  ea.pbxPort = a.port || ''
  ea.pbxTenant = a.tenant || ''
  ea.pbxUsername = a.username || ''
  ea.pbxPassword = a.password || ''
  ea.pbxPhoneIndex = `${Number(a.phoneIndex) || 4}`
  ea.ucEnabled = a.uc || false
  ea.displayOfflineUsers = a.ucDisplayOfflineUsers || false
  ea.parks = a.parks || []
  ea.parkNames = a.parkNames || []
  ea.pushNotificationEnabled = a.pushNotification || false
  return ea
}
const copyToStorage = (fr: Account, to: Account) => {
  to.pbxHostname = fr.pbxHostname
  to.pbxPort = fr.pbxPort
  to.pbxTenant = fr.pbxTenant
  to.pbxUsername = fr.pbxUsername
  to.pbxPassword = fr.pbxPassword
  to.pbxPhoneIndex = fr.pbxPhoneIndex
  to.ucEnabled = fr.ucEnabled
  to.displayOfflineUsers = fr.displayOfflineUsers
  to.parks = fr.parks
  to.parkNames = fr.parkNames
  to.pushNotificationEnabled = fr.pushNotificationEnabled
}
