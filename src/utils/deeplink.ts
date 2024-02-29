import { Linking } from 'react-native'

import { compareAccount } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { parse, UrlParams } from './deeplink-parse'

let alreadyHandleFirstOpen = false
let urlParams: Promise<UrlParams | null> | UrlParams | null = null
export const URLSchemes = {
  phoneappli: {
    USERS: 'deeplink://directory?type=users',
    HISTORY_CALLED: 'deeplink://history?type=called',
  },
}

export const openLinkSafely = async (url: string) => {
  if (!url) {
    return
  }
  try {
    await Linking.openURL(url)
  } catch (error) {
    console.log(`Open ${url} get error: ${error}`)
  }
}
export const getUrlParams = async () => {
  if (alreadyHandleFirstOpen) {
    return urlParams
  }
  alreadyHandleFirstOpen = true
  Linking.addEventListener('url', e => {
    urlParams = parse(e.url)
    const ca = getAuthStore().getCurrentAccount()
    // check against the current user
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
export const clearUrlParams = () => {
  urlParams = null
}
