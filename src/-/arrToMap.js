import get from 'lodash/get';

const f = v => typeof v === `function`;

const arrToMap = (arr, k, v) => {
  return arr.reduce((m, item, i) => {
    const key = f(k) ? k(item, i) : k ? get(item, k) : item;
    const val = f(v) ? v(item, i) : v ? get(item, v) : true;
    m[key] = val;
    return m;
  }, {});
};

const mapToMap = (map, k, v) => {
  return Object.entries(map).reduce((m, [ik, item], i) => {
    const key = f(k) ? k(ik, i) : k ? get(item, k) : ik;
    const val = f(v) ? v(ik, i) : v ? get(item, v) : true;
    m[key] = val;
    return m;
  }, {});
};

export { mapToMap };
export default arrToMap;
