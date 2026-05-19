import type { ConfigAPI, PluginPass } from '@babel/core'

import { get } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

export const getIsServer = (
  pluginPass: PluginPass,
  callerIsServer: boolean | undefined,
): boolean | undefined => {
  const v: boolean | undefined = get(pluginPass.opts, 'isServer')
  if (typeof v === 'boolean') {
    return v
  }
  return callerIsServer
}

export const getCallerIsServer = (api: ConfigAPI): boolean | undefined => {
  let v: boolean | undefined = undefined
  // could be empty in traverse only mode without api
  if (typeof api?.caller !== 'function') {
    return
  }
  api.caller(c => {
    v = get(c, 'isServer')
    if (typeof v !== 'boolean') {
      v = undefined
    }
    return undefined
  })
  return v
}

export const getCallerClientOnly = (api: ConfigAPI): boolean | undefined => {
  let v: boolean | undefined = undefined
  // could be empty in traverse only mode without api
  if (typeof api?.caller !== 'function') {
    return
  }
  api.caller(c => {
    v = get(c, 'clientOnly')
    if (typeof v !== 'boolean') {
      v = undefined
    }
    return undefined
  })
  return v
}

export const getCallerClients = (api: ConfigAPI): string[] | undefined => {
  let v: string[] | undefined = undefined
  // could be empty in traverse only mode without api
  if (typeof api?.caller !== 'function') {
    return
  }
  api.caller(c => {
    v = get(c, 'clients')
    try {
      v = v && JSON.parse(v)
    } catch {
      v = undefined
    }
    if (!Array.isArray(v)) {
      v = undefined
    }
    return undefined
  })
  return v
}

export const getCallerAlias = (api: ConfigAPI): StrMap<string> | undefined => {
  let v: StrMap<string> | undefined = undefined
  // could be empty in traverse only mode without api
  if (typeof api?.caller !== 'function') {
    return
  }
  api.caller(c => {
    v = get(c, 'alias')
    try {
      v = v && JSON.parse(v)
    } catch {
      v = undefined
    }
    if (typeof v !== 'object') {
      v = undefined
    }
    return undefined
  })
  return v
}
