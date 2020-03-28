import get from 'lodash/get';
import set from 'lodash/set';
import { extendObservable } from 'mobx';

const createStore = (mixin, ...args) => {
  const $ = {
    set: (k, v) => {
      set($, k, typeof v === 'function' ? v(get($, k)) : v);
    },
    upsert: (k, v, idKey = 'id') => {
      $.set(k, arr => {
        const updated = arr.reduce((u, _v) => {
          if (!u && _v[idKey] === v[idKey]) {
            Object.assign(_v, v);
            return true;
          }
          return u;
        }, false);
        if (!updated) {
          arr.push(v);
        }
        return arr;
      });
    },
    remove: (k, id, idKey = 'id') => {
      $.set(k, arr => arr.filter(v => v[idKey] !== id));
    },
    extends: (mx, ...a) => {
      if (!mx) {
        return;
      }
      if (typeof mx === 'function') {
        mx = mx($, ...a);
      }
      (mx.observable ? Object.keys(mx.observable) : [])
        .concat(Object.keys(mx))
        .forEach(k => {
          if (k in $) {
            throw new Error(`createStore.extends: Duplicated key ${k}`);
          }
        });
      extendObservable($, mx.observable);
      delete mx.observable;
      Object.assign($, mx);
    },
  };
  $.extends(mixin, ...args);
  return $;
};

export default createStore;
