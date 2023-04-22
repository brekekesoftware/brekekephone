import { Linking } from 'react-native'

import { compareAccount } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { parse, UrlParams } from './deeplink-parse'

let alreadyHandleFirstOpen = false
let urlParams: Promise<UrlParams | null> | UrlParams | null = null

export const getUrlParams = async () => {
  if (alreadyHandleFirstOpen) {
    return urlParams
  }
  alreadyHandleFirstOpen = true
  Linking.addEventListener('url', e => {
    urlParams = parse(e.url)
    const ca = getAuthStore().getCurrentAccount()
    // Check against the current user
    if (
      !urlParams ||
      !ca ||
      compareAccount(ca, {
        pbxHostname: urlParams.host,
        pbxPort: urlParams.port,
        pbxUsername: urlParams.user,
        pbxTenant: urlParams.tenant,
      })
    ) {
      return
    }
    getAuthStore().handleUrlParams()
  })
  urlParams = Linking.getInitialURL().then(parse)
  return urlParams
}
