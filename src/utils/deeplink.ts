import { Linking } from 'react-native'

import { compareProfile, getAuthStore } from '../stores/authStore'
import parse, { UrlParams } from './deeplink-parse'

let alreadyHandleFirstOpen = false
let urlParams: UrlParams | null = null

const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(urlParams)
  }
  alreadyHandleFirstOpen = true
  return Linking.getInitialURL().then(parse)
}

const setUrlParams = (p: UrlParams) => {
  urlParams = p
}

Linking.addEventListener('url', e => {
  const p = (urlParams = parse(e.url))
  // Check against the current user
  if (
    !p ||
    !getAuthStore().currentProfile ||
    compareProfile(getAuthStore().currentProfile, {
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

export { getUrlParams, setUrlParams }
