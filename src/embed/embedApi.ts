import EventEmitter from 'eventemitter3'
import { unmountComponentAtNode } from 'react-dom'

import { MakeCallFn } from '../api/brekekejs'
import {
  Account,
  accountStore,
  getAccountUniqueId,
} from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { arrToMap } from '../utils/toMap'
import { waitTimeout } from '../utils/waitTimeout'
import { webPromptPermission } from '../utils/webPromptPermission'

export type EmbedSignInOptions = {
  auto_login?: boolean
  clear_existing_account?: boolean
  accounts: EmbedAccount[]
} & { [k: string]: string }

export class EmbedApi extends EventEmitter {
  promptBrowserPermission = webPromptPermission

  getCurrentAccount = () => getAuthStore().getCurrentAccount()

  call: MakeCallFn = (...args) => getCallStore().startCall(...args)
  getRunningCalls = () => getCallStore().calls

  restart = async (o: EmbedSignInOptions) => {
    getAuthStore().signOutWithoutSaving()
    await waitTimeout()
    await this._signIn(o)
  }

  cleanup = () => {
    getAuthStore().signOutWithoutSaving()
    if (this._rootTag) {
      unmountComponentAtNode(this._rootTag)
    }
  }

  _rootTag?: HTMLElement
  _palParams?: { [k: string]: string }

  _signIn = async (o: EmbedSignInOptions) => {
    await accountStore.waitStorageLoaded()
    if (o.clear_existing_account) {
      accountStore.accounts = []
      accountStore.accountData = []
    }
    const accountsMap = arrToMap(
      accountStore.accounts,
      getAccountUniqueId,
      (p: Account) => p,
    ) as { [k: string]: Account }
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
    if (!o.auto_login) {
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
