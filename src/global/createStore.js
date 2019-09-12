import get from 'lodash/get';
import set from 'lodash/set';
import { action, runInAction } from 'mobx';

const createStore = () => {
  const ctx = {
    set: action((k, v) => {
      set(ctx, k, v);
    }),
    closureSet: (...args) => v => {
      ctx.set(args[0], args.length > 1 ? args[1] : v);
    },
    setFn: (k, fn) => {
      const v = get(ctx, k);
      if (!v || typeof v !== 'object') {
        throw new Error(
          `BaseStore.setFn: Expect ${k} to be an array or object but found ${v}`,
        );
      }
      action(fn)(v);
    },
    upsert: (k, _v, n = 'id') => {
      const arr = get(ctx, k);
      if (!Array.isArray(arr)) {
        throw new Error(
          `BaseStore.upsert: Expect ${k} to be an array but found ${arr}`,
        );
      }
      const v = arr.find(v => v[n] === _v[n]);
      runInAction(() => (v ? Object.assign(v, _v) : arr.push(_v)));
    },
    remove: (k, id, n = 'id') => {
      const arr = get(ctx, k);
      if (!Array.isArray(arr)) {
        throw new Error(
          `BaseStore.remove: Expect ${k} to be an array but found ${arr}`,
        );
      }
      const newArr = arr.filter(v => v[n] !== id);
      ctx.set(k, newArr);
    },
  };
  return ctx;
};

export default createStore;
