import { clsx } from '@/rn/core/tw/clsx'
import { set } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

type ClassNames<Map> = {
  [K in keyof Map]?: string
}

type AttrClassName<Map> = Map extends undefined ? string : ClassNames<Map>
type Attr<Map> = StrMap<AttrClassName<Map>>
type Attrs<Map> = StrMap<Attr<Map>>

type VariantOptions<Map, A extends Attrs<Map>> = {
  // taken from cva to convert string to boolean if match
  [K in keyof A]?: keyof A[K] extends 'true' | 'false' ? boolean : keyof A[K]
}

type CompoundVariant<Map, A extends Attrs<Map>> = VariantOptions<Map, A> &
  (Map extends undefined
    ? { className: string }
    : { classNames: ClassNames<Map> })

type GetCvaOptions<Map, A extends Attrs<Map>> = VariantOptions<Map, A>
type GetCva<Map, A extends Attrs<Map>> = (
  options: GetCvaOptions<Map, A>,
) => Map extends undefined ? string : ClassNames<Map>

type CvaOptions<Map, A extends Attrs<Map>> = {
  className?: string
  classNames?: Map
  attributes?: A
  compoundVariants?: CompoundVariant<Map, A>[]
}
type Cva = <Map extends StrMap<string>, A extends Attrs<Map>>(
  options: CvaOptions<Map, A>,
) => GetCva<Map, A>

export type Variant<Fn extends GetCva<any, any>> = Parameters<Fn>[0]

export const cva: Cva =
  ({ className, classNames, attributes, compoundVariants }) =>
  variant => {
    const map: StrMap = {}
    const rootKey = ''

    pushClassName(map, rootKey, className)
    pushClassNames(map, classNames)

    let computedVariant: StrMap | undefined = undefined
    if (variant) {
      if (!computedVariant) {
        computedVariant = {}
      }
      for (const [k, v] of Object.entries(variant)) {
        if (v === undefined || v === null) {
          continue
        }
        set(computedVariant, k, v)
      }
    }

    if (computedVariant) {
      for (const [k, v] of Object.entries(computedVariant)) {
        const attr = attributes?.[k]?.[v as string]
        if (!attr) {
          continue
        }
        if (typeof attr === 'string') {
          pushClassName(map, rootKey, attr)
        } else {
          pushClassNames(map, attr)
        }
      }
      if (compoundVariants) {
        for (const {
          className: compoundClassName,
          classNames: compoundClassNames,
          ...compound
        } of compoundVariants) {
          let match: boolean | undefined = undefined
          for (const [k2, v2] of Object.entries(compound)) {
            if (computedVariant[k2] !== v2) {
              match = false
            } else if (match === undefined) {
              match = true
            }
          }
          if (match) {
            pushClassName(map, rootKey, compoundClassName)
            pushClassNames(map, compoundClassNames)
          }
        }
      }
    }

    if (className) {
      return clsx(map[rootKey])
    }

    delete map[rootKey]
    for (const [k, v] of Object.entries(map)) {
      map[k] = clsx(v)
    }
    return map as any
  }

const pushClassName = <T>(map: StrMap<T[]>, k: string, className: any) => {
  if (!className) {
    return
  }
  if (Array.isArray(className)) {
    for (const v of className) {
      pushClassName(map, k, v)
    }
    return
  }
  const arr = map[k]
  if (!arr) {
    map[k] = [className]
  } else {
    arr.push(className)
  }
}
const pushClassNames = <T>(map: StrMap<T[]>, classNames: any) => {
  if (!classNames) {
    return
  }
  for (const [k, v] of Object.entries(classNames)) {
    pushClassName(map, k, v)
  }
}
