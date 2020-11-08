import get from 'lodash/get'

export const arrToMap = (
  arr: Array<unknown>,
  k?: string | Function,
  v?: string | Function,
) =>
  arr.reduce(
    (m, item, i) => ({
      ...(m as object),
      [typeof k === 'function' ? k(item, i) : k ? get(item, k) : item]:
        typeof v === 'function' ? v(item, i) : v ? get(item, v) : true,
    }),
    {},
  ) as object
export const mapToMap = (
  map: { [k: string]: unknown },
  k?: string | Function,
  v?: string | Function,
) =>
  arrToMap(
    Object.keys(map),
    typeof k === 'function' ? k : (ki: string) => (k ? get(map[ki], k) : ki),
    typeof v === 'function' ? v : (ki: string) => (v ? get(map[ki], v) : true),
  ) as object
