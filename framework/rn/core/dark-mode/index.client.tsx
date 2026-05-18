'use client'

import BrowserCookies from 'js-cookie'
import { useSyncExternalStore } from 'react'

import {
  darkModeCookieKey,
  darkModeCookieMaxAge,
  darkModeDisabled,
  darkModeEnabled,
  darkModeToBolean,
} from '@/rn/core/dark-mode/config'
import { darkClassName, lightClassName } from '@/rn/core/tailwind'

let initialized = false
let currentDarkMode: boolean | undefined = undefined
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getSnapshot = () => {
  if (!initialized) {
    initialized = true
    currentDarkMode = darkModeToBolean(BrowserCookies.get(darkModeCookieKey))
  }
  return currentDarkMode
}
// the value is resolved using cookie on initial hydrate
const getSnapshotServer = getSnapshot

export const useDarkModeUser = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSetDarkMode = () => (v: boolean | undefined) => {
  const list = document.documentElement.classList
  list.remove(darkClassName)
  list.remove(lightClassName)

  if (v === true) {
    list.add(darkClassName)
    BrowserCookies.set(darkModeCookieKey, darkModeEnabled, {
      expires: darkModeCookieMaxAge,
    })
  } else if (v === false) {
    list.add(lightClassName)
    BrowserCookies.set(darkModeCookieKey, darkModeDisabled, {
      expires: darkModeCookieMaxAge,
    })
  } else {
    BrowserCookies.remove(darkModeCookieKey)
  }

  currentDarkMode = v
  listeners.forEach(cb => cb())
}
