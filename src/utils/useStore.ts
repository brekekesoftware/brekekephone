import { useRef } from 'react'

import createStore from './createStore'

const useStore = (mixin?: Function) => {
  const r = useRef<ReturnType<typeof createStore>>()
  if (!r.current) {
    if (mixin && typeof mixin !== 'function') {
      throw new Error(`useStore: mixin must be a function, found ${mixin}`)
    }
    r.current = createStore(mixin)
  }
  return r.current
}

export default useStore
