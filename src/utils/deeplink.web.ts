import Url from 'url-parse'

import { parse } from './deeplink-parse'

let alreadyHandleFirstOpen = false
const params = parse(window.location as unknown as Url<any>)

export const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(null)
  }
  alreadyHandleFirstOpen = true
  return Promise.resolve(params)
}
