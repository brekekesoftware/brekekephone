import { Linking } from 'react-native'

import { compareAccount, getAuthStore } from '../stores/authStore'
import { parse, UrlParams } from './deeplink-parse'

let alreadyHandleFirstOpen = false
let urlParams: UrlParams | null = null

export const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(urlParams)
  }
  alreadyHandleFirstOpen = true
  Linking.addEventListener('url', e => {
    urlParams = parse(e.url)
    getAuthStore().handleUrlParams()
  })
  return Linking.getInitialURL().then(parse)
}

Linking.addEventListener('url', e => {
  const p = (urlParams = parse(e.url))
  const cp = getAuthStore().currentProfile
  // Check against the current user
  if (
    !p ||
    !cp ||
    compareAccount(cp, {
      pbxHostname: p.host,
      pbxPort: p.port,
      pbxUsername: p.user,
      pbxTenant: p.tenant,
    })
  ) {
    return
  }
  getAuthStore().handleUrlParams()
})
