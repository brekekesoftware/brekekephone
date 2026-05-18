'use client'

import BrowserCookies from 'js-cookie'
import { useSyncExternalStore } from 'react'

import {
  getAvailableThemes,
  getThemeClassName,
  themeCookieKey,
  themeCookieMaxAge,
  toValidTheme,
} from '@/rn/core/theme/config'

let initialized = false
// toValidTheme is only correct after initTheme is called
// so we set it undefined here and let useTheme handle it after initTheme is called
let currentTheme: string | undefined = undefined
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getSnapshot = () => {
  if (!initialized) {
    initialized = true
    currentTheme = toValidTheme(BrowserCookies.get(themeCookieKey))
  }
  return currentTheme
}
// the value is resolved using cookie on initial hydrate
const getSnapshotServer = getSnapshot

export const useTheme = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSetTheme = () => (v: string | undefined) => {
  const list = document.documentElement.classList
  for (const theme of getAvailableThemes()) {
    list.remove(theme.className as string)
  }

  v = toValidTheme(v)
  if (v) {
    const className = getThemeClassName(v)
    if (className) {
      list.add(className as string)
    }
    BrowserCookies.set(themeCookieKey, v, {
      expires: themeCookieMaxAge,
    })
  } else {
    BrowserCookies.remove(themeCookieKey)
  }

  currentTheme = v
  listeners.forEach(cb => cb())
}
