import { Linking } from 'react-native'
import type Url from 'url-parse'

import { parse } from '#/utils/deeplink-parse'

// Vite dev loads native ES modules: a name deeplink.ts exports but this file lacks stops the whole page
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

const params = parse(window.location as any as Url<any>)

export const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(null)
  }
  alreadyHandleFirstOpen = true
  return Promise.resolve(params)
}

export const clearUrlParams = () => {}
export const cleanUpDeepLink = () => {}
