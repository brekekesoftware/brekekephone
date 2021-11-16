import get from 'lodash/get'
import qs from 'qs'
import Url from 'url-parse'

export const parse = (location: string | Url<any> | null) => {
  if (!location) {
    return null
  }
  if (typeof location === 'string') {
    location = new Url(location, true)
  }
  //
  const params: { [k: string]: string } = Object.assign(
    qs.parse(location.hash.replace(/^[^?]*\?*/, '')),
    location.query || // type-coverage:ignore-line
      qs.parse((get(location, 'search') as string).replace(/^\?*/, '')),
  )
  //
  if (params.url) {
    const url = new Url(params.url)
    if (url.hostname) {
      params.host = url.hostname
    }
    if (url.port) {
      params.port = url.port
    } else if (/^ws:/.test(params.url)) {
      params.port = '80'
    } else {
      params.port = '443'
    }
  }
  //
  if (!params.host) {
    params.host = location.hostname
  }
  if (!params.port) {
    params.port = '' + location.port
  }
  //
  return params as unknown as UrlParams
}

export interface UrlParams {
  user: string
  tenant: string
  host: string
  port: string
  phone_idx: string
  _wn: string
}
