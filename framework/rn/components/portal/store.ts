'use client'

import type { ReactNode } from 'react'
import { useSyncExternalStore } from 'react'

export type PortalItem = {
  id: string
  node: ReactNode
  disableBodyScroll?: boolean
}

let items: PortalItem[] = []
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getSnapshot = () => items
// the value is empty on initial hydrate
const getSnapshotServer = getSnapshot

export const usePortalItems = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const addPortal = (
  id: string,
  node: ReactNode,
  disableBodyScroll?: boolean,
) => {
  const idx = items.findIndex(e => e.id === id)
  items =
    idx >= 0
      ? items.map((e, i) => (i === idx ? { id, node, disableBodyScroll } : e))
      : [...items, { id, node, disableBodyScroll }]
  listeners.forEach(cb => cb())
}

export const removePortal = (id: string) => {
  const next = items.filter(e => e.id !== id)
  if (next.length < items.length) {
    items = next
    listeners.forEach(cb => cb())
  }
}
