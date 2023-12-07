import EventEmitter from 'eventemitter3'
import { unmountComponentAtNode } from 'react-dom'

import { parsePalParams } from '../api/parseParamsWithPrefix'
import { MakeCallFn } from '../brekekejs'
import {
  Account,
  accountStore,
  getAccountUniqueId,
} from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { arrToMap } from '../utils/arrToMap'
import { getAudioVideoPermission } from '../utils/getAudioVideoPermission'
import { waitTimeout } from '../utils/waitTimeout'
import { webPromptPermission } from '../utils/webPromptPermission'

export type EmbedSignInOptions = {
  autoLogin?: boolean
  clearExistingAccount?: boolean
  palEvents?: string[]
  accounts: EmbedAccount[]
} & { [k: string]: string }

export class EmbedApi extends EventEmitter {
  /**==========================================================================
   * public properties/methods
   */

  promptBrowserPermission = webPromptPermission
  acceptBrowserPermission = getAudioVideoPermission
  setIncomingRingtone = (ringtone: string) => {
    getCallStore().setIncomingRingtone(ringtone)
  }

  getCurrentAccount = () => getAuthStore().getCurrentAccount()

  call: MakeCallFn = (...args) => getCallStore().startCall(...args)
  getRunningCalls = () => getCallStore().calls

  restart = async (options: EmbedSignInOptions) => {
    getAuthStore().signOutWithoutSaving()
    await waitTimeout()
    await this._signIn(options)
  }

  cleanup = () => {
    getAuthStore().signOutWithoutSaving()
    if (this._rootTag) {
      unmountComponentAtNode(this._rootTag)
    }
  }

  /**==========================================================================
   * private properties/methods
   */

  _rootTag?: HTMLElement

  _palEvents?: string[]
  _palParams?: { [k: string]: string }

  _signIn = async (o: EmbedSignInOptions) => {
    await accountStore.waitStorageLoaded()
    // reassign options on each sign in
    embedApi._palEvents = o.palEvents
    embedApi._palParams = parsePalParams(o)
    // check if cleanup existing account
    if (o.clearExistingAccount) {
      accountStore.accounts = []
      accountStore.accountData = []
    }
    // create map based on unique (host, port, tenant, user)
    const accountsMap = arrToMap(
      accountStore.accounts,
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
        accountStore.accounts.push(fr)
        firstAccountInOptions = firstAccountInOptions || fr
      }
    })
    await accountStore.saveAccountsToLocalStorageDebounced()
    // check if auto login
    if (!o.autoLogin) {
      return
    }
    const as = getAuthStore()
    if (firstAccountInOptions) {
      as.signIn(firstAccountInOptions)
      return
    }
    await as.autoSignInEmbed()
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
  const ea = accountStore.genEmptyAccount()
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
