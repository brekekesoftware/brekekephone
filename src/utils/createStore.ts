import get from 'lodash/get'
import set from 'lodash/set'
import { extendObservable } from 'mobx'

const createStore = (mixin: Function, ...args: unknown[]) => {
  const $ = {
    set: (k: string, v: unknown) => {
      set($, k, typeof v === 'function' ? v(get($, k)) : v)
    },
    upsert: (k: string, v: { [k: string]: unknown }, idKey = 'id') => {
      $.set(k, (arr: { [k: string]: unknown }[]) => {
        const updated = arr.reduce(
          (u: boolean, v0: { [k: string]: unknown }) => {
            if (!u && v0[idKey] === v[idKey]) {
              Object.assign(v0, v)
              return true
            }
            return u
          },
          false,
        )
        if (!updated) {
          arr.push(v)
        }
        return arr
      })
    },
    remove: (k: string, id: string, idKey = 'id') => {
      $.set(k, (arr: { [k: string]: unknown }[]) =>
        arr.filter(v => v[idKey] !== id),
      )
    },
    extends: (
      mx:
        | Function
        | {
            observable?: object
          },
      ...a: unknown[]
    ) => {
      if (!mx) {
        return
      }
      if (typeof mx === 'function') {
        mx = mx($, ...a)
      }
      if (typeof mx === 'function') {
        return
      }
      const ks = (mx.observable ? Object.keys(mx.observable) : []).concat(
        Object.keys(mx),
      )
      ks.forEach(k => {
        if (k in $) {
          throw new Error(`createStore.extends: Duplicated key ${k}`)
        }
      })
      if (mx.observable) {
        extendObservable($, mx.observable)
        delete mx.observable
      }
      Object.assign($, mx)
    },
  }
  $.extends(mixin, ...args)
  return $
}

export default createStore

export type CreatedStore = ReturnType<typeof createStore>
