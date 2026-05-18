'use client'

import { useSyncExternalStore } from 'react'

import type { ClassName } from '@/rn/core/tw/class-name'

let initialized = false
let cache: ReturnType<typeof getInsets> = undefined

const subscribe = (cb: () => void) => {
  const fn = () => {
    cache = undefined
    cb()
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fn)
  } else {
    window.addEventListener('resize', fn)
  }
  return () => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', fn)
    } else {
      window.removeEventListener('resize', fn)
    }
  }
}

const getSnapshot = () => {
  if (!initialized) {
    initialized = true
    cache = getInsets()
  }
  return cache
}
// server has no method to get safe area
// the value is not available on hydrate
const getSnapshotServer = () => undefined

const useSafeAreaInsetsOriginal = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSafeAreaInsets = (): ClassName => useSafeAreaInsetsOriginal()

export const useSafeAreaPadding = (): ClassName => {
  const d = useSafeAreaInsetsOriginal()
  return (
    d && {
      paddingTop: d.top,
      paddingRight: d.right,
      paddingBottom: d.bottom,
      paddingLeft: d.left,
    }
  )
}

export const useSafeAreaPaddingTop = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.top
  return v && { paddingTop: v }
}
export const useSafeAreaPaddingRight = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.right
  return v && { paddingRight: v }
}
export const useSafeAreaPaddingBottom = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.bottom
  return v && { paddingBottom: v }
}
export const useSafeAreaPaddingLeft = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.left
  return v && { paddingLeft: v }
}

const getInsets = () => {
  const style = window.getComputedStyle(document.documentElement)
  // meta viewport must be configured properly in html
  // corresponding variables must be set in css
  const [top, left, bottom, right] = ['t', 'l', 'b', 'r']
    .map(v =>
      style
        .getPropertyValue(`--safe-area-inset-${v}`)
        .trim()
        .replace(/[^\d.]/g, ''),
    )
    .map(v => Number(v) || 0)
  if (!top && !left && !bottom && !right) {
    return
  }
  return { top, left, bottom, right }
}
