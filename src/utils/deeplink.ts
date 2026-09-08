import { Linking } from 'react-native'

import { compareAccountPartial } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import type { UrlParams } from '#/utils/deeplink-parse'
import { parse } from '#/utils/deeplink-parse'

export const urls = {
  phoneappli: {
    USERS: 'pa-rtk://directory?type=users',
    HISTORY_CALLED: 'pa-rtk://history?type=called',
  },
}

export const openLinkSafely = async (url: string) => {
  if (!url) {
    return
  }
  try {
    await Linking.openURL(url)
  } catch (err) {
    console.error(`Linking.openURL ${url} error: `, err)
  }
}

let alreadyHandleFirstOpen = false
export const isAlreadyHandleFirstOpen = () => alreadyHandleFirstOpen

let urlParams: Promise<UrlParams | null> | UrlParams | null = null
export const getUrlParams = async () => {
  if (alreadyHandleFirstOpen) {
    return urlParams
  }
  alreadyHandleFirstOpen = true
  Linking.addEventListener('url', e => {
    urlParams = parse(e.url)
    if (!urlParams) {
      return
    }
    // custom page URL has no account params → bypass account match check
    if (urlParams.customPageId) {
      ctx.auth.handleUrlParams()
      return
    }
    const ca = ctx.auth.getCurrentAccount()
    // check against the current user
    if (
      !ca ||
      compareAccountPartial(ca, {
        pbxHostname: urlParams.host,
        pbxPort: urlParams.port,
        pbxUsername: urlParams.user,
        pbxTenant: urlParams.tenant,
      })
    ) {
      return
    }
    ctx.auth.handleUrlParams()
  })
  urlParams = Linking.getInitialURL().then(parse)
  return urlParams
}

export const clearUrlParams = () => {
  urlParams = null
}
export const cleanUpDeepLink = () => {
  alreadyHandleFirstOpen = false
  urlParams = null
  Linking.removeAllListeners('url')
}
