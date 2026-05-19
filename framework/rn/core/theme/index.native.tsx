'use client'

import { useSyncExternalStore } from 'react'

import { themeCookieKey, toValidTheme } from '@/rn/core/theme/config'
import { storage } from '@/rn/storage'

let currentTheme: string | undefined = undefined
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getSnapshot = () => currentTheme
// the value is empty on initial hydrate
const getSnapshotServer = getSnapshot

export const useTheme = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSetTheme = () => async (v: string | undefined) => {
  v = toValidTheme(v)
  if (v !== undefined) {
    await storage.setItem(themeCookieKey, v)
  } else {
    await storage.removeItem(themeCookieKey)
  }
  currentTheme = v
  listeners.forEach(cb => cb())
}

export const initThemeNative = async () => {
  const v = await storage.getItem(themeCookieKey)
  currentTheme = toValidTheme(v)
}
