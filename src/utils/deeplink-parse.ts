import qs from 'qs'
import Url from 'url-parse'

import type { Account } from '#/stores/accountStore'

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
    location.query || qs.parse((location as any).search.replace(/^\?*/, '')),
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
  // detect custom page URL: host is "custompage", map ?id= to customPageId
  if (location.hostname === 'custompage') {
    params.customPageId = params['id']
    delete params['id']
    // clear host so it's not mistaken for a PBX hostname
    params.host = ''
    params.port = ''
  } else {
    if (!params.host) {
      params.host = location.hostname
    }
    if (!params.port) {
      params.port = '' + location.port
    }
  }
  //
  if (!params.password) {
    params.password = ''
  }
  //
  return params as any as UrlParams
}

export interface UrlParams {
  user: string
  password: string
  tenant: string
  host: string
  port: string
  phone_idx: string
  _wn: string
  number: string | undefined
  customPageId: string | undefined
  turn?: string
  turn_transport?: string
  turn_user?: string
  turn_pass?: string
  uc?: string
  parks?: string
}

export const toAccountSettings = (p: UrlParams): Partial<Account> => {
  const s: Partial<Account> = {}

  if (p.turn !== undefined) {
    if (p.turn === '0' || p.turn === 'false') {
      s.pbxTurnEnabled = false
    } else if (p.turn === '1' || p.turn === 'true') {
      s.pbxTurnEnabled = true
      s.pbxTurnServer = ''
    } else if (/^[A-Za-z0-9.-]+(:\d{1,5})?$/.test(p.turn)) {
      s.pbxTurnEnabled = true
      s.pbxTurnServer = p.turn
    }
  }

  if (p.turn_transport !== undefined) {
    if (
      p.turn_transport === 'udp' ||
      p.turn_transport === 'tcp' ||
      p.turn_transport === 'tls'
    ) {
      s.pbxTurnTransport = p.turn_transport
    }
  }

  if (p.turn_user !== undefined) {
    s.pbxTurnUsername = p.turn_user
  }

  if (p.turn_pass !== undefined) {
    s.pbxTurnPassword = p.turn_pass
  }

  if (p.uc !== undefined) {
    if (p.uc === '1' || p.uc === 'true') {
      s.ucEnabled = true
    } else if (p.uc === '0' || p.uc === 'false') {
      s.ucEnabled = false
    }
  }

  if (p.parks !== undefined) {
    const numbers: string[] = []
    const names: string[] = []

    if (p.parks !== '') {
      const items = p.parks.split(',')
      for (const item of items) {
        const parts = item.split(':')
        const numberStr = parts[0].trim()
        const name = parts.length > 1 ? parts.slice(1).join(':').trim() : ''

        if (numberStr !== '') {
          numbers.push(numberStr)
          names.push(name)
        }
      }
    }

    if (p.parks === '' || numbers.length) {
      s.parks = numbers
      s.parkNames = names
    }
  }

  return s
}
