import { useRef } from 'react'

import { CreatedStore, createStore } from './createStore'

export const useStore = (mixin?: Function) => {
  const r = useRef<CreatedStore>()
  if (!r.current) {
    if (mixin && typeof mixin !== 'function') {
      throw new Error(`useStore: mixin must be a function, found ${mixin}`)
    }
    const op = () => ({})
    r.current = createStore(mixin || op)
  }
  return r.current
}
