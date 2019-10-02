import get from 'lodash/get';

export const arrToMap = (arr, k, v) =>
  arr.reduce(
    (m, item, i) => ({
      ...m,
      [typeof k === `function` ? k(item, i) : k ? get(item, k) : item]:
        typeof v === `function` ? v(item, i) : v ? get(item, v) : true,
    }),
    {},
  );
export const mapToMap = (map, k, v) =>
  arrToMap(
    Object.keys(map),
    typeof k === `function` ? k : ki => (k ? get(map[ki], k) : ki),
    typeof v === `function` ? v : ki => (v ? get(map[ki], v) : true),
  );
