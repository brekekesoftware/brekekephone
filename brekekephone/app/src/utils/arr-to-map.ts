export const arrToMap = <
  T extends string | number | object | undefined,
  K extends keyof T | Function | undefined = undefined,
  V = boolean,
>(
  arr: ArrayLike<T>,
  key?: keyof T | ((item: T, index: number) => unknown),
  value?: K | ((item: T, index: number) => V),
): {
  [k: string]: K extends undefined
    ? boolean
    : K extends Function
      ? V
      : K extends keyof T
        ? T[K]
        : never
} => {
  const map = {}
  const a = Array.isArray(arr) ? arr : Array.from(arr)
  a.forEach((item, index) => {
    const k =
      typeof key === 'function' ? key(item, index) : key ? item[key] : item
    const v =
      typeof value === 'function'
        ? value(item, index)
        : value
          ? item[String(value)]
          : true
    map[String(k)] = v
  })
  return map
}
