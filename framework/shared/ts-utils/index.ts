import type { PickByValue, PickByValueExact } from 'utility-types'

export * from 'utility-types'

type Primitive = Date | Function

export type DeepMerge<T> = {} & {
  [k in keyof T]: T[k] extends Primitive
    ? T[k]
    : T[k] extends Array<infer U>
      ? Array<DeepMerge<U>>
      : T[k] extends object
        ? DeepMerge<T[k]>
        : T[k]
}

export type PartialPick<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type PartialOmit<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>

export type Undefined<T = never> = T | undefined | void
export type Nullish<T = never> = Undefined<T> | null
export type Falsish<T = never> = Nullish<T> | false | 0 | ''

export type NonUndefined<T> = Exclude<T, undefined | void>
export type NonNullish<T> = Exclude<T, null | undefined | void>
export type NonFalsish<T> = Exclude<T, null | undefined | void | false | 0 | ''>

export type VPromise<T = never> = Undefined<Promise<Undefined<T>>>
export type NPromise<T = never> = Nullish<Promise<Nullish<T>>>
export type FPromise<T = never> = Falsish<Promise<Falsish<T>>>

type Split<T, K extends keyof T> = K extends unknown
  ? { [I in keyof T]: I extends K ? T[I] : never }
  : never
export type Explode<T> = Split<T, keyof T>

export type UpperFirst<S> = S extends string
  ? S extends `${infer P1}${infer P2}`
    ? `${Uppercase<P1>}${P2}`
    : S
  : never
export type LowerFirst<S> = S extends string
  ? S extends `${infer P1}${infer P2}`
    ? `${Lowercase<P1>}${P2}`
    : S
  : never

export type KeysByValue<T, U> = keyof PickByValue<T, U>
export type KeysByValueExact<T, U> = keyof PickByValueExact<T, U>

export type UndefinedKeys<T> = Exclude<keyof T, NonUndefinedKeys<T>>
export type OmitUndefined<T> = Omit<T, UndefinedKeys<T>>
export type PickUndefined<T> = Pick<T, UndefinedKeys<T>>

export type NonUndefinedKeys<T> = Exclude<
  KeysByValue<T, Exclude<T[keyof T], undefined>>,
  undefined
>
export type OmitNonUndefined<T> = Omit<T, NonUndefinedKeys<T>>
export type PickNonUndefined<T> = Pick<T, NonUndefinedKeys<T>>

export type DefaultProps<
  T,
  K,
  R = Pick<T, Extract<K, keyof T>>,
> = OmitUndefined<R> & Partial<PickUndefined<R>>
export type PartialDefaultProps<
  T,
  K,
  D = DefaultProps<T, K>,
  ND = Omit<T, keyof D>,
> = OmitUndefined<ND> & Partial<PickUndefined<ND>> & Partial<D>

// https://stackoverflow.com/a/57117594/9214970
export type NoExtra<T, U extends Partial<T> = T> = U & {
  [K in Exclude<keyof U, keyof T>]: never
}

export type StrMap<T = any> = Record<string, T>
export type FnAny<T = any> = (...args: any[]) => T
export type OrArr<T> = T | T[]

export type ValueProps<T> = {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}
export type SingleProps<T = string> = ValueProps<T> & {
  multiple?: false
}
export type MultipleProps<T = string> = ValueProps<T[]> & {
  multiple: true
}
export type SingleOrMultipleProps<T = string> =
  | SingleProps<T>
  | MultipleProps<T>
