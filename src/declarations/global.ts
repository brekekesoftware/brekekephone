export type TFlatten<T> = {} & {
  [k in keyof T]: T[k]
}
export type TImmutable<T> = T extends
  | Function
  | boolean
  | number
  | string
  | null
  | undefined
  ? T
  : T extends Array<infer A>
  ? ReadonlyArray<Immutable<A>>
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<Immutable<K>, Immutable<V>>
  : T extends Set<infer S>
  ? ReadonlySet<Immutable<S>>
  : { readonly [K in keyof T]: Immutable<T[K]> }

declare global {
  type Flatten<T> = TFlatten<T>
  type Immutable<T> = TImmutable<T>
}
