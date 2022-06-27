import './asComponent/polyfill'
import './utils/captureConsoleOutput'
import './polyfill'
import './utils/validator'
import './stores/Nav2' // Fix circular dependencies
import './stores/authStore2' // Fix circular dependencies
import './api/syncPnToken2' // Fix circular dependencies

import { configure, onReactionError } from 'mobx'
import { AppRegistry } from 'react-native'

import { asComponent } from './asComponent/asComponent'
import { App } from './components/App'
import {
  Account,
  accountStore,
  getAccountUniqueId,
} from './stores/accountStore'
import { getAuthStore } from './stores/authStore'
import { callStore } from './stores/callStore'
import { setCallStore } from './stores/cancelRecentPn'
import { arrToMap } from './utils/toMap'

configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  observableRequiresReaction: false,
  reactionRequiresObservable: false,
  disableErrorBoundaries: false,
})
onReactionError((err: Error) => {
  console.error('onEractionError', err)
})

setCallStore(callStore)
AppRegistry.registerComponent('BrekekePhone', () => App)

const runApp = (rootTag: HTMLElement | null) => {
  AppRegistry.runApplication('BrekekePhone', { rootTag })
}

if (window._BrekekePhoneWebRoot) {
  runApp(window._BrekekePhoneWebRoot)
}

//
// Brekeke Phone as component api

type ComponentAccount = {
  hostname: string
  port: string
  tenant?: string
  username: string
  password?: string
  uc?: boolean
  parks?: string[]
  parkNames?: string[]
}
type Options = {
  auto_login?: boolean
  clear_existing_account?: boolean
  accounts: ComponentAccount[]
}
const convertToStorage = (a: ComponentAccount): Account => {
  const p = accountStore.genEmptyAccount()
  p.pbxHostname = a.hostname || ''
  p.pbxPort = a.port || ''
  p.pbxTenant = a.tenant || ''
  p.pbxUsername = a.username || ''
  p.pbxPassword = a.password || ''
  p.ucEnabled = a.uc || false
  p.parks = a.parks || []
  p.parkNames = a.parkNames || []
  return p
}
const copyToStorage = (fr: Account, to: Account) => {
  to.pbxHostname = fr.pbxHostname
  to.pbxPort = fr.pbxPort
  to.pbxTenant = fr.pbxTenant
  to.pbxUsername = fr.pbxUsername
  to.pbxPassword = fr.pbxPassword
  to.ucEnabled = fr.ucEnabled
  to.parks = fr.parks
  to.parkNames = fr.parkNames
}

const renderAsync = async (div: HTMLElement, o: Options) => {
  runApp(div)
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
  o.accounts.forEach(a => {
    const fr = convertToStorage(a)
    const to = accountsMap[getAccountUniqueId(fr)]
    if (to) {
      copyToStorage(fr, to)
    } else {
      accountStore.accounts.push(fr)
    }
  })
  await accountStore.saveAccountsToLocalStorage()
  if (o.auto_login) {
    await getAuthStore().autoSignIn()
  }
}
const render = (div: HTMLElement, o: Options) => {
  renderAsync(div, o)
  return asComponent
}

window.Brekeke.Phone.render = render
