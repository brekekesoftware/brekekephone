import get from 'lodash/get';
import set from 'lodash/set';
import { action, extendObservable } from 'mobx';

import mixinStore from './mixinStore';

const createStore = (mixin, ...args) => {
  const $ = {
    set: action((k, v) => {
      set($, k, typeof v === `function` ? v(get($, k)) : v);
    }),
    extends: (mx, ...a) => {
      if (!mx) {
        return;
      }
      if (mx === true) {
        mx = mixinStore;
      }
      if (typeof mx === `function`) {
        mx = mx($, ...a);
      }
      (mx.observable ? Object.keys(mx.observable) : [])
        .concat(Object.keys(mx))
        .forEach(
          k =>
            k in $ &&
            throw new Error(`createStore.extends: Duplicated key ${k}`),
        );
      extendObservable($, mx.observable);
      delete mx.observable;
      Object.assign($, mx);
    },
  };
  $.extends(mixin, ...args);
  return $;
};

export default createStore;
