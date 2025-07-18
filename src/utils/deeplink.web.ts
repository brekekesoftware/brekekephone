import type Url from 'url-parse'

import { parse } from '#/utils/deeplink-parse'

let alreadyHandleFirstOpen = false
const params = parse(window.location as any as Url<any>)

export const getUrlParams = () => {
  if (alreadyHandleFirstOpen) {
    return Promise.resolve(null)
  }
  alreadyHandleFirstOpen = true
  return Promise.resolve(params)
}
