import './polyfill'

import { runApp } from '..'
import { getAuthStore } from '../stores/authStore'
import {
  getAccountUniqueId,
  Profile,
  profileStore,
} from '../stores/profileStore'
import { arrToMap } from '../utils/toMap'
import { asComponent } from './asComponent'

type Account = {
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
  accounts: Account[]
}
const convertToStorage = (a: Account): Profile => {
  const p = profileStore.genEmptyProfile()
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
const copyToStorage = (fr: Profile, to: Profile) => {
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
  await profileStore.profilesLoaded()
  if (o.clear_existing_account) {
    profileStore.profiles = []
    profileStore.profileData = []
  }
  const profilesMap = arrToMap(
    profileStore.profiles,
    getAccountUniqueId,
    (p: Profile) => p,
  ) as { [k: string]: Profile }
  o.accounts.forEach(a => {
    const fr = convertToStorage(a)
    const to = profilesMap[getAccountUniqueId(fr)]
    if (to) {
      copyToStorage(fr, to)
    } else {
      profileStore.profiles.push(fr)
    }
  })
  await profileStore.saveProfilesToLocalStorage()
  if (o.auto_login) {
    await getAuthStore().autoSignIn()
  }
}
const render = (div: HTMLElement, o: Options) => {
  renderAsync(div, o)
  return asComponent
}

window.Brekeke.Phone.render = render
