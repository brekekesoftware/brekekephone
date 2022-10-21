import { parsePalParams } from '../api/parsePalParams'
import {
  Account,
  accountStore,
  getAccountUniqueId,
} from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { arrToMap } from '../utils/toMap'
import { embedApi } from './embedApi'

type EmbedAccount = {
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
  accounts: EmbedAccount[]
} & { [k: string]: string }

const convertToStorage = (a: EmbedAccount): Account => {
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

const renderAsync = async (o: Options) => {
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

export const exposeEmbedApi = (runApp: (rootTag: HTMLElement) => void) => {
  window.Brekeke.Phone.render = (div: HTMLElement, o: Options) => {
    runApp(div)
    renderAsync(o)
    embedApi.rootTag = div
    embedApi.palParams = parsePalParams(o)
    return embedApi
  }
}
