import EventEmitter from 'eventemitter3'
import { AppRegistry } from 'react-native'

import { parsePalParams } from '#/api/parseParamsWithPrefix'
import type {
  EmbedPbxConfig,
  EmbedSignInOptions,
  MakeCallFn,
} from '#/brekekejs'
import { bundleIdentifier, currentVersion, jssipVersion } from '#/config'
import type { Account } from '#/stores/accountStore'
import { getAccountUniqueId } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { arrToMap } from '#/utils/arrToMap'
import { getAudioVideoPermission } from '#/utils/getAudioVideoPermission'
import { waitTimeout } from '#/utils/waitTimeout'
import { webPromptPermission } from '#/utils/webPromptPermission'
import { webCloseNotification } from '#/utils/webShowNotification'

export class EmbedApi extends EventEmitter {
  /** ==========================================================================
   * public properties/methods
   */

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
  getCurrentVersion = () => ({
    webphone: currentVersion,
    jssip: jssipVersion,
    bundleIdentifier,
  })

  call: MakeCallFn = (...args) => ctx.call.startCall(...args)
  getRunningCalls = () => ctx.call.calls

  restart = async (options: EmbedSignInOptions) => {
    ctx.auth.signOutWithoutSaving()
    await waitTimeout()
    await this._signIn(options)
  }

  cleanup = () => {
    ctx.auth.signOutWithoutSaving()
    if (this._rootTag) {
      AppRegistry.unmountApplicationComponentAtRootTag(this._rootTag)
    }
  }

  /** ==========================================================================
   * private properties/methods
   */

  _rootTag?: any

  _palEvents?: string[]
  _palParams?: { [k: string]: string }
  _pbxConfig: EmbedPbxConfig = {}

  _signIn = async (o: EmbedSignInOptions) => {
    await ctx.account.waitStorageLoaded()
    // reassign options on each sign in
    embedApi._palEvents = o.palEvents
    embedApi._palParams = parsePalParams(o)
    embedApi._pbxConfig = o // TODO: pick fields
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
    await ctx.account.saveAccountsToLocalStorageDebounced()
    // check if auto login
    if (!o.autoLogin) {
      return
    }
    if (firstAccountInOptions) {
      ctx.auth.signIn(firstAccountInOptions)
      return
    }
    await ctx.auth.autoSignInEmbed()
  }
}

export const embedApi = new EmbedApi()

type EmbedAccount = {
  hostname: string
  port: string
  tenant?: string
  username: string
  password?: string
  phoneIndex?: number
  uc?: boolean
  ucDisplayOfflineUsers?: boolean
  parks?: string[]
  parkNames?: string[]
  pushNotification?: boolean
}
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
