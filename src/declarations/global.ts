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

type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
export type TRequiredKeys<T> = Exclude<
  KeysOfType<T, Exclude<T[keyof T], undefined>>,
  undefined
>
export type TOptionalKeys<T> = Exclude<keyof T, TRequiredKeys<T>>

declare global {
  type Flatten<T> = TFlatten<T>
  type Immutable<T> = TImmutable<T>
  type RequiredKeys<T> = TRequiredKeys<T>
  type OptionalKeys<T> = TOptionalKeys<T>
}
